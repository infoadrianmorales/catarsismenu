## Objetivo
Mejorar la simetría visual entre la columna de texto SEO (izquierda) y el mapa (derecha) en `src/components/SemanticSEOSection.tsx`, eliminando elementos duplicados.

## Cambios en `src/components/SemanticSEOSection.tsx`

**Columna derecha — simplificar:**
- Eliminar el bloque de dirección "CC Aventura Plaza / Av. Diego Bautista Urbaneja…"
- Eliminar el bloque de horario "Lunes a Domingo / 12:00 PM – 1:00 AM"
- Eliminar el botón CTA "Cómo llegar"
- Mantener únicamente: título "ENCUÉNTRANOS EN LECHERÍA" + iframe del mapa de Google

**Simetría visual:**
- Igualar la altura del mapa con la altura del bloque de texto usando `h-full` en el iframe y `flex flex-col` en la columna derecha, para que el mapa se estire y ocupe todo el alto de la columna izquierda.
- Alinear ambas columnas con `items-stretch` en el grid.
- El título "ENCUÉNTRANOS EN LECHERÍA" queda alineado verticalmente con el H2 amarillo de la izquierda (misma línea base).
- Mantener el tamaño de texto actual (`text-lg`) en los párrafos SEO ya que la columna derecha ahora será más limpia.

## Resultado
Dos columnas equilibradas: texto SEO a la izquierda, mapa grande a la derecha con el mismo alto. Sin duplicación de dirección/horario/CTA (ya presentes en el footer y otras secciones).