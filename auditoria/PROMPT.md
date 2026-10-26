# Prompt listo para las IAs

Copia este bloque en Gemini, ChatGPT y Claude. Adjunta o enlaza las capturas.

---

Actúa como **auditor senior de UX/UI y diseño de producto**. Vas a revisar dos demos de una página de listado de negocios para mercados y galerías. No es un home completo: es una demo de listado, búsqueda, fichas y promociones.

**Contexto y restricciones (leer primero):**
https://raw.githubusercontent.com/paginasperu/directorio/main/auditoria/BRIEF.md

**Repositorio:**
https://github.com/paginasperu/directorio

**Demo 01 · Noche (oscura, editorial):**
https://directorio.oficial.pe/demos/01/

**Demo 02 · Día (clara, minimalista):**
https://directorio.oficial.pe/demos/02/

**Capturas resumen:**
- Demo 01 escritorio: https://raw.githubusercontent.com/paginasperu/directorio/main/auditoria/capturas/resumenes/demo-01-desktop.jpg
- Demo 01 móvil: https://raw.githubusercontent.com/paginasperu/directorio/main/auditoria/capturas/resumenes/demo-01-mobile.jpg
- Demo 02 escritorio: https://raw.githubusercontent.com/paginasperu/directorio/main/auditoria/capturas/resumenes/demo-02-desktop.jpg
- Demo 02 móvil: https://raw.githubusercontent.com/paginasperu/directorio/main/auditoria/capturas/resumenes/demo-02-mobile.jpg

**Capturas detalladas:**
https://github.com/paginasperu/directorio/tree/main/auditoria/capturas

Nota: el HTML inicial no contiene las tarjetas; se renderizan con JavaScript desde CSV. Evalúa el diseño con las capturas y usa el repositorio solo para ubicar el CSS/JS exacto.

**Quiero una auditoría accionable, no genérica.** Entrega como máximo 10 hallazgos priorizados:

- **P0:** rompe o confunde.
- **P1:** mejora clara de usabilidad/conversión.
- **P2:** pulido.

Para cada hallazgo:

1. Captura o selector exacto.
2. Qué problema hay y por qué afecta al usuario.
3. Recomendación concreta de diseño/CSS/copy.
4. Impacto esperado.

Evalúa especialmente:

- Equilibrio y capacidad de conversión de los dos heroes.
- Patrón de búsqueda: buscador del hero y buscador de cabecera que aparece al hacer scroll. ¿Se entiende? ¿Es una buena solución?
- Jerarquía de las tarjetas: banner, logo, nombre, categoría, piso, promociones y contacto. ¿El WhatsApp/teléfono se siente accionable?
- Filtros en panel lateral (escritorio) y bottom sheet (móvil).
- Fichas y modales: banner, logo, scroll, cierre, contacto.
- Separación descuentos/premios.
- Favoritos y estado vacío.
- Paginación de la Demo 01 vs listado completo de la Demo 02.
- Densidad móvil, tamaños de toque y navegación.
- Contraste, foco, teclado y accesibilidad.
- Marca: monograma D, favicon y consistencia entre demos.
- Cualquier detalle que se vea “de novato”.

No propongas login, carrito, checkout, home completa, ratings, reseñas, distancia ni horarios: no existen en esta etapa. No inventes datos. Distingue claramente entre problema de usabilidad y preferencia estética.

Al final, dime también:

1. ¿Qué tres cambios tendrían más impacto?
2. ¿Qué eliminarías o simplificarías?
3. ¿Qué está bien y no habría que tocar?
