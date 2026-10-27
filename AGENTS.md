# AGENTS

Directorio web estático de negocios de un centro comercial.

- Stack: HTML, CSS, módulos ES. Sin framework ni build.
- Datos: `data/negocios.csv` y `data/promociones.csv`. La web los lee directo.
- Relación: `promociones.negocio_id` → `negocios.id`. No inventar negocios ni campos.
- Verificar antes de decir que está listo: `node tools/check.mjs` (0 referencias rotas).
- Servir en local: `python -m http.server 8000`. Nunca `file://`.
- No borrar ni mover archivos sin confirmación del dueño.
- Al cerrar, di en una línea qué verificaste.
