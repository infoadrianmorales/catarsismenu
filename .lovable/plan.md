

## Mejorar el boton del carrito en el header

### Situacion actual

El boton del carrito en el header (`MenuHeader.tsx`) usa el componente `CartDrawer` con variante `header`, que se renderiza como un boton cuadrado tipo icono (`size="icon"`) con solo el icono del carrito y un badge con el numero de items. No muestra el costo total ni tiene un tamano adecuado para un evento de pixel efectivo.

### Cambios propuestos

**Modificar la variante `header` del `CartDrawer`** para que cuando haya items en el carrito:

1. **Tamano mas grande**: Cambiar de `size="icon"` a un boton rectangular con padding que muestre icono + cantidad + precio
2. **Mostrar el subtotal**: Incluir el precio formateado junto al badge de cantidad (ej: "3 | $15.50")
3. **Animacion al agregar productos**: Mantener el efecto de escala actual pero agregar una transicion suave cuando el boton crece de icono a boton con texto
4. **Navegacion directa**: Al hacer clic, navegar a `/carrito` en lugar de abrir el drawer (el drawer se mantiene para la variante `floating` en desktop)
5. **Atributos de pixel**: Mantener `data-meta-event="ViewCart"` e `id="cart-btn-header"` para el rastreo de Meta Pixel

### Comportamiento esperado

- **Sin items**: Boton tipo icono ghost (igual que ahora)
- **Con items**: Boton rectangular con fondo `secondary`, que muestra: icono carrito + badge de cantidad + subtotal formateado. Al hacer clic navega a `/carrito`

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/cart/CartDrawer.tsx` | Modificar el `TriggerButton` de la variante `header`: cuando `totalItems > 0`, renderizar un boton mas grande con subtotal visible, y cambiar la accion de abrir drawer a navegar a `/carrito` |
| `src/components/MenuHeader.tsx` | Ajuste menor si es necesario para acomodar el boton mas ancho |

### Detalle tecnico

**CartDrawer - variante header con items:**
- Cambiar de `size="icon"` a un boton con `gap-2 px-3 h-10 rounded-full`
- Mostrar: `ShoppingCart` icon + Badge con cantidad + subtotal formateado (usando `formatPrice`)
- Mantener `bg-secondary hover:bg-secondary/90 text-secondary-foreground`
- Animacion: `transition-all duration-300` para la transicion suave de tamano
- Cuando `totalItems > 0`, el boton del Sheet no abre el drawer sino que navega a `/carrito` usando `onClick` con `e.preventDefault()` en el `SheetTrigger` y redirigiendo con `navigate`

**CartDrawer - variante header sin items:**
- Se mantiene igual: boton ghost con icono solamente

**Flujo resultante:**
- Usuario agrega producto -> boton header crece suavemente mostrando cantidad y total
- Usuario hace clic en el boton -> navega a `/carrito`
- En `/carrito` puede finalizar la compra

