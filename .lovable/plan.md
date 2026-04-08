

## Plan: Sugerencias contextuales en el carrito

### Resumen
Crear un hook `useCartSuggestions` que analiza el contenido del carrito para generar sugerencias inteligentes, reemplazar la lógica interna de `UpsellSuggestions.tsx`, y agregar sugerencias en el checkout.

### Archivos a crear

**1. `src/hooks/useCartSuggestions.ts`** — Hook de sugerencias contextuales

- Recibe `maxItems` como parámetro
- Usa `useCart()`, `useProducts()`, `usePublicCategories()` como fuentes de datos
- Constante `EXCLUDED_CATEGORIES = ['cocteleria', 'postres']`
- Analiza el carrito: `categoriesInCart`, `hasFoodItems`, `hasBeverages`
- Genera dos pools:
  - **Pool A (complementos)**: productos de categorías de comida que NO están en el carrito, excluyendo bebidas y categorías excluidas. Best sellers van primero.
  - **Pool B (bebidas)**: solo si la categoría `bebidas` está activa en la DB
- Lógica de mezcla:
  - Carrito con comida + bebidas inactiva → 100% Pool A
  - Carrito con comida + bebidas activa + sin bebidas en carrito → 60% Pool B + 40% Pool A
  - Carrito con comida + ya tiene bebidas → 100% Pool A
  - Carrito solo bebidas → 100% Pool A (best sellers de comida)
  - Carrito vacío → arrays vacíos
- Shuffle con seed diario (`Date.now() / 86400000 | 0`) para rotación consistente por día
- Retorna `{ foodSuggestions, beverageSuggestions, isLoading }`

### Archivos a modificar

**2. `src/components/cart/UpsellSuggestions.tsx`**

- Reemplazar lógica interna de filtrado por `useCartSuggestions(maxItems)`
- Mantener diseño visual idéntico: cards, scroll horizontal, colores, iconos
- Sección comida usa `foodSuggestions`, sección bebidas usa `beverageSuggestions`
- Mantener `addToCart(product, 'suggestion')` para source tracking
- Si ambos arrays están vacíos → no renderizar nada
- Comentarios `[2026-04-08]` explicando el refactor

**3. `src/pages/Checkout.tsx`**

- Importar `UpsellSuggestions`
- Renderizar `<UpsellSuggestions maxItems={3} compact />` antes del botón de confirmar pedido
- Al agregar producto desde checkout, el resumen se actualiza automáticamente (ya es reactivo vía CartContext)

### Archivos que NO se modifican
- `CartDrawer.tsx` — ya monta `<UpsellSuggestions maxItems={3} compact />`, sigue igual
- `Cart.tsx` — ya monta `<UpsellSuggestions maxItems={6} />`, sigue igual
- `CartContext.tsx` — sin cambios, ya tiene source tracking
- Sistema de extras — sin cambios

### Detalle técnico: Shuffle determinístico

```typescript
const seededShuffle = <T,>(arr: T[], seed: number): T[] => {
  const copy = [...arr];
  let s = seed;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};
```

### Verificación
Se verificará build con `npx tsc --noEmit` y se reportará la lista completa de archivos, comportamiento contextual, exclusiones, y puntos de montaje.

