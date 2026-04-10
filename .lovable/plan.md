

## Plan: Página del carrito completa en una sola pantalla mobile

### Problemas identificados (del screenshot)

1. **El item del carrito no muestra imagen ni nombre** — la card aparece casi vacía, solo se ve el precio y el icono de eliminar. Esto parece un bug de layout donde el contenido se oculta.
2. **La página requiere scroll vertical** — las sugerencias empujan el contenido fuera del viewport. Todo debe caber en una pantalla.
3. **Las cards de sugerencias tienen fondo blanco en las imágenes** — no coinciden con el tema oscuro.

### Solución: Layout de viewport completo

**Archivo: `src/pages/Cart.tsx`**

1. **Layout de viewport fijo en mobile**: Cambiar el contenedor principal a `h-[100dvh] flex flex-col` en mobile para que todo quepa en pantalla sin scroll de página.
2. **Zona de items con flex-1 y overflow-y-auto**: Los items del carrito ocupan el espacio disponible entre el header y las sugerencias, con scroll interno si hay muchos.
3. **Quitar `max-h-[55vh]`** del contenedor de items (línea 116) — el nuevo layout flex lo gestiona automáticamente.
4. **Reducir padding** (`py-6` → `py-2` en mobile, `mb-4` → `mb-2`) para maximizar espacio.
5. **Verificar que el item muestre imagen + nombre**: El código actual parece correcto (líneas 130-208), así que el bug podría ser CSS que oculta el contenido. Asegurar que `overflow-visible` no cause problemas y que la imagen tenga dimensiones mínimas explícitas.

**Archivo: `src/components/cart/UpsellSuggestions.tsx`**

6. **Contenedor de sugerencias con altura fija en mobile**: Asignar `flex-shrink-0` al banner para que no se comprima, pero limitarlo a un tamaño que quepa.
7. **Asegurar `overflow-x-auto` en el carrusel SIN que propague scroll horizontal a la página**: Agregar `overflow-hidden` al wrapper externo del banner, manteniendo `overflow-x-auto` solo en el contenedor de cards.
8. **Cards: mantener `calc((100% - 30px) / 3.5)`** — ya muestra 3 + media card correctamente.

### Estructura mobile resultante

```text
┌──────────────────────────┐
│ Header (compacto)        │
├──────────────────────────┤
│ Tu Carrito    [Vaciar]   │
├──────────────────────────┤
│ ┌──────────────────────┐ │
│ │ 📷 Producto  🗑      │ │  ← items con scroll
│ │ $8.50 c/u  [-][1][+] │ │     interno si > 2
│ └──────────────────────┘ │
├──────────────────────────┤
│ ⚡ COMPLEMENTA TU PEDIDO │
│ [card][card][card][ca... │ │  ← scroll horizontal
├──────────────────────────┤
│ Total $8.50  [Finalizar] │
└──────────────────────────┘
```

### Archivos a modificar

| Acción | Archivo |
|--------|---------|
| Modificar | `src/pages/Cart.tsx` |
| Modificar | `src/components/cart/UpsellSuggestions.tsx` |

### Verificación
1. Todo cabe en una pantalla (390px) sin scroll vertical de la página
2. Cada item muestra imagen, nombre, precio, botones cantidad, botón eliminar
3. El banner de sugerencias muestra 3 cards + media 4ta con scroll horizontal
4. Solo el banner se desplaza horizontalmente, NO la página
5. La barra fija inferior (Total + Finalizar) visible
6. Desktop sin regresiones

