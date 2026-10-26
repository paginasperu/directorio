# Conclusión de la auditoría UX/UI

Tres auditorías externas revisaron las capturas y el código: ChatGPT, Claude y Gemini. Esta es la síntesis crítica: qué se aceptó, qué se descartó y qué se cambió.

Los reportes originales están en `respuestas/`. Fueron escritos sobre una versión anterior de las capturas; después de esta síntesis se actualizaron las capturas y el brief.

## 1. Dónde coincidieron

Los tres detectaron los mismos problemas de fondo:

1. **La tarjeta tenía demasiadas capas**: banner, badge de piso, badge de descuento, logo superpuesto, categoría, tipo, descripción, promoción, ubicación y contacto.
2. **El contacto no se leía como acción**: el número parecía un dato más, no el objetivo principal.
3. **Las imágenes de Sexshop eran un riesgo de contexto**, especialmente en una vitrina para vecinos y familias.
4. **La ficha y las promociones podían ser más claras**, sobre todo en móvil.
5. **La experiencia móvil era densa**: cabecera, categorías, controles y tarjetas competían por espacio.
6. **La consistencia visual y los detalles de accesibilidad** aún se podían pulir.

## 2. Dónde discreparon

### Una base o dos demos

- **ChatGPT y Gemini** recomendaron una sola base, más cercana a la Demo 02.
- **Claude** recomendó quedarse con la Demo 01 por tener favoritos, vista de lista, paginación y promociones separadas.
- **Decisión:** mantener las dos demos. El objetivo actual es explorar dos direcciones, no lanzar un producto único. Para producción sí conviene consolidar una sola base con temas claro/oscuro.

### Hero de la Demo 01

- **ChatGPT y Gemini** lo consideran demasiado alto, oscuro o cargado.
- **Claude** considera que el hero vende y que el problema está en las tarjetas.
- **Decisión:** no se rediseñó el hero ni se eliminó el collage. Se quitó el sticker duplicado de “170 promociones activas” y se mantuvo la búsqueda como acción principal. El usuario busca una demo visual y comercial; el hero es parte de esa identidad.

### Búsqueda en móvil

- **Gemini** pidió un input persistente; **Claude** dijo explícitamente que el patrón de búsqueda progresiva se entiende y no hay que tocarlo.
- **Decisión:** se mantiene. En la Demo 01 el hero tiene el buscador visible y la cabecera un icono; en la Demo 02 la cabecera mantiene el input y el hero lo oculta. Es una entrada visible por pantalla, sin dos campos compitiendo.

### Promoción destacada de la Demo 02

- **ChatGPT y Gemini** la ven como competencia para el buscador.
- **Claude** la defiende como lo único del hero que muestra una oferta real.
- **Decisión:** se mantiene. Es una oferta real, no un dato inventado, y da vida al hero de la Demo 02.

### Paginación

- **Gemini** pidió eliminarla; **Claude** sugirió “Cargar más”; **ChatGPT** no lo priorizó.
- **Decisión:** la Demo 01 mantiene 12 por página porque funciona con 85 negocios y 170 promociones. La Demo 02 conserva su listado completo por ser la versión clásica heredada. Un “Cargar más” queda como mejora futura, no como error de esta etapa.

### CTA “Suscríbete”

- **Claude** señaló que mezcla públicos: visitante y negocio.
- **Decisión:** se mantiene porque el usuario pidió explícitamente ese CTA. En producción conviene separar “Recibir promos” para visitantes y “Registra tu negocio” para negocios.

## 3. Cambios aplicados

### Tarjetas de la Demo 01

