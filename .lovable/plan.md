## Rediseño móvil del Carrito — Dirección "Carruseles compactos v3"

Aligerar la página `/cart` en móvil aplicando la dirección seleccionada, manteniendo TODA la funcionalidad actual (items, extras, nota, sugerencias de comida y bebida, total fijo, finalizar por WhatsApp, modo local oculta cart). Sin tocar la versión desktop.

### Cambios visuales

1. **Item del carrito (más denso)**
   - Imagen 80x80 con `rounded-xl`
   - Stepper de cantidad en pill `bg-white/5` + border `border-white/10`, símbolos `-` / `+` en Raspberry
   - Botón "Personalizar" como toggle minimal a la derecha del stepper (en vez de bloques abiertos de extras y nota)
   - Extras y nota colapsados por defecto, se despliegan al tocar "Personalizar" (animación `max-h` 300ms)
   - Extras como chips compactos `text-[9px]`, nota como `textarea` pequeño

2. **Sugerencias unificadas en un solo módulo colapsable**
   - Reemplazar los dos bloques apilados ("Complementa tu pedido" + "¿Algo para tomar?") por un único toggle "COMPLEMENTAR PEDIDO" con botón circular `+` que rota a `×` al abrir
   - Al expandir, muestra dos sub-secciones horizontales scrolleables:
     - "Snacks & Entradas" (cards 112px ancho)
     - "Bebidas Frías" (cards 96px ancho, más compactas)
   - Cards mini: imagen + nombre truncado + precio Xanthous + botón circular `+` Raspberry (5x5)
   - Colapsado por defecto → primera vista del carrito se siente vacía y ordenada

3. **Barra fija de checkout rediseñada**
   - Subtotal arriba a la izquierda con label `text-[10px]` uppercase + "Impuestos incluidos"
   - Monto grande en Phudu `text-2xl` a la derecha
   - Botón "FINALIZAR PEDIDO" full-width `rounded-2xl` con sombra Raspberry, separador vertical interno entre label y monto
   - `backdrop-blur-xl` sobre `bg-[#010C23]/95`

4. **Header**
   - Título "TU CARRITO" en Phudu, botón "CERRAR" como pill outline a la derecha

### Lo que NO cambia
- Lógica de carrito, hooks (`useCartSuggestions`, `useProductExtras`), conversión USD/VES, WhatsApp redirect, modo local, equivalente VES, cálculo de extras
- Desktop layout (solo aplica a `md:hidden` / breakpoint móvil)
- Resumen móvil expandible existente al final (subtotal + items + equivalente) se mantiene

### Archivos a editar
- `src/pages/Cart.tsx` — refactor de la sección `md:hidden` (items, sugerencias, barra fija)
- `.lovable/plan.md` — actualizar registro

### Tokens (ya existen en el design system)
- `bg-background` (#010C23), `text-primary` (Raspberry), `text-accent` (Xanthous), Phudu/DM Sans
- Usar tokens semánticos, no hex directos
