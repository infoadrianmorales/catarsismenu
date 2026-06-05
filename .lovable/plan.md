## Cambios

### 1. Mantener visible la lista de bebidas aunque ya haya 1+
**Archivo:** `src/hooks/useCartSuggestions.ts`

Hoy las bebidas desaparecen del banner "¿Algo para tomar?" en cuanto el carrito tiene al menos una bebida (`!hasBeverages` en la línea 117). Esto impide pedir varias.

- Quitar la condición `!hasBeverages`.
- Mantener únicamente: hay comida en el carrito + categoría bebidas activa.
- El filtro base ya excluye las bebidas que ya están en el carrito (`cartIds`), por lo que la lista solo mostrará otras bebidas disponibles, sin duplicar las que el usuario ya agregó.

### 2. Extras como desplegable con llamada llamativa
**Archivo:** `src/pages/Cart.tsx` (y opcionalmente refinamiento visual en `ProductExtras.tsx`)

Hoy los extras se renderizan siempre abiertos debajo de cada producto del carrito (líneas 211-227), lo que alarga mucho la tarjeta.

- Envolver `<ProductExtras />` en un botón colapsable (estado local `expandedExtras: Record<string, boolean>`, análogo a `expandedNotes`).
- Botón siempre visible con:
  - Ícono `Sparkles` (o `Plus` en círculo) en color **secondary** (Xanthous).
  - Frase llamativa en mayúsculas Phudu: **"✨ ¡HAZLO ÉPICO! AGREGA EXTRAS"** (texto editable).
  - Contador si ya hay extras seleccionados: `(2 agregados)` en color secundario.
  - Chevron up/down a la derecha.
- Por defecto **colapsado**. Si el item ya tiene extras seleccionados (regresa al carrito), se abre automáticamente.
- Mantener el mismo componente `<ProductExtras />` interno; solo cambia el wrapper.

### 3. Resumen breve del pedido en la columna derecha (desktop)
**Archivo:** `src/pages/Cart.tsx` (bloque `lg:col-span-1 hidden lg:block`, líneas 277-327)

Hoy el resumen solo muestra subtotal y total. Agregar una lista compacta de los items entre el título "Resumen del pedido" y el subtotal:

```
RESUMEN DEL PEDIDO
─────────────────────────
2× Hot Honey            $19.00
1× Coca-Cola Sin Azúcar  $3.50
3× Pepinillos (extras)   $3.00
─────────────────────────
Subtotal (3 items)      $25.99
TOTAL                   $25.99
```

Detalles:
- Lista con scroll interno si supera ~5 items (`max-h-48 overflow-y-auto`).
- Cada línea: `cantidad × nombre` truncado + precio de línea (incluye extras).
- Si el item tiene extras, mostrar sub-línea muy pequeña tipo `+ Tocineta, Pepinillos` en `text-[10px] text-muted-foreground`.
- Tipografía pequeña (`text-xs`), separadores sutiles, no compite visualmente con el Total.
- Solo aplica a desktop (mobile ya tiene el desglose expandible inferior, no se toca).

## Fuera de alcance
- No se tocan precios, lógica de carrito, ni base de datos.
- No se tocan los extras a nivel mobile más allá del cambio compartido en `Cart.tsx` (al estar en el mismo componente, el desplegable aplicará también en mobile, lo que ayuda a compactar la vista).
