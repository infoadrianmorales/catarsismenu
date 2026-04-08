

## Plan: Source tracking — registrar origen de cada producto en el carrito

### Resumen
Agregar un campo `source` a cada item del carrito para rastrear desde dónde fue agregado (best seller, menú, sugerencia, búsqueda). El valor se persiste en `order_items.source` al completar el pedido.

### 1. Migración SQL
Agregar columna `source` a `order_items`:
```sql
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS source text DEFAULT 'menu';
COMMENT ON COLUMN order_items.source IS 'Origen desde donde el usuario agregó el producto. Agregado 2026-04-08.';
```

### 2. CartContext (`src/contexts/CartContext.tsx`)
- Crear tipo `CartItemSource = 'menu' | 'best_seller' | 'suggestion' | 'search' | 'extras'`
- Agregar `source: CartItemSource` a `CartItem`
- Modificar `addToCart` para aceptar `source` como segundo parámetro (default `'menu'`)
- Al crear nuevo item: asignar el source recibido
- Al incrementar item existente: NO cambiar el source original
- Actualizar la firma en `CartContextType`

### 3. Componentes que llaman `addToCart` — pasar source correcto

| Archivo | Contexto | Source |
|---|---|---|
| `AddToCartButton.tsx` | Recibe `source` como prop, default `'menu'` | Depende del padre |
| `MenuCard.tsx` | Menú general | `'menu'` |
| `CompactProductCard.tsx` | Usado en carouseles (best sellers y menú) | Recibe prop `source`, default `'menu'` |
| `ProductPage.tsx` | Página de detalle de producto | `'product_detail'` (se mapea a `'menu'`) |
| `UpsellSuggestions.tsx` | Sugerencias del carrito | `'suggestion'` |
| `FeaturedProducts.tsx` | Productos destacados en home | `'best_seller'` |
| `MenuGrid.tsx` | Best sellers tab → `'best_seller'`; otras tabs → `'menu'` |
| `ProductCarousel.tsx` | Recibe prop `source` del padre |

**Propagación de source:**
- `MenuCard` y `CompactProductCard` reciben prop `source?` y lo pasan a `AddToCartButton`
- `AddToCartButton` pasa el `source` a `addToCart(product, source)`
- Componentes padres (MenuGrid, FeaturedProducts, ProductCarousel) pasan el source correcto

### 4. Checkout (`src/pages/Checkout.tsx`)
En el INSERT a `order_items` (línea ~491-502), agregar `source: item.source || 'menu'` al objeto de cada item.

### 5. Archivos modificados (resumen)

1. **Migración SQL** — nueva columna `order_items.source`
2. **`src/contexts/CartContext.tsx`** — tipo `CartItemSource`, campo `source` en `CartItem`, parámetro en `addToCart`
3. **`src/components/cart/AddToCartButton.tsx`** — acepta prop `source`, lo pasa a `addToCart`
4. **`src/components/MenuCard.tsx`** — acepta prop `source`, lo pasa a `AddToCartButton`
5. **`src/components/CompactProductCard.tsx`** — acepta prop `source`, lo pasa a `AddToCartButton`
6. **`src/components/cart/UpsellSuggestions.tsx`** — pasa `source: 'suggestion'`
7. **`src/components/FeaturedProducts.tsx`** — pasa `source: 'best_seller'`
8. **`src/components/MenuGrid.tsx`** — pasa `'best_seller'` en tab best sellers, `'menu'` en el resto
9. **`src/components/ProductCarousel.tsx`** — acepta prop `source`, lo pasa a `CompactProductCard`
10. **`src/pages/ProductPage.tsx`** — pasa `source: 'menu'`
11. **`src/pages/Checkout.tsx`** — incluye `source` en el INSERT a `order_items`
12. **`src/components/CategorySection.tsx`** — pasa `source: 'menu'`
13. **`src/components/FilteredProductsGrid.tsx`** — pasa `source: 'menu'`
14. **`src/pages/CategoryPage.tsx`** — pasa `source: 'menu'`

Todos los archivos modificados incluirán comentario con fecha `[2026-04-08]`.

