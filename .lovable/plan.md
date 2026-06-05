## Cambios en `src/components/cart/AddToCartButton.tsx` (variantes `default`, `compact`, `icon`)

Reemplazar el pill actual por el estilo Dynamic CTA v2:

- **Botón**: `group relative w-full rounded-full bg-primary px-4 py-3 flex items-center justify-center gap-2 shadow-[0_0_20px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:brightness-110 active:scale-95 transition-all duration-300`
- **Ícono `ShoppingCart`** (lucide): `h-3.5 w-3.5` con `stroke="hsl(var(--secondary))"` (amarillo Xanthous) + animación `spring-bounce` al hover (keyframes en `index.css` o `tailwind.config.ts`).
- **Texto**: `font-display font-bold uppercase tracking-widest text-[10px] text-primary-foreground select-none`. Se mantiene "Agregar al carrito" en todas las variantes (cabe porque la letra baja a 10px).
- **Underline amarilla animada**: `<span>` absoluto `-bottom-2 left-1/2 -translate-x-1/2 h-[2px] w-0 rounded-full bg-secondary opacity-0 transition-all duration-300 group-hover:w-16 group-hover:opacity-100 group-active:w-24 group-active:bg-white`.
- **Pulse hover sutil**: capa absoluta `inset-0 rounded-full bg-secondary/10 opacity-0 group-hover:opacity-100`.
- Eliminar la prop `isCompactLabel` (texto unificado).
- Cambiar contenedor del botón a `relative pb-2` para dar espacio a la línea inferior sin recortarla.

## Animación spring-bounce

Agregar a `tailwind.config.ts` (extend.keyframes + animation) un keyframe `cart-spring` equivalente al prototipo (translate + scale + rotate) con duración 0.6s, aplicado al ícono cuando el grupo está en hover via `group-hover:animate-[cart-spring_0.6s_cubic-bezier(0.25,1,0.5,1)_forwards]`.

## Lo que NO se toca

- Layout de `MenuCard.tsx` y `CompactProductCard.tsx` (siguen con CTA full-width vertical bajo el precio).
- Lógica de carrito, estado de cantidades +/-, `!isOrderable`, tracking Meta Pixel, toasts.
- `ProductPage.tsx`.

## Notas técnicas

- Se usan tokens del design system (`bg-primary`, `bg-secondary`, `text-primary-foreground`) en vez de hex literales del prototipo.
- La línea amarilla queda dentro del card porque el contenedor padre tiene `gap-3`/`gap-2` suficiente.
- El touch target sigue ≥40px (py-3 ≈ 44px total).
