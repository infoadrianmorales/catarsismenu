
## Objetivo

Cargar las 8 imágenes recibidas como 7 productos nuevos en la categoría **Bebidas**, optimizadas para web (WebP en 3 tamaños), con precio temporal de $1 y la **categoría Bebidas desactivada** hasta que la actives manualmente desde el panel.

No se modifica el diseño del sitio ni otras categorías.

## Productos a crear

| # | Slug | Nombre | Imagen origen |
|---|------|--------|---------------|
| 1 | `coca-cola-original-1l` | Coca-Cola Original 1L | jsyziq (etiqueta roja clásica) |
| 2 | `coca-cola-sin-azucar-1l` | Coca-Cola Sin Azúcar 1L | 68slm6 |
| 3 | `coca-cola-sin-azucar-2l` | Coca-Cola Sin Azúcar 2L | 4b1223 (im23fy queda como respaldo / descartado) |
| 4 | `coca-cola-zero-500ml` | Coca-Cola Zero 500ml | 2f2z9a |
| 5 | `agua-nevada-600ml` | Agua Mineral Nevada 600ml | k21pcr |
| 6 | `cerveza-polar-light-250ml` | Cerveza Polar Light 250ml | akn2tt |
| 7 | `cerveza-solera-classic-250ml` | Cerveza Solera Classic 250ml | ox9ras |

> Las dos imágenes de Coca-Cola Sin Azúcar 2L son casi idénticas; uso la más nítida (`4b1223`) y descarto `im23fy` para no duplicar.

Los 4 productos genéricos actuales (Agua Mineral, Cerveza, Coca-Cola, Jugo Natural) se **desactivan** (`activo=false`) ya que quedan reemplazados por los nuevos específicos. No se borran para preservar histórico de órdenes.

## Optimización de imágenes

Para cada imagen genero 3 variantes WebP cuadradas 1:1 (estándar del proyecto):
- `{slug}_200.webp` — thumb
- `{slug}_400.webp` — card  
- `{slug}.webp` — full 800px

Calidad WebP 85, recorte centrado a cuadrado, fondo blanco preservado. Tamaño esperado: 8–25 KB por variante (vs 200–400 KB del JPG original). El componente `OptimizedImage` ya consume estas variantes vía `srcset` automáticamente.

## Pasos técnicos

```text
1. Copiar las 7 imágenes user-uploads:// a /tmp/
2. Script Node con sharp:
   - resize cover 1:1 → 200/400/800 px
   - convertir a WebP q=85
3. Subir 21 archivos al bucket product-images/products/
4. INSERT de 7 productos en `products`:
   - categoria='bebidas', precio_usd=1, activo=false,
     is_orderable=true, imagen_url={url full webp}
5. UPDATE products SET activo=false WHERE categoria='bebidas'
   AND slug IN (4 genéricos actuales)
6. UPDATE categories SET activo=false WHERE slug='bebidas'
   → la sección Bebidas desaparece del menú público hasta activar
```

## Estado final

- En el panel admin → Productos → filtro Bebidas verás los 7 productos nuevos listos para editar precio.
- En el menú público la categoría Bebidas no aparece (apagada).
- Para activar: panel admin → Secciones → activar "Bebidas" (un click).

## Archivos afectados

Ninguno de código fuente. Solo:
- Storage `product-images/products/*.webp` (21 archivos nuevos)
- Tabla `products` (7 inserts + 4 updates)
- Tabla `categories` (1 update sobre bebidas)
