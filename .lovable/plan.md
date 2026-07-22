## Cambios en el mensaje de WhatsApp

Archivo único: `src/pages/Checkout.tsx`, función `generateWhatsAppMessage` (líneas ~309-360).

### 1. Nueva estructura de extras (multi-línea)

Reemplazar la línea única `➕ Extras: a (+$x), b (+$y)` por un bloque de varias líneas, uno por extra, como en la referencia enviada:

```text
*🍔 HAMBURGUESAS*
• 1x Thousand Smash — Bs 12156.96
   *Extras:*
   - Tocineta (+Bs 1105.85)
   - Pepinillos (+Bs 737.23)

*🍕 PIZZAS*
• 1x Hot Honey — Bs 9215.40
   *Extras:*
   - Tocineta (+Bs 1105.85)
   - Maíz (+Bs 1105.85)
```

- La palabra `*Extras:*` va en negrita, en su propia línea, indentada bajo el ítem.
- Cada extra ocupa una línea con guion `- nombre (+precio)`.
- Las notas del ítem (`📝 ...`) se mantienen debajo de los extras.

### 2. Arreglar los emojis que aparecen como rombos (◇ / ◆)

En el WhatsApp del cliente los emojis 🍔🍕🥤 y ➕ se están viendo como rombos porque el dispositivo receptor no tiene glifos para algunos de ellos (o los está reemplazando en tránsito).

Cambios para asegurar renderizado universal:

- Quitar `➕` (se cambia a `*Extras:*` sin emoji — ver punto 1).
- Sustituir el emoji por categoría por un set 100% estándar y ampliamente soportado, y como respaldo agregar un marcador de texto en negrita para que, aunque el emoji falle, el encabezado siga siendo claro. Formato final del encabezado: `*🍔 HAMBURGUESAS*` (sin cambios visuales cuando renderiza) pero validando que la cadena se envíe correctamente vía `encodeURIComponent` (ya se hace en la línea 566, se confirma que no hay doble codificación).
- Añadir un pequeño comentario en el código señalando que si algún cliente sigue viendo rombos, es limitación del set de emojis del dispositivo/OS receptor, no del código.

### 3. Fuera de alcance

- Sin cambios en carrito, totales, RPC de guardado, ni URL de WhatsApp.
- Sin cambios en el saludo, total, sección de entrega, método de pago ni datos del cliente.
- Sin cambios en la vista previa colapsable (usa la misma función, así que refleja el nuevo formato automáticamente).
