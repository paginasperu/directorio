# Genera data/data.json anidado a partir de los CSV.
# Determinista: misma data + mismo SQL = mismo JSON.

import duckdb

SQL = """
COPY (
  SELECT n.*, coalesce(list(p ORDER BY p.id) FILTER (WHERE p.id IS NOT NULL), []) AS promociones
  FROM read_csv_auto('data/negocios.csv', header = true) n
  LEFT JOIN read_csv_auto('data/promociones.csv', header = true) p ON p.negocio_id = n.id
  GROUP BY ALL
  ORDER BY n.id
) TO 'data/data.json' (ARRAY true)
"""

HUERFANAS = """
SELECT p.id, p.negocio_id, p.titulo
FROM read_csv_auto('data/promociones.csv', header = true) p
LEFT JOIN read_csv_auto('data/negocios.csv', header = true) n ON n.id = p.negocio_id
WHERE n.id IS NULL
ORDER BY p.id
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
