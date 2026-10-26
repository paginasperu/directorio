# Genera data/data.json anidado a partir de los CSV.
# Determinista: misma data + mismo SQL = mismo JSON.
# Tipos explícitos: el CSV entra todo como texto y aquí se decide qué es número.
# whatsapp, telefono_fijo y tienda se quedan texto: son identificadores.

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
      imagen
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