- Se eliminaron los badges superpuestos de piso y descuento. El piso queda en la línea de ubicación y la promoción en los chips.
- El logo del negocio se movió del banner al cuerpo, junto al tipo y nombre.
- Se eliminó la etiqueta de categoría del pie. El tipo de negocio es el dato visible; la categoría vive en chips y filtros.
- El contacto ahora es un **botón claro** en el pie: WhatsApp, Llamar, Instagram, Facebook o TikTok, según el canal real.
- Se quitó el número de la tarjeta; el número completo permanece en la ficha.
- Se conservó “Ver ficha” y la tarjeta completa sigue siendo clickeable, con cursor pointer.
- Se mantuvieron los chips de descuento/premio y la ubicación.

### Contenido para adultos

- Las tarjetas y promociones de **Sexshop** usan una portada neutra con “+18” y el logo del negocio.
- La imagen real solo aparece al abrir la ficha.
- En la Demo 01 se añadió el distintivo “+18” en la ficha y en el detalle de promoción.

### Demo 02

- El contacto de las tarjetas usa el mismo fallback que la Demo 01: WhatsApp → teléfono → Instagram → Facebook → TikTok. Ya no muestra “Sin WhatsApp” cuando existe otro canal.
- Se añadió **foco atrapado** al modal, foco inicial en cerrar, retorno de foco y anillo de foco visible.
- Se mejoraron tamaños de toque de filtros y contactos en móvil.

### Demo 01

- Se compactó el toolbar móvil: con filtros vacíos queda una sola fila.
- Se aumentaron ligeramente los objetivos táctiles de contacto, favorito y toggle de vista.
- Se eliminó el sticker duplicado de promociones del hero.

## 4. Lo que no se aplicó

- **Fusionar las demos en una sola base.** Se mantiene la comparación; consolidar es una decisión de producción, no de esta demo.
- **Rediseñar o acortar el hero de la Demo 01.** El hero vende y el usuario valora lo visual; el problema real estaba en las tarjetas.
- **Cambiar la paleta de la Demo 02 a cálida.** Es la alternativa clara/minimalista; cambiarla la volvería otra Demo 01.
- **Input de búsqueda persistente en móvil de la Demo 01.** El icono de búsqueda es un patrón estándar y el hero ya tiene el campo visible. No se cambió sin evidencia de fallo.
- **Eliminar la paginación o pasar a scroll infinito.** 12 por página es una decisión razonable para este volumen; el listado completo de la Demo 02 es heredado.
- **Quitar el filtro de categoría o partir “Entretenimiento” en el CSV.** Es una decisión de taxonomía/contenido, no de UI de esta iteración.
- **Convertir la ficha móvil de la Demo 01 en bottom sheet.** La ficha a pantalla completa funciona y tiene cierre claro; el reporte que atribuía un bottom sheet a la Demo 02 no describía el código real.
- **Hacer clicables los rótulos del collage.** Son etiquetas decorativas, no enlaces; no hay evidencia de confusión.
- **Cambiar el CTA “Suscríbete”.** Se mantiene por decisión del producto; la recomendación de separar públicos queda anotada para producción.

## 5. Validación posterior

- `node tools/check.mjs`: **3 páginas, 170 imágenes, 0 referencias rotas**.
- Lighthouse en Demo 01 y Demo 02: **100 accesibilidad, 100 buenas prácticas, 100 SEO**.
- Revisión visual en escritorio 1440 × 900 y móvil 390 × 844.
- Probados: contacto directo, tarjetas, favoritos, filtros, modales, foco del modal de Demo 02, portadas +18 y toolbar móvil.
- Sin errores de consola.

## 6. Pendiente para una versión de producción

- Consolidar una sola base con tema claro/oscuro y variables por mercado.
- Separar el CTA de visitantes y negocios.
- Revisar la taxonomía de categorías y partir “Entretenimiento” si el contenido crece.
- Evaluar “Cargar más” para la Demo 02.
- Probar en dispositivos físicos y con lector de pantalla.
- Validar las imágenes definitivas de cada mercado.

La auditoría fue útil, pero no se aplicó por mayoría: se priorizó impacto real, coherencia con el objetivo del producto y evidencia en las capturas/código.
