## Plan: Agregar productos nuevos en Bebidas

### Productos a crear (5 nuevos, todos `activo=false`, `precio_usd=1`)

| # | Imagen | Slug nuevo | Nombre |
|---|---|---|---|
| 1 | Coca-Cola Zero 0.5L | `coca-cola-zero-500ml` | Coca-Cola Zero 500ml |
| 2 | Coca-Cola Sin Azúcar 2L (etiqueta roja "SIN AZÚCAR / SIN CALORÍAS") | `coca-cola-sin-azucar-2l` | Coca-Cola Sin Azúcar 2L |
| 3 | Coca-Cola Sin Azúcar 1L (etiqueta roja "SIN AZÚCAR / SIN CALORÍAS") | `coca-cola-sin-azucar-1l` | Coca-Cola Sin Azúcar 1L |
| 4 | Coca-Cola Menos Azúcar 1L | `coca-cola-menos-azucar-1l` | Coca-Cola Sabor Original Menos Azúcar 1L |
| 5 | Polar Light 250ml | `cerveza-polar-light-250ml` | Cerveza Polar Light 250ml |
| 6 | Solera Classic 250ml | `cerveza-solera-classic-250ml` | Cerveza Solera Classic 250ml |

(Las dos imágenes idénticas de Sin Azúcar 2L → uso solo una para el producto #2.)

### Reemplazo de imagen (1 producto existente)

- `agua-nevada-600ml` → reemplazar `imagen_url` con la foto nueva de Agua Nevada (mejor calidad). Sin cambios en nombre ni estado.

### Procesamiento de imágenes

1. Copiar 7 imágenes a `/tmp/bebidas3/`.
2. Con `sharp`: generar WebP en 3 tamaños (200/400/800px, q=85, fondo blanco, recorte 1:1 centrado con padding).
3. Subir a `product-images/products/{slug}.webp` (versión 800px) + variantes `_200`, `_400`.

### Cambios en base de datos

- 6 `INSERT` en `products` (los 6 productos nuevos), con `categoria='bebidas'`, `precio_usd=1`, `activo=false`, `is_orderable=true`, `orden` continuando después de los existentes.
- 1 `UPDATE` en `products` para refrescar `imagen_url` de `agua-nevada-600ml`.

### Lo que NO se toca

- Categoría `bebidas` sigue **desactivada** hasta activación manual.
- Productos existentes (incluyendo `cerveza-polar-pilsen-219ml` y `cerveza-solera-light-250ml`) se mantienen sin cambios.
- Sin cambios de UI ni de diseño.

### Resultado

12 productos en Bebidas (todos a $1, inactivos). Cuando actives la categoría y ajustes precios reales, todo aparece con imágenes optimizadas.
