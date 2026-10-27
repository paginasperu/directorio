# Genera data/data.json anidado a partir de los CSV.
# Determinista: misma data + mismo SQL = mismo JSON.
# Tipos explícitos: el CSV entra todo como texto y aquí se decide qué es número.
# whatsapp, telefono_fijo y tienda se quedan texto: son identificadores.

import json
import sys
from pathlib import Path

import duckdb

SQL = """
COPY (
  WITH n AS (
    SELECT
      TRY_CAST(id AS INTEGER) AS id,
      nombre,
      TRY_CAST(piso AS INTEGER) AS piso,
      tienda,
      whatsapp,
      telefono_fijo,
      instagram,
      facebook,
      tiktok,
      categoria,
      tipo,
      descripcion_corta,
      descripcion_larga,
      catalogo,
      busqueda,
      logo,
      banner
    FROM read_csv('data/negocios.csv', header = true, all_varchar = true)
  ),
  p AS (
    SELECT
      TRY_CAST(id AS INTEGER) AS id,
      TRY_CAST(negocio_id AS INTEGER) AS negocio_id,
      titulo,
      descripcion,
      condiciones,
      vigencia_hasta,
      TRY_CAST(precio_regular AS DOUBLE) AS precio_regular,
      TRY_CAST(precio_rebajado AS DOUBLE) AS precio_rebajado,
      categoria,
      tipo,
      modalidad,
      banner
    FROM read_csv('data/promociones.csv', header = true, all_varchar = true)
  )
  SELECT n.*, coalesce(list(p ORDER BY p.id) FILTER (WHERE p.id IS NOT NULL), []) AS promociones
  FROM n
  LEFT JOIN p ON p.negocio_id = n.id
  GROUP BY ALL
  ORDER BY n.id
) TO 'data/data.json' (ARRAY true)
"""

HUERFANAS = """
SELECT p.id, p.negocio_id, p.titulo
FROM read_csv('data/promociones.csv', header = true, all_varchar = true) p
LEFT JOIN read_csv('data/negocios.csv', header = true, all_varchar = true) n ON n.id = p.negocio_id
WHERE n.id IS NULL
ORDER BY TRY_CAST(p.id AS INTEGER)
"""

con = duckdb.connect()
huerfanas = con.sql(HUERFANAS).fetchall()

if huerfanas:
    print(f"AVISO: {len(huerfanas)} promociones huérfanas (negocio_id inexistente):")
    for fila in huerfanas:
        print("  -", fila)
else:
    print("valida: 0 promociones huérfanas")

con.sql(SQL)
print("ok: data/data.json")

# Muestra reducida para generadores de UI: 10 negocios, URLs absolutas y dos CSV.
# Uso: python tools/dataset.py --demo
if "--demo" in sys.argv:
    import csv

    data = json.loads(Path("data/data.json").read_text(encoding="utf-8"))
    base = "https://directorio.oficial.pe/"
    LIMITE = 10

    seleccion = []

    def agregar(negocio):
        if negocio and all(x["id"] != negocio["id"] for x in seleccion):
            seleccion.append(negocio)

    # Casos raros primero, luego variedad de categorías.
    agregar(max(data, key=lambda n: len(n["nombre"])))
    agregar(next((n for n in data if not n["whatsapp"] and n["telefono_fijo"]), None))

    categorias = set()
    for negocio in data:
        if len(seleccion) >= LIMITE:
            break
        if negocio["categoria"] in categorias:
            continue
        sin_whatsapp = sum(1 for x in seleccion if not x["whatsapp"])
        if not negocio["whatsapp"] and sin_whatsapp >= 4:
            continue
        categorias.add(negocio["categoria"])
        agregar(negocio)

    for negocio in data:
        if len(seleccion) >= LIMITE:
            break
        agregar(negocio)

    muestra = sorted(seleccion[:LIMITE], key=lambda n: n["id"])

    recorte = []
    for negocio in muestra:
        recorte.append({
            "id": negocio["id"],
            "nombre": negocio["nombre"],
            "piso": negocio["piso"],
            "tienda": negocio["tienda"],
            "categoria": negocio["categoria"],
            "tipo": negocio["tipo"],
            "whatsapp": negocio["whatsapp"],
            "telefono_fijo": negocio["telefono_fijo"],
            "descripcion_corta": negocio["descripcion_corta"],
            "logo": base + negocio["logo"],
            "banner": base + negocio["banner"],
            "promociones": [
                {
                    "id": promo["id"],
                    "titulo": promo["titulo"],
                    "tipo": promo["tipo"],
                    "modalidad": promo["modalidad"],
                    "precio_regular": promo["precio_regular"],
                    "precio_rebajado": promo["precio_rebajado"],
                    "vigencia_hasta": promo["vigencia_hasta"],
                    "banner": base + promo["banner"],
                }
                for promo in negocio["promociones"]
            ],
        })

    Path("data/muestra.txt").write_text(
        json.dumps(recorte, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    ids = {str(n["id"]) for n in muestra}
    for origen, destino, clave, columnas in [
        ("data/negocios.csv", "data/muestra-negocios.csv", "id", ["logo", "banner"]),
        ("data/promociones.csv", "data/muestra-promociones.csv", "negocio_id", ["banner"]),
    ]:
        filas = [
            f for f in csv.DictReader(open(origen, encoding="utf-8-sig", newline=""))
            if f[clave] in ids
        ]
        for fila in filas:
            for columna in columnas:
                if fila.get(columna) and not fila[columna].startswith("http"):
                    fila[columna] = base + fila[columna]
        with open(destino, "w", encoding="utf-8", newline="") as salida:
            escritor = csv.DictWriter(salida, fieldnames=list(filas[0].keys()), lineterminator="\r\n")
            escritor.writeheader()
            escritor.writerows(filas)

    print(f"ok: data/muestra.txt ({len(recorte)} negocios)")
    print(f"ok: data/muestra-negocios.csv ({len(muestra)} filas)")
    print(f"ok: data/muestra-promociones.csv ({sum(len(n['promociones']) for n in recorte)} filas)")
