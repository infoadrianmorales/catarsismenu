

## Auditoría de imágenes (Fase 1)

### 1. Componentes con etiquetas `<img>`

| Archivo | Imágenes | Notas |
|---------|----------|-------|
| `src/components/MenuHeader.tsx` | 1 (logo) | Sin `loading`, sin `width`/`height` |
| `src/components/Footer.tsx` | 1 (logo blanco) | Sin `loading`, sin `width`/`height` |
| `src/components/HeroSection.tsx` | N (slides carousel) | ✅ Ya tiene `loading={index === 0 ? 'eager' : 'lazy'}` — sin `width`/`height` |
| `src/components/MenuCard.tsx` | 1 por card | ✅ `loading="lazy"` — sin `width`/`height` |
| `src/components/OptimizedImage.tsx` | 1-2 (picture+img) | ✅ Tiene `loading` y `decoding="async"` — sin `width`/`height` |
| `src/components/CompactProductCard.tsx` | 1 vía OptimizedImage | Delegado a OptimizedImage |
| `src/pages/ProductPage.tsx` | 1 vía OptimizedImage | Delegado a OptimizedImage |
| `src/pages/Cart.tsx` | 1 por item | Sin `loading`, sin `width`/`height` |
| `src/components/cart/CartDrawer.tsx` | 1 por item | Sin `loading`, sin `width`/`height` |
| `src/components/admin/HeroSlidesPanel.tsx` | N (admin) | Admin — baja prioridad |
| `src/components/admin/ProductForm.tsx` | 1 (preview) | Admin — baja prioridad |
| `src/components/admin/SortableProductCard.tsx` | 1 por card | Admin — baja prioridad |
| `index.html` | 1 (Meta Pixel noscript 1×1) | No requiere cambios |

### 2-5. Estado actual
- **Hero**: ✅ Ya tiene `loading="eager"` en slide 0, `lazy` en los demás
- **Logo header**: ❌ Sin `loading` (debería ser `eager`)
- **Logo footer**: ❌ Sin `loading` (puede ser `lazy`)
- **Ninguna imagen** tiene `width`/`height` explícitos
- **Alt vacíos o genéricos**: Logo header dice solo "Catarsis", Cart/CartDrawer usan `item.nombre` sin sufijo de marca

---

## Plan de optimización (Fase 2)

### 6 archivos públicos a modificar

| Archivo | Cambios |
|---------|---------|
| **MenuHeader.tsx** | Logo: `loading="eager"`, `width="180" height="60"`, alt mejorado + comentario de optimización |
| **Footer.tsx** | Logo: `loading="lazy"`, `width="240" height="80"`, alt ya correcto + comentario |
| **HeroSection.tsx** | Agregar `width="1200" height="600"` a todas las imgs del carousel + comentario (loading ya correcto) |
| **MenuCard.tsx** | Agregar `width="400" height="400"` (aspect-square) + comentario (loading y alt ya correctos) |
| **OptimizedImage.tsx** | Agregar `width="400" height="400"` al `<img>` dentro de `<picture>` y al fallback + comentario |
| **Cart.tsx** | Agregar `loading="lazy"`, `width="96" height="96"`, mejorar alt con sufijo marca + comentario |
| **CartDrawer.tsx** | Agregar `loading="lazy"`, `width="64" height="64"`, mejorar alt con sufijo marca + comentario |

### No se modifican (admin, no público)
- `HeroSlidesPanel.tsx`, `ProductForm.tsx`, `SortableProductCard.tsx` — paneles de admin sin impacto SEO ni Core Web Vitals

### Cada archivo modificado llevará el comentario de encabezado solicitado con la lista de cambios aplicados.

