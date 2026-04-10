

## Plan: Carrusel horizontal animado para sugerencias del carrito

### Resumen
Reemplazar el scroll estático de `UpsellSuggestions` por un carrusel con flechas de navegación, degradado indicador, y soporte para 10 items. Mantener modo compact sin flechas para CartDrawer/Checkout.

### Cambios

**1. `src/components/cart/UpsellSuggestions.tsx`** — Refactor completo del renderCarousel

- Extraer `renderCarousel` a un sub-componente interno `SuggestionCarousel` con:
  - `useRef` para el contenedor de scroll
  - Estado `canScrollLeft` / `canScrollRight` calculado via `onScroll` y `ResizeObserver`
  - Flechas `ChevronLeft`/`ChevronRight` en círculos semi-transparentes (`bg-black/50 text-white`), posicionadas absolute en los extremos verticalmente centradas
  - Click de flecha: `scrollBy({ left: ±cardWidth*2.5, behavior: 'smooth' })`
  - Degradado derecho (`bg-gradient-to-l from-[#010C23] to-transparent`) que desaparece cuando `!canScrollRight`
  - Degradado izquierdo simétrico cuando `canScrollLeft`
  - En mobile: ocultar flechas con `hidden md:flex`, swipe nativo funciona
  - CSS: `scrollbar-hide overflow-x-auto scroll-smooth`
  - Cuando `compact=true`: sin flechas ni degradados (drawer/checkout son pequeños)
- Cambiar `maxItems` default de 6 a 10
- Agregar comentarios `[2026-04-10]`

**2. `src/pages/Cart.tsx`** — Línea 261

Cambiar `maxItems={6}` → `maxItems={10}`

**3. `src/hooks/useCartSuggestions.ts`**

Sin cambios de lógica necesarios — el hook ya acepta `maxItems` como parámetro y lo usa para `slice()`. Con `maxItems=10` devolverá hasta 10 items automáticamente.

### Archivos

| Acción | Archivo |
|--------|---------|
| Modificar | `src/components/cart/UpsellSuggestions.tsx` |
| Modificar | `src/pages/Cart.tsx` (1 línea) |

### Verificación
Build limpio, flechas visibles en desktop, swipe en mobile, degradado aparece/desaparece, 10 items en Cart, 3 en drawer/checkout, source `'suggestion'` intacto.

