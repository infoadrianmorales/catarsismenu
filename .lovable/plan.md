

## Plan: Actualizar SEO en index.html y corregir ubicación

### Cambios

#### 1. `index.html` — Actualizar metadatos SEO
- `lang="es"` ya existe (línea 2) — sin cambio
- Actualizar `<title>` (línea 15) con nuevo texto
- Actualizar `<meta name="description">` (línea 16) con nuevo contenido (CC Aventura Plaza)
- Actualizar `<meta name="robots">` (línea 19) — simplificar a `index, follow`
- Eliminar `<meta name="keywords">` (línea 17) — no solicitada en el nuevo spec
- Actualizar `<meta name="theme-color">` (línea 11) de `#1a1a2e` a `#010C23`
- Actualizar geo tags (líneas 22-25): placename → "Lechería, Anzoátegui, Venezuela", coordenadas → `-64.6897`
- Actualizar OG tags (líneas 32-41): nuevo title, description con CC Aventura Plaza, agregar `og:image:alt`
- Actualizar Twitter tags (líneas 43-48): nuevo title, description con CC Aventura Plaza, agregar `twitter:image:alt`
- Agregar comentarios HTML explicativos para cada bloque
- **No tocar** el Facebook Pixel (líneas 50-61) ni el facebook-domain-verification

#### 2. `src/components/Footer.tsx` — Corregir ubicación
- Línea 34: "CC Costa Mar, Local 7, Lechería." → "CC Aventura Plaza, Lechería, Anzoátegui."
- Línea 64: "CC Costa Mar, Local 7, Lechería, Anzoátegui" → "CC Aventura Plaza, Lechería, Anzoátegui"
- Agregar comentario HTML sobre sincronización de ubicación

#### 3. Archivos adicionales con "Costa Mar" (para consistencia)
- `src/components/LocalBusinessSchema.tsx` línea 14: streetAddress → "CC Aventura Plaza"
- `src/components/RestaurantSchema.tsx` línea 22: streetAddress → "CC Aventura Plaza"
- `src/components/FAQSchema.tsx` línea 11: actualizar referencia a CC Aventura Plaza

### Verificaciones
1. Sin `<title>` duplicados — solo uno en index.html (el de SEO.tsx es dinámico por react-helmet)
2. Sin `<meta description>` duplicados
3. Facebook Pixel intacto
4. `lang="es"` presente
5. 4 geo tags con coordenadas CC Aventura Plaza
6. `og:type="website"`
7. Ubicación consistente en description, og:description, twitter:description
8. Footer actualizado sin "Costa Mar"

### Archivos modificados
| Archivo | Cambio |
|---------|--------|
| `index.html` | Metadatos SEO actualizados con comentarios |
| `src/components/Footer.tsx` | Ubicación corregida × 2 |
| `src/components/LocalBusinessSchema.tsx` | streetAddress actualizado |
| `src/components/RestaurantSchema.tsx` | streetAddress actualizado |
| `src/components/FAQSchema.tsx` | Referencia ubicación actualizada |

