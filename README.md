# Full Market

Directorio de negocios estático. Se publica con GitHub Pages en
<https://fullmarket.oficial.pe>.

## Estructura

```
index.html              Página principal
CNAME                   Dominio del sitio
robots.txt, sitemap.xml Para buscadores
datos/negocios.csv      Lista de negocios (aquí se edita el contenido)
assets/css/             Estilos del sitio
assets/js/app.js        Búsqueda, filtros y ficha de cada negocio
assets/img/             Logo, iconos e imagen para compartir
build/                  Herramientas para recompilar los estilos
```

## Editar negocios

Todo el contenido está en `datos/negocios.csv`. Se abre con Excel o Google
Sheets y se guarda como CSV.

Columnas, en este orden:

| Columna | Ejemplo |
|---|---|
| Nombre | Fashion Outlet Perú |
| Calificación | 4.9 |
| Opiniones | 263 |
| Piso | 2 |
| Tienda | 46 |
| Teléfono | 955012834 |
| Categoría | Moda y accesorios |
| Tipo | Tienda de ropa |
| Descripción | Tienda de ropa y moda. |
| Catálogo | Ropa, prendas de vestir |
| Estado | No verificado |

Los valores con comas (por ejemplo el catálogo) van entre comillas.
Si se cambia el orden o el nombre de una columna, la página deja de mostrar
ese dato.

## Cambiar nombre, dominio o colores

- Nombre del directorio: `index.html`, en el `<title>`, el encabezado y el pie.
- Dominio: archivo `CNAME`.
- Colores: `build/tailwind.config.js` (paleta) y `assets/css/estilos.css`.
- Textos fijos: `index.html`.

## Recompilar estilos

Los estilos de Tailwind ya están compilados en `assets/css/tailwind.css`. Solo
hay que recompilar si se agregan clases nuevas o se cambian colores:

```
cd build
npm install
npm run build:css
```

## Datos de demostración

Los negocios provienen de Google Maps. Algunas descripciones y catálogos son
de ejemplo para mostrar cómo se vería la ficha completa. Antes de publicar
datos definitivos, reemplazarlos por información confirmada por cada negocio.
