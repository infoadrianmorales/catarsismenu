

## Plan: Extras de producto + Sugerencias de compra en el carrito

### Feature 1 — Extras/Add-ons por producto

**Concepto**: Crear un sistema de extras configurables desde el admin que se muestren en el carrito para productos de categorías específicas (hamburguesas, pizzas, emparedados, etc.).

#### Base de datos

**Tabla `product_extras`**:
- `id` (uuid, PK)
- `nombre` (text) — ej: "Extra de carne", "Extra tocineta"
- `precio_usd` (numeric) — precio adicional
- `categoria` (product_category enum) — a qué categoría aplica (hamburguesas, pizzas, emparedados...)
- `product_id` (uuid, nullable, FK → products) — si aplica solo a un producto específico, null = aplica a toda la categoría
- `activo` (boolean, default true)
- `orden` (integer, default 0)
- `created_at`, `updated_at`

RLS: lectura pública para extras activos, CRUD completo para admins.

#### Código — CartContext

- Extender `CartItem` con `extras: Array<{ extraId: string, nombre: string, precio_usd: number }>`
- Agregar funciones: `addExtra(productId, extra)`, `removeExtra(productId, extraId)`
- El `subtotal` suma automáticamente los precios de extras por cada item

#### Código — Cart UI (Cart.tsx y CartDrawer.tsx)

- Debajo de cada producto elegible, mostrar una sección colapsable "Agregar extras"
- Chips/checkboxes con nombre + precio de cada extra disponible
- Los extras seleccionados se muestran como líneas debajo del producto con su precio

#### Código — Admin (nuevo ExtrasPanel.tsx)

- Nueva pestaña "Extras" en el panel admin
- CRUD: crear/editar/eliminar extras
- Selector de categoría o producto específico
- Toggle activo/inactivo, drag-and-drop para orden

#### Código — Checkout y WhatsApp

- El mensaje de WhatsApp incluye los extras seleccionados debajo de cada producto
- Los `order_items` guardan un snapshot de extras en un campo JSONB `extras_snapshot`

---

### Feature 2 — Sugerencias de compra (upsell)

**Concepto**: En la página del carrito, mostrar una sección "¿Quieres agregar algo más?" con best sellers y bebidas.

#### Base de datos

- Crear la categoría "Bebidas" en la tabla `categories` (si no existe)
- No se necesitan tablas nuevas — se reutiliza `best_sellers_food` y productos filtrados por categoría

#### Código — Cart.tsx

- Nueva sección entre la lista de items y el resumen: "Complementa tu pedido"
- Carrusel horizontal con:
  - **Best Sellers**: los 4 primeros de `best_sellers_food` que no estén ya en el carrito
  - **Bebidas**: productos de la categoría "bebidas" (nueva)
- Cada tarjeta compacta: imagen, nombre, precio, botón "+" para agregar al carrito
- Hook `useProducts` ya provee `bestSellers`, solo falta filtrar bebidas

#### Código — CartDrawer.tsx

- Versión compacta del upsell: máximo 3 sugerencias en horizontal antes del botón de checkout

---

### Archivos a crear/modificar

| Archivo | Cambio |
|---------|--------|
| **Migración SQL** | Crear tabla `product_extras`, agregar `extras_snapshot` a `order_items`, agregar categoría "bebidas" |
| `src/contexts/CartContext.tsx` | Extender `CartItem` con extras, funciones add/remove extra, recalcular subtotal |
| `src/pages/Cart.tsx` | Sección de extras por producto + sección de sugerencias |
| `src/components/cart/CartDrawer.tsx` | Extras inline + sugerencias compactas |
| `src/components/cart/ProductExtras.tsx` | **Nuevo** — componente de selección de extras |
| `src/components/cart/UpsellSuggestions.tsx` | **Nuevo** — carrusel de sugerencias |
| `src/hooks/useProductExtras.ts` | **Nuevo** — hook para cargar extras por categoría/producto |
| `src/components/admin/ExtrasPanel.tsx` | **Nuevo** — CRUD de extras en admin |
| `src/pages/Admin.tsx` | Agregar pestaña "Extras" |
| `src/pages/Checkout.tsx` | Incluir extras en mensaje WhatsApp y en order_items |

### Lo que NO se toca
- Schemas SEO (RestaurantSchema, FAQSchema, LocalBusinessSchema, SemanticSEOSection)
- Flujo de autenticación
- Lógica de pagos existente
- Precios base de productos

### Orden de implementación sugerido
1. Migración DB (tabla extras + campo en order_items + categoría bebidas)
2. Hook `useProductExtras` + extensión de `CartContext`
3. UI de extras en Cart.tsx y CartDrawer.tsx
4. Sección de sugerencias (upsell)
5. Admin ExtrasPanel
6. Integración con Checkout/WhatsApp

