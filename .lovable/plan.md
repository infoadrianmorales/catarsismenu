## Objetivo

Mostrar una sección de "También te puede gustar" al final de cada página de producto (`/{categoria}/{slug}`), con el mismo estilo visual del carrusel de sugerencias del carrito, para incentivar la compra cruzada.

## Alcance

Aplica automáticamente a **todos los productos existentes y futuros** (se renderiza dentro de `ProductPage.tsx`, que es el componente único para todas las URLs de producto).

## Lógica de sugerencias (contextual al producto visto)

Se creará un nuevo hook `useProductSuggestions(product)` reutilizando las mismas reglas del carrito, adaptadas al contexto de "estoy viendo un producto":

1. **Nunca** incluir el producto actual.
2. **Nunca** incluir coctelería ni postres (mismas exclusiones del negocio).
3. Solo productos `is_orderable` y de categorías activas.
4. **Prioridad 1 — Complementos**: hasta 6 productos de categorías distintas a la del producto visto (con best sellers primero). Por ejemplo, viendo una hamburguesa → sugerir papas, emparedados, parrilla.
5. **Prioridad 2 — Bebidas**: si la categoría "bebidas" está activa y el producto visto no es una bebida, hasta 6 bebidas en un segundo carrusel ("¿Algo para tomar?").
6. **Prioridad 3 — Misma categoría**: si el producto visto es una bebida (o no hay suficientes complementos), rellenar con otros productos de la misma categoría, excluyendo el actual.
7. Rotación diaria con `seededShuffle` (misma técnica del carrito).

## Componente visual

Se reutilizará `UpsellSuggestions` extrayendo el `SuggestionCarousel` interno a un componente compartido, para no duplicar UI:

- `src/components/cart/UpsellSuggestions.tsx` → sigue consumiendo `useCartSuggestions` (sin cambios funcionales para el carrito).
- Nuevo `src/components/product/ProductSuggestions.tsx` → consume `useProductSuggestions(product)` y renderiza el mismo carrusel con títulos:
  - "También te puede gustar" (complementos / misma categoría)
  - "¿Algo para tomar?" (bebidas, solo si aplica)
- Mismo estilo: banner Rich Black `#0a1628`, borde sutil, acento Xanthous `#F2B60F`, flechas navegables, 3 tarjetas visibles en desktop y ~3.5 en móvil.

## Integración en la página de producto

En `src/pages/ProductPage.tsx`, insertar `<ProductSuggestions product={product} />` justo **antes del Footer**, dentro de un contenedor `container mx-auto px-4 pb-10` para que respete el ancho del layout.

Al hacer clic en "+" en una sugerencia:
- Se ejecuta `addToCart(product, 'suggestion')` (mismo evento analítico que ya existe).
- La página **no navega**: solo suma al carrito, mostrando el toast estándar. Así el usuario puede seguir viendo el producto original y agregar varios.

## Casos borde

- **Sin sugerencias disponibles** (categorías desactivadas o catálogo muy pequeño): el componente retorna `null` y no ocupa espacio.
- **Producto sin categoría válida**: no se renderiza.
- **Carga**: mientras `useProducts` está cargando, no se muestra placeholder (el hook devuelve `[]`).

## Archivos a crear / modificar

### Nuevos
- `src/hooks/useProductSuggestions.ts` — hook contextual al producto visto.
- `src/components/product/ProductSuggestions.tsx` — wrapper visual reutilizando el carrusel.

### Refactor menor (no cambia comportamiento del carrito)
- `src/components/cart/UpsellSuggestions.tsx` — exportar `SuggestionCarousel` para reutilizarlo. Alternativa: extraer a `src/components/shared/SuggestionCarousel.tsx` e importarlo desde ambos lugares (preferido, más limpio).

### Integración
- `src/pages/ProductPage.tsx` — importar y renderizar `<ProductSuggestions />` antes del `<Footer />`.

## Fuera de alcance

- No se toca el carrito ni el checkout.
- No se cambia el estilo visual del carrusel (se hereda tal cual del carrito para mantener consistencia).
- No se agregan sugerencias en la home ni en las páginas de categoría (ya tienen su propio listado).
