# Brief para auditoría UX/UI · Directorio

## 1. Qué es

**Directorio** es una demo de listado de negocios para mercados y galerías. La usaré como base para luego personalizarla por mercado real. En esta etapa **no se está diseñando un home completo**: son dos demos de una página de listado, directa y práctica, con búsqueda, filtros, fichas y promociones.

La marca es genérica a propósito: **Directorio**. Los nombres creativos se reservan para las versiones de cada mercado.

## 2. Objetivo

- Que una persona encuentre rápido un negocio por categoría, piso o promoción.
- Que el contacto sea evidente y directo, sobre todo WhatsApp.
- Que la página se sienta vistosa y comercial sin dejar de ser útil.
- Que funcione bien en móvil y escritorio.
- Que sirva como base reutilizable para mercados y galerías.

## 3. Datos reales

- **85 negocios**
- **170 promociones**
- **13 categorías**
- **4 pisos**
- Cada negocio tiene **1 descuento y 1 premio**.
- Los descuentos son del **10%** y tienen precio regular/rebajado.
- Los premios son **Sorteo, Concurso o Canje**.
- Las 170 promociones vencen el **31 dic 2026**.
- **38 negocios tienen WhatsApp, 9 teléfono fijo, 22 solo redes sociales y 1 no tiene contacto**.
- Todos tienen logo, banner y catálogo.
- No hay ratings, reseñas, distancia, horarios ni estado abierto/cerrado.

## 4. Las dos demos

### Demo 01 · `demos/01/`

Enfoque editorial y comercial.

- Header oscuro.
- Hero con titular grande, buscador, chips de categorías populares y collage de negocios reales.
- Tarjetas con banner 2:1, logo circular, piso, promociones y contacto prioritario.
- Favoritos locales.
- Paginación de 12.
- Filtros en panel lateral en escritorio y bottom sheet en móvil.
- Vista de cuadrícula y lista.
- Promociones separadas en descuentos y premios.
- Ficha y promoción en modal; en móvil, a pantalla completa.
- CTA de suscripción y footer compacto.

### Demo 02 · `demos/02/`

Enfoque clásico y minimalista, más cercano a una app Apple.

- Header claro y persistente.
- Hero compacto con titular, estadísticas, buscador en escritorio y una tarjeta de **promoción destacada** real.
- Listado con las 85 tarjetas (sin paginación, decisión heredada).
- Filtros en drawer lateral.
- Ficha y promoción en modal.
- Misma data y misma capa de datos que la Demo 01.

## 5. Decisiones ya tomadas

No hace falta proponerlas como “errores”, pero sí se puede evaluar su ejecución:

- **Una sola búsqueda visible a la vez.** En escritorio, el buscador del hero es el principal y el de cabecera aparece al hacer scroll. En móvil, la Demo 01 usa el buscador del hero y la cabecera solo muestra un icono; la Demo 02 usa el buscador de cabecera y oculta el del hero. Los campos están sincronizados.
- **Favoritos sin login**, con `localStorage`, solo para negocios.
- **Paginación** en Demo 01; listado completo en Demo 02.
- **Sin carrito, login, checkout ni home completa.**
- **Sin ratings, reseñas, distancia ni “abierto/cerrado”** porque no existen en la data. No inventar esos datos.
- **Contacto con prioridad**: WhatsApp → teléfono → Instagram → Facebook → TikTok. Si no hay canal, se muestra un estado neutral.
- **Precios y promociones reales**, no badges falsos.
- **Logo de marca D** unificado en favicon, portal y cabeceras.
- **Banner de ficha a ancho completo** y logo del negocio dentro del banner.
- **Cursor pointer** en toda la tarjeta clickeable.
- **Demo 01 · tarjetas limpias**: banner sin badges duplicados, logo del negocio en el cuerpo, tipo + nombre, descripción, promociones, ubicación y CTA de contacto. La categoría vive en chips/filtros, no se repite en la tarjeta.
- **Demo 01 · contacto como acción**: WhatsApp, Llamar o red social como botón en el pie de la tarjeta, sin repetir el número. El número completo queda en la ficha.
- **Contenido para adultos**: en ambas demos, las tarjetas y promociones de Sexshop usan una portada neutra con “+18”; la imagen real solo aparece al abrir la ficha.
- **Demo 02**: contacto con fallback a teléfono/redes en la tarjeta y foco atrapado en el modal. Conserva su tarjeta clásica.
- **Una sola búsqueda visible a la vez**: el buscador de cabecera aparece al hacer scroll cuando el buscador del hero sale de pantalla.

