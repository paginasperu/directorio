# Auditoría UX/UI · Directorio

Paquete de revisión de las dos demos del directorio. Incluye capturas de escritorio y móvil, un resumen de producto y los criterios para auditar.

## Por qué hay capturas y no solo el enlace

El HTML inicial no contiene las tarjetas: se renderizan con JavaScript a partir de los CSV de `data/`. Un lector que solo descargue el HTML verá el cascarón, no el listado completo. Por eso la revisión visual debe hacerse con estas capturas; el código del repositorio sirve para señalar el CSS o JS exacto.

No es una SPA con framework: son páginas estáticas con módulos ES y HTML semántico.

## Enlaces

- Repositorio: <https://github.com/paginasperu/directorio>
- Portal de demos: <https://directorio.oficial.pe/>
- Demo 01: <https://directorio.oficial.pe/demos/01/>
- Demo 02: <https://directorio.oficial.pe/demos/02/>
- GitHub Pages alternativo: <https://paginasperu.github.io/directorio/>

Si la URL pública todavía muestra una versión anterior por caché o despliegue, la fuente de verdad es el repositorio y este paquete de capturas.

## Capturas

### Resúmenes rápidos

- [Demo 01 · escritorio](capturas/resumenes/demo-01-desktop.jpg)
- [Demo 01 · móvil](capturas/resumenes/demo-01-mobile.jpg)
- [Demo 02 · escritorio](capturas/resumenes/demo-02-desktop.jpg)
- [Demo 02 · móvil](capturas/resumenes/demo-02-mobile.jpg)

### Detalle por pantalla

**Demo 01 · escritorio** — `capturas/demo-01/desktop/`

1. `01-hero.jpg` — portada, buscador y collage.
2. `02-resultados.jpg` — listado después del scroll; buscador de cabecera visible.
3. `03-filtros.jpg` — panel de filtros.
4. `04-ficha-negocio.jpg` — modal de negocio.
5. `05-promocion.jpg` — modal de promoción.
6. `06-promociones.jpg` — descuentos y premios.
7. `07-favoritos.jpg` — favoritos guardados.
8. `08-lista.jpg` — vista de lista.

**Demo 01 · móvil** — `capturas/demo-01/mobile/`

1. `01-hero.jpg` — portada.
2. `02-resultados.jpg` — listado (vista de lista por defecto en móvil).
3. `03-filtros.jpg` — filtros en bottom sheet.
4. `04-ficha-negocio.jpg` — ficha a pantalla completa.
5. `05-promocion.jpg` — promoción.
6. `06-promociones.jpg` — promociones.
7. `07-favoritos.jpg` — favoritos.
8. `08-lista.jpg` — listado compacto.

**Demo 02 · escritorio** — `capturas/demo-02/desktop/`

1. `01-hero.jpg` — portada compacta con promoción destacada.
2. `02-resultados.jpg` — listado.
3. `03-filtros.jpg` — panel de filtros.
4. `04-ficha-negocio.jpg` — modal de negocio.
5. `05-promocion.jpg` — modal de promoción.
6. `06-promociones.jpg` — promociones.

**Demo 02 · móvil** — `capturas/demo-02/mobile/`

1. `01-hero.jpg` — portada compacta.
2. `02-resultados.jpg` — listado.
3. `03-filtros.jpg` — filtros en drawer lateral.
4. `04-ficha-negocio.jpg` — ficha.
5. `05-promocion.jpg` — promoción.
6. `06-promociones.jpg` — promociones.

También hay una captura del portal: `capturas/portal/01-portal-desktop.jpg`.

## Condiciones de las capturas

- Escritorio: **1440 × 900**.
- Móvil: **390 × 844**, densidad 2× (imagen de 780 × 1688).
- Las capturas de favoritos y vista de lista usan un estado preparado. No son errores: sirven para mostrar esos flujos.
- Las capturas se tomaron con el buscador de cabecera oculto mientras el buscador del hero está visible. Al hacer scroll, el buscador de cabecera aparece. Es el patrón intencional que se explica en `BRIEF.md`.

## Contexto y criterios

Leer [`BRIEF.md`](BRIEF.md) antes de puntuar. Ahí están el objetivo, los datos reales, las restricciones y las preguntas concretas para la auditoría.

La síntesis de la primera ronda de auditoría, con lo aceptado, lo descartado y los cambios aplicados, está en [`CONCLUSION.md`](CONCLUSION.md). Los reportes originales están en [`respuestas/`](respuestas/).

## Código relevante

- `demos/01/index.html`, `demos/01/style.css`, `demos/01/app.js`
- `demos/02/index.html`, `demos/02/style.css`, `demos/02/app.js`
- `assets/js/data.js` — capa de datos compartida.
- `data/negocios.csv`, `data/promociones.csv`
- `assets/css/styles.css` — base compartida de la Demo 02.
- `tools/check.mjs` — validador de enlaces e imágenes.

No hay build ni framework. Las demos se sirven como archivos estáticos.
