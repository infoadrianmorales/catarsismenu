

## Auditoría (Fase 1)

### 1. Contraste insuficiente
Lighthouse reporta contraste insuficiente en:
- **"Ver más" / "Ver menos"** buttons en `ExpandableText.tsx` (L56): `text-primary` (#DB1F54) sobre fondo card (#111222) — ratio 3.82:1, necesita 4.5:1
- **"Ver todo"** links en `CategorySection.tsx` (L43): `text-primary` (#DB1F54) sobre fondo background (#0E0F1B) — ratio 3.93:1

Estos son los dos patrones que causan ~60+ fallos de contraste. El color `text-primary` (#DB1F54) no tiene suficiente contraste sobre los fondos oscuros del tema.

### 2. Botones sin nombre accesible
- **AddToCartButton** (variant `icon`, L56-64): botón con solo `<Plus>`, sin `aria-label`
- **AddToCartButton** (botones +/-, L84-100): sin `aria-label`
- **StickyActionBar** share button (L96-103): `sticky-share-btn` sin `aria-label`

### 3. `<main>` landmark
No existe `<main>` en `Index.tsx` ni en `App.tsx`.

### 4. Touch targets insuficientes
- **Hero dot indicators** (`HeroSection.tsx` L242-251): `h-2 w-2` / `h-2 w-5` = 8x8px y 20x8px
- Los dots del carousel son los únicos reportados por Lighthouse como target-size failures

---

## Plan de Correcciones (Fase 2)

### Corrección 1 — Contraste de texto
**`src/components/ExpandableText.tsx` L56** — Cambiar `text-primary` a `text-primary/90` con un color más claro. Dado que #DB1F54 no pasa AA sobre fondos oscuros, usar `text-[#FF4D7A]` (versión más clara del Raspberry, ratio ~5.2:1 sobre #111222).

**`src/components/CategorySection.tsx` L43** — Mismo cambio en el link "Ver todo": `text-primary` → `text-[#FF4D7A]`.

### Corrección 2 — Botones sin aria-label
**`src/components/cart/AddToCartButton.tsx`**:
- L56 (icon variant): agregar `aria-label={`Agregar ${product.nombre} al carrito`}`
- L84-90 (decrease): agregar `aria-label="Disminuir cantidad"`
- L93-99 (increase): agregar `aria-label="Aumentar cantidad"`

**`src/components/StickyActionBar.tsx`**:
- L96 share button: agregar `aria-label="Compartir menú"`

### Corrección 3 — Agregar `<main>`
**`src/pages/Index.tsx`** — Envolver el contenido entre `<MenuHeader>` y `<Footer>` con `<main>`. No incluir el header ni los componentes flotantes/sticky.

### Corrección 4 — Touch targets del carousel
**`src/components/HeroSection.tsx` L242-251** — Aumentar el área táctil de los dot indicators usando padding invisible: `min-w-[44px] min-h-[44px] flex items-center justify-center` como wrapper, manteniendo el dot visual pequeño con un pseudo-element o inner span.

### Resumen de archivos

| Archivo | Cambio |
|---------|--------|
| `src/components/ExpandableText.tsx` | Color contraste "Ver más" |
| `src/components/CategorySection.tsx` | Color contraste "Ver todo" |
| `src/components/cart/AddToCartButton.tsx` | aria-labels en 3 botones |
| `src/components/StickyActionBar.tsx` | aria-label en share |
| `src/pages/Index.tsx` | Agregar `<main>` landmark |
| `src/components/HeroSection.tsx` | Touch target dots carousel |

### Lo que NO se toca
- Schemas (RestaurantSchema, LocalBusinessSchema, FAQSchema, SemanticSEOSection)
- Colores del brandbook en elementos que ya pasan contraste
- Footer, funcionalidad de botones, hrefs

