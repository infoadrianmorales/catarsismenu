## Problema
En mobile, al expandir el desglose inferior solo se ve "Subtotal" y "Equivalente". Falta la lista breve de items (igual que la del panel derecho en desktop).

## Cambio
**Archivo:** `src/pages/Cart.tsx` (bloque `summaryExpanded` mobile, líneas 423-440)

Agregar arriba del subtotal una lista compacta con scroll interno:
- `max-h-40 overflow-y-auto` para no comer toda la pantalla.
- Cada línea: `cantidad × nombre` truncado + precio de línea (incluye extras).
- Sub-línea `+ Tocineta, Pepinillos` en `text-[10px] text-muted-foreground` si tiene extras.
- Separador sutil debajo (`border-b border-border/40 pb-2 mb-2`).
- Tipografía `text-xs` consistente con el resumen desktop.

Misma fuente de verdad que el desktop (mismo cálculo `extrasTotal + precio_usd × quantity`).

## Fuera de alcance
- No se toca el resumen desktop ni la lógica de carrito.
- No se cambia el comportamiento del chevron (sigue toggle).
