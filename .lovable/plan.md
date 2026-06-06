## Reubicar y destacar el toggle "Complementar pedido"

Actualmente el módulo aparece al final, casi pegado a la barra de Finalizar, en gris discreto. Se pierde.

### Cambios (solo móvil, `src/pages/Cart.tsx`)

1. **Mover el toggle arriba**
   - Sacarlo de su posición actual (después del scroll de items) y colocarlo justo **debajo del header "TU CARRITO"** y **antes** del listado de items.
   - Queda como `flex-shrink-0`, siempre visible al abrir el carrito.

2. **Rediseño más llamativo**
   - Banner pill full-width con fondo `bg-gradient-to-r from-secondary/15 via-secondary/10 to-transparent` + borde `border-secondary/40`.
   - Icono `Sparkles` Xanthous a la izquierda con micro-animación `animate-cart-spring` al hover.
   - Texto: "COMPLEMENTAR PEDIDO" en Phudu uppercase tracking-wide, color `text-foreground` (no muted).
   - Sub-label opcional `text-[10px] text-muted-foreground`: "Snacks, bebidas y más".
   - Botón circular derecho: cuando cerrado → `bg-secondary text-secondary-foreground` (amarillo lleno, no outline gris), con `+`. Cuando abierto → rota 45° a `×`.
   - Altura mínima 56px (más presencia, target táctil cómodo).

3. **Comportamiento**
   - Mismo estado `suggestionsOpen`, misma animación `max-h` 500ms.
   - Al abrir, el panel de sugerencias se despliega **hacia abajo empujando los items** (que siguen scrolleables en su contenedor flex-1).
   - Colapsado por defecto.

### Lo que NO cambia
- Componente `UpsellSuggestions` (mismas dos sub-secciones comida + bebida).
- Items, extras, nota, barra fija inferior, lógica de carrito.
- Versión desktop.
