## Objetivo
Reordenar las secciones finales en `src/pages/Index.tsx` para que el mapa (SemanticSEOSection) aparezca justo después de los testimonios, y el Newsletter quede al final antes del Footer.

## Cambio único en `src/pages/Index.tsx`

Reemplazar el bloque final (SocialProof → Newsletter → TapeDivider → SemanticSEOSection → Footer) por el nuevo orden:

1. `LazySocialProof` — testimonios + CTA reseñas Google
2. `SemanticSEOSection` — texto SEO + mapa/ubicación
3. `LazyTapeDivider` — franja amarilla de marca
4. `LazyNewsletter` — captación de correos
5. `LazyFooter` — pie de página (después del cierre de `</main>`)

Actualizar el comentario `ORDEN FINAL` con la nueva secuencia. Consolidar los dos bloques de comentarios duplicados en uno solo.

## Fuera de alcance
- No se modifica ningún otro archivo.
- No se cambia el contenido interno de los componentes.
- No se tocan los `Suspense` boundaries ni los imports.