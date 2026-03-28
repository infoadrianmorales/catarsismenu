

## Plan: Preview del carrito al pasar el mouse (hover)

### Concepto
Agregar un popup flotante que aparece al hacer hover sobre el botón del carrito en el header. Muestra una vista previa compacta de los productos agregados con una animación de slide desde la derecha. Al hacer click, sigue navegando a `/carrito`.

### Cambio principal

**Archivo: `src/components/cart/CartDrawer.tsx`**

Para el variant `header` con items > 0:
- Envolver el botón en un contenedor con `onMouseEnter` / `onMouseLeave`
- Al hacer hover, mostrar un div posicionado absolute (debajo-derecha del botón) con:
  - Lista compacta de productos (imagen miniatura + nombre + cantidad + precio)
  - Subtotal
  - Botón "Ver carrito completo"
- Animación: `animate-slide-in-right` o CSS transition con `translate-x` y `opacity`
- Al salir el mouse, ocultar con la animación inversa
- El click del botón sigue navegando a `/carrito` (sin cambios)
- Solo visible en desktop (`hidden` en mobile)

### Estructura del popup

```
┌──────────────────────┐
│ 🛒 Tu carrito (3)    │
├──────────────────────┤
│ [img] Hamburguesa x2 │
│       $12.00         │
│ [img] Coca-Cola   x1 │
│       $2.00          │
├──────────────────────┤
│ Subtotal:    $14.00  │
│ [Ver carrito →]      │
└──────────────────────┘
```

### Detalle técnico
- Estado `hoverOpen` con `useState(false)` + timer de 200ms para evitar flicker al mover el mouse
- Max 4 items visibles + "y X más..." si hay más
- Posición: `absolute right-0 top-full mt-2 w-80 z-50`
- Animación con clases de Tailwind: `transition-all duration-300 translate-x-0 opacity-100` (visible) vs `translate-x-4 opacity-0` (oculto)
- El Sheet drawer existente no se afecta (solo se usa en sticky/floating)

### Sin cambios
- CartContext, Cart.tsx, checkout, extras, schemas, rutas, FloatingCartButton

