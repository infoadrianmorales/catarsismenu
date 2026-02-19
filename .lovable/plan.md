

## Optimizar elementos para el Event Setup Tool de Meta Pixel

### Problema

La herramienta de configuracion de eventos de Meta (Event Setup Tool) necesita que los elementos interactivos tengan atributos especificos (`data-meta-event` e `id` unicos) para poder ser seleccionados y mapeados visualmente. Actualmente faltan estos atributos en varios elementos clave.

### Elementos a optimizar

| Elemento | Estado actual | Cambio necesario |
|----------|--------------|-----------------|
| SearchBar (input) | Sin `data-meta-event` ni `id` | Agregar `data-meta-event="Search"` e `id="search-bar"` |
| CartDrawer trigger (header) | Sin `data-meta-event` ni `id` | Agregar `data-meta-event="ViewCart"` e `id="cart-drawer-header"` |
| CartDrawer trigger (sticky) | Sin `data-meta-event` ni `id` | Agregar `data-meta-event="ViewCart"` e `id="cart-drawer-sticky"` |
| CartDrawer "Finalizar Compra" | Sin `data-meta-event` ni `id` | Agregar `data-meta-event="InitiateCheckout"` e `id="checkout-btn"` |

### Cambios por archivo

**`src/components/SearchBar.tsx`**
- Agregar `id="search-bar"` y `data-meta-event="Search"` al `<Input>`
- Envolver el contenedor principal con `role="search"` para mejor semantica

**`src/components/cart/CartDrawer.tsx`**
- Agregar `data-meta-event="ViewCart"` e `id` a los dos botones trigger (header y sticky)
- Agregar `data-meta-event="InitiateCheckout"` e `id="checkout-btn"` al boton "Finalizar Compra"

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/SearchBar.tsx` | Agregar atributos Meta al input |
| `src/components/cart/CartDrawer.tsx` | Agregar atributos Meta a triggers y boton checkout |

