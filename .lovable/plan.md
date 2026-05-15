## Reemplazo de imágenes en Bebidas (5 productos)

Las 5 nuevas imágenes no coinciden 1:1 con los nombres actuales, así que actualizo imagen + nombre + slug + descripción para que cada producto refleje fielmente la etiqueta real del envase. Los otros 2 productos de Bebidas (Coca-Cola Original 1L, Agua Nevada 600ml) se quedan exactamente igual.

### Mapeo

| Slug actual | → Nuevo nombre | Imagen subida | Slug nuevo |
|---|---|---|---|
| `coca-cola-sin-azucar-1l` | Coca-Cola Sabor Original Menos Azúcar 1.5L | gjpwcv (botella 1.5L) | `coca-cola-menos-azucar-1-5l` |
| `coca-cola-sin-azucar-2l` | Coca-Cola Sabor Original Menos Azúcar 2L | ucba5a (botella 2L) | `coca-cola-menos-azucar-2l` |
| `coca-cola-zero-500ml` | Coca-Cola Sabor Original 600ml | xejtlx (botella 600ml) | `coca-cola-original-600ml` |
| `cerveza-polar-light-250ml` | Cerveza Polar Pilsen 219ml | i4u38j (lata Polar) | `cerveza-polar-pilsen-219ml` |
| `cerveza-solera-classic-250ml` | Cerveza Solera Light 250ml | elc9m2 (lata Solera Light) | `cerveza-solera-light-250ml` |

### Procesamiento de imágenes

1. Copiar las 5 imágenes a `/tmp/bebidas2/`.
2. Con `sharp`: generar **WebP** en 3 tamaños (200, 400, 800 px de ancho, q=85), fondo blanco, formato 1:1 cuadrado (centrado con padding blanco) — siguiendo el estándar del proyecto.
3. Subir a `product-images/products/{nuevo-slug}.webp` (versión 800px como principal). Las variantes 200/400 quedan disponibles con sufijo (`-sm`, `-md`).

### Cambios en base de datos (solo `UPDATE`, sin migración)

Para cada uno de los 5 productos: `UPDATE products SET slug=…, nombre=…, descripcion_corta=…, imagen_url=…, updated_at=now() WHERE slug=<slug actual>`.

### Lo que NO se toca

- Categoría `bebidas` permanece **desactivada** (`activo=false`) — sigue oculta del menú público hasta que se active manualmente.
- Los 7 productos siguen con `precio_usd=1` y `activo=false`.
- Los productos `coca-cola-original-1l` y `agua-nevada-600ml` no se modifican.
- No se toca código de UI ni el diseño general.
- Los 4 productos genéricos antiguos (`coca-cola`, `agua-mineral`, `cerveza`, `jugo-natural`) siguen desactivados como están.

### Resultado

Cuando actives la categoría Bebidas, los 7 productos aparecerán con imágenes optimizadas y nombres correctos, listos para que solo ajustes el precio.