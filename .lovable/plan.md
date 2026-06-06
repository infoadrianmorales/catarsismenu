## Mover el toggle "Complementar pedido" debajo de los items

Actualmente está arriba (entre el header y la lista). Hay que reubicarlo **después** del listado de productos del carrito, conservando el nuevo diseño llamativo (gradiente Xanthous, Sparkles, CTA circular amarillo).

### Cambios (solo móvil, `src/pages/Cart.tsx`)

1. **Quitar** el bloque del toggle de su posición actual (justo bajo el header del carrito).
2. **Insertarlo** dentro del contenedor scrolleable de items, **al final** de la lista de productos (después del `.map` de items, antes de cerrar el `div` con `overflow-y-auto`). Así el usuario lo ve cuando termina de revisar lo que pidió y aparece justo antes de la barra fija de Finalizar.
3. Mantener intacto el diseño: pill con gradiente `secondary/15`, icono `Sparkles`, sub-label "Snacks, bebidas y más", botón circular Xanthous con rotación 45° al abrir.
4. Mantener el panel desplegable `UpsellSuggestions` justo debajo del toggle con la misma animación `max-h`.

### Lo que NO cambia
- Diseño visual del toggle.
- Lógica de `suggestionsOpen`, items, extras, nota, barra inferior.
- Versión desktop.
