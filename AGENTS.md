# AGENTS

Directorio web estático de negocios de un centro comercial.

- Stack: HTML, CSS, módulos ES. Sin framework ni build.
- Datos: `data/negocios.csv` y `data/promociones.csv`. La web los lee directo.
- Relación: `promociones.negocio_id` → `negocios.id`. No inventar negocios ni campos.
- Verificar antes de decir que está listo: `node tools/check.mjs` (0 referencias rotas).
- Servir en local: `python -m http.server 8000`. Nunca `file://`.
- No borrar ni mover archivos sin confirmación del dueño.
- Al cerrar, di en una línea qué verificaste.

## Datos: la hoja de cálculo es la fuente de la verdad

Los CSV del repo son una **exportación** de la hoja del dueño, no el original. Si se editan a mano, el siguiente export los pisa y se crea un caos.

1. Todo cambio de contenido (negocios, promociones, precios, textos, tipos) se hace primero en la hoja de cálculo.
2. El dueño exporta la hoja como CSV UTF-8 y lo entrega; nadie edita el CSV directamente en el repo.
3. Al reemplazar `data/negocios.csv` o `data/promociones.csv`, actualizar también `data/data.json`.
4. Si una tarea requiere cambiar datos, pedir el CSV nuevo en vez de corregirlo en el repo.
5. Si se detecta una diferencia entre la web y la hoja, avisar y dar la instrucción exacta para corregirla en la hoja.
6. Verificar con `node tools/check.mjs` antes de decir que está listo.
