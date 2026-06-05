Reemplazar el botón cuadrado de ícono en las tarjetas del menú por un CTA pill con ícono de carrito + texto "Agregar al carrito", reutilizando el mismo estilo del botón grande de la página de producto (Raspberry, Phudu uppercase, hover lift + sombra raspberry + glow xanthous).

## Archivos a modificar

### 1. `src/components/cart/AddToCartButton.tsx`
- Cambiar la variante `icon` (usada por `CompactProductCard`) para que renderice un **botón ancho full-width**:
  - `w-full rounded-full bg-primary text-primary-foreground`
  - Texto `Agregar` (corto, para que quepa en grid mobile de 2 columnas) con `font-display font-bold uppercase tracking-tight text-xs sm:text-sm`
  - Ícono `ShoppingCart` `h-4 w-4` con `group-hover:scale-110`
  - Altura mínima `h-10` (cumple touch target accesibilidad)
  - Hover: `hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_8px_20px_-8px_hsl(var(--primary)/0.6),0_0_16px_3px_hsl(var(--secondary)/0.25)]`
  - `active:scale-[0.98]`, `transition-all duration-300`
- Cambiar la variante `default`/`compact` para que use el mismo estilo pill con texto completo `Agregar al carrito` (tarjetas grandes `MenuCard`).
- Mantener intacta la lógica de cantidades (estado +/- cuando `quantity > 0`) y los handlers existentes.

### 2. `src/components/CompactProductCard.tsx`
- Cambiar el contenedor del precio + botón de `flex items-end justify-between` a un layout en columna:
  - Precio arriba (mantiene formato actual)
  - Botón debajo, full-width
- Quitar el `gap` lateral; agregar `gap-2` vertical.

### 3. `src/components/MenuCard.tsx`
- Pasar `variant="default"` al `AddToCartButton` (en lugar de `compact`) o ajustar el contenedor para que el botón se vea full-width debajo del precio, consistente con la tarjeta compacta.

## Lo que NO se toca
- `ProductPage.tsx` (ya tiene el CTA grande aplicado).
- Lógica de carrito, tracking, toasts, `CartContext`.
- Estado de cantidades (+/-) que aparece después de agregar.
- Caso `!isOrderable` (mantiene "Solo en el local").

## Notas técnicas
- Los grids actuales en mobile son de 2 columnas, por eso en `icon` se usa texto corto "Agregar" y en `default` (tarjetas grandes) texto completo "Agregar al carrito".
- Se mantiene la accesibilidad: `aria-label`, touch target ≥40px, `data-meta-event="AddToCart"`.
