# DIRECTORIO OFICIAL

Plantilla estática del directorio. El HTML, los estilos, el comportamiento y los datos están separados para que sea fácil ubicar qué editar.

## Archivos

- `index.html`: contenido y orden de la página; GitHub Pages lo abre como inicio.
- `styles.css`: diseño de fichas, cabecera y detalles visuales.
- `app.js`: búsqueda, categorías, horarios, filtros y fichas. También contiene una copia de los datos para que la vista funcione al abrir `index.html` con doble clic.
- `negocios.csv`: datos que se usan al publicar el sitio. Exporta la hoja de Google Sheets a CSV y reemplaza este archivo.
- `archivo/`: prototipos anteriores y respaldo; no son parte de la página activa.

## Datos CSV

La página publicada carga `negocios.csv`. Las columnas necesarias son:

`id,nombre,descripcion,categoria,tipo,ubicacion,whatsapp,telefono,telefonos adicionales,instagram,facebook,tiktok,productos,servicios,foto de perfil,foto de portada,dias,abre,cierra`

Separa varios productos, servicios, teléfonos o días con `|`. Los días usan números: domingo `0`, lunes `1` … sábado `6`. Las columnas `dias`, `abre` y `cierra` alimentan el estado de abierto/cerrado. No incluyas fecha de registro, notas internas ni estado administrativo.

Los navegadores bloquean la lectura automática de archivos vecinos al abrir una página con `file://`. Para que la demo siga funcionando con doble clic, `app.js` conserva datos locales de vista previa. En el sitio publicado se usan los datos de `negocios.csv`; al cambiar el CSV, sube también el cambio correspondiente antes de publicar.

## Tailwind e iconos

La página conserva Tailwind por CDN porque forma parte del diseño actual. Su breve configuración de colores está dentro de `index.html`, junto a la carga de Tailwind; no necesita otro archivo. Los iconos de búsqueda se dibujan como SVG en el HTML, y el resto usa Lucide por CDN.
