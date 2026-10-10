# Directorio Oficial de Publicidad

Sitio estático para descubrir perfiles profesionales y recibir solicitudes de registro.

## Estructura

- `index.html`, `styles.css`, `scripts.js`: directorio público.
- `registro/`: formulario de registro.
- `privacidad/`: política de privacidad.
- `data/perfiles.csv`: datos que se publican; contiene solo columnas públicas.
- `data/distritos.csv`: catálogo para los desplegables de ubicación.
- `config.js`: configuración pública del sitio, Cloudinary y endpoint de Apps Script.

El formulario valida los datos en el navegador y Apps Script vuelve a validarlos antes de guardarlos en la hoja privada. Las imágenes se cargan en Cloudinary. No publiques contraseñas, API Secrets ni el código de Apps Script con identificadores de hojas.

## Publicación

El sitio se sirve desde la raíz del repositorio de GitHub Pages. `CNAME` conserva el dominio `directorio.oficial.pe`. Para actualizar perfiles públicos, reemplaza `data/perfiles.csv` por una exportación de la vista pública de la hoja.