Estas decisiones se tomaron después de la primera ronda de auditoría; los reportes originales están en `respuestas/` y la síntesis en `CONCLUSION.md`.

## 6. Restricciones

- No hay backend ni autenticación.
- No hay formulario de newsletter con envío real; el CTA abre WhatsApp.
- No hay geolocalización ni mapas.
- Las imágenes son de referencia, no material final de marca.
- Las demos tienen `noindex`.
- El objetivo es una **página de listado**, no un home. No pedir secciones de home completo.
- La fecha de vigencia es la misma para todas las promociones; no usarla como diferenciador visual.

## 7. Qué evaluar

Priorizar problemas reales de UX/UI, no gustos personales sin impacto.

1. **Hero**: jerarquía, equilibrio, claridad de la propuesta y capacidad de conversión. ¿Sobra o falta algo?
2. **Buscador**: ¿se entiende el patrón de una sola búsqueda visible? ¿La transición al buscador de cabecera es natural?
3. **Tarjetas**: jerarquía de nombre, categoría, descripción, piso, promociones y contacto. ¿El banner 2:1 y el logo funcionan? ¿El teléfono/WhatsApp se lee como acción?
4. **Filtros**: panel lateral vs bottom sheet; claridad de filtros activos; fricción en móvil.
5. **Fichas**: modal, scroll, cierre, contacto, promociones, catálogo. ¿El logo y el banner están bien resueltos?
6. **Promociones**: diferencia entre descuento y premio; precio, ahorro, vigencia y CTA.
7. **Favoritos**: descubrimiento, estado vacío, persistencia y claridad.
8. **Paginación vs cargar más**: ¿12 por página es adecuado para 85 negocios y 85 promociones por tipo?
9. **Móvil**: densidad, tamaño de toque, navegación, cabecera, filtros, modales.
10. **Accesibilidad**: contraste, foco, nombres accesibles, teclado, modales.
11. **Marca**: nuevo monograma D, favicon, consistencia entre demos.
12. **Errores visuales**: desalineaciones, imágenes, espaciados, scroll horizontal, saltos de layout.

## 8. Preguntas concretas

- ¿La Demo 01 se siente más “vendedora” que la Demo 02, o solo más cargada?
- ¿El hero de la Demo 01 tiene la información y los CTAs correctos?
- ¿La tarjeta de promoción destacada de la Demo 02 aporta o distrae?
- ¿El patrón de búsqueda progresiva se entiende sin explicación?
- ¿La doble oferta Demo 01/Demo 02 tiene sentido o debería quedar una sola?
- ¿Qué eliminarías sin perder valor?
- ¿Qué tres cambios tendrían más impacto visual o de conversión?
- ¿Hay algún detalle que se vea “de novato” y que deba corregirse antes de mostrar la demo?

## 9. Formato de respuesta esperado

Para cada hallazgo:

1. **Prioridad**: P0 (rompe o confunde), P1 (mejora clara), P2 (pulido).
2. **Pantalla/archivo**: nombre de la captura o selector CSS/JS.
3. **Problema**: qué se ve y por qué afecta al usuario.
4. **Recomendación concreta**: cambio de jerarquía, copy, espaciado, color, interacción o CSS.
5. **Evidencia**: captura, medida o referencia de buena práctica.

Evitar:

- Consejos genéricos sin relación con las capturas.
- Proponer funciones fuera del alcance (login, carrito, home completa, reseñas inventadas).
- Confundir preferencia estética con problema de usabilidad.
- Asumir que la ausencia de datos que no existen es un error.

## 10. Material

- Capturas: `auditoria/capturas/`
- Resúmenes: `auditoria/capturas/resumenes/`
- Código: `demos/01/`, `demos/02/`, `assets/js/data.js`
- Validador: `tools/check.mjs`

Las capturas fueron tomadas en escritorio 1440 × 900 y móvil 390 × 844. Los estados de favoritos y vista de lista son preparados para mostrar el flujo.
