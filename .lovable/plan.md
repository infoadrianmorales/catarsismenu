## Reorganizar sección "Pedido" del mensaje de WhatsApp

Agrupar los productos por categoría con encabezados destacados, y resaltar los extras seleccionados en una línea separada con su precio.

### Formato nuevo

```text
*Pedido:*

*🍔 HAMBURGUESAS*
• 1x Double Cheesy — $12.00
   ➕ Extras: carne (+$2.50), queso (+$1.50), tocineta (+$1.50)
   📝 Sin cebolla

• 1x Classic — $10.00

*🥤 BEBIDAS*
• 2x Coca-Cola 355ml — $3.00
```

- Los productos se agrupan por `categoria` (mismo orden en que aparecen en el carrito).
- Cada categoría muestra un encabezado en negrita con emoji e ícono en mayúsculas.
- Los extras se listan en una sola línea con `➕ Extras:` y su precio entre paréntesis.
- Las notas del item se mantienen debajo con `📝`.
- El resto del mensaje (saludo, total, entrega, pago, datos) se mantiene igual.

### Cambios técnicos

**Archivo único:** `src/pages/Checkout.tsx` — función `generateWhatsAppMessage` (líneas 310-379).

1. Sustituir el bloque que genera `itemLines` por una agrupación:
   - Reducir `items` a un `Map<categoria, CartItem[]>` preservando el orden de inserción.
   - Mapear cada emoji por categoría (reutilizar mapping ya usado en `useCategories`/`CategorySection` si existe, o hardcodear: hamburguesas 🍔, pizzas 🍕, entradas 🥟, bebidas 🥤, postres 🍰, emparedados 🥪, etc.).
   - Para cada categoría emitir encabezado `*{emoji} {NOMBRE_UPPER}*` y luego cada item.
2. Cambiar el formato de extras a una sola línea: `   ➕ Extras: {nombre} (+{precio}), ...` usando el mismo `formatUSD`/`formatVES` que ya se usa en el archivo.
3. Mantener intacto: saludo, `*Orden:*`, `*Total:*`, sección de entrega, método de pago, datos del cliente, y el disclaimer del delivery.

### Fuera de alcance

- No se modifica el carrito, ni el cálculo de totales, ni la persistencia del pedido.
- No se toca el flujo de confirmación ni el número de orden.