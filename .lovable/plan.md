

## Plan: Agregar botón "Ir al inicio" en la página de producto

### Problema
Después de agregar un producto al carrito, el usuario queda atrapado en la página del producto sin una forma clara de volver al menú principal. El botón "Volver" usa `navigate(-1)` que puede no funcionar correctamente si el usuario llegó directamente a la página.

### Cambio

**Archivo:** `src/pages/ProductPage.tsx`

- Agregar un botón "Ir al menú" (link a `/`) junto al botón "Ver carrito" que aparece después de agregar productos al carrito.
- Cuando `quantity > 0`, el layout mostrará dos botones: "Ir al menú" y "Ver carrito", para que el usuario pueda seguir comprando o ir al carrito.
- También cambiar el botón "Volver" superior de `navigate(-1)` a un `Link to="/"` para garantizar que siempre lleve al inicio, incluso si no hay historial de navegación.

