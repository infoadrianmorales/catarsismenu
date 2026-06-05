# Plan: Agregar Extras a Hamburguesas

## Objetivo
Insertar 6 nuevos extras/add-ons en la base de datos para que aparezcan únicamente cuando se agregan hamburguesas al carrito.

## Datos a insertar

| Nombre | Precio (USD) |
|---|---|
| Tocineta | 1.50 |
| Queso facilita | 1.50 |
| Pollo crispy | 2.50 |
| Carne smash | 2.50 |
| Cebollas caramelizadas | 0.50 |
| Pepinillos | 1.00 |

## Detalles técnicos

- **Tabla**: `public.product_extras`
- **categoria**: `hamburguesas`
- **product_id**: `NULL` (aplica a toda la categoría de hamburguesas)
- **activo**: `true`
- **orden**: asignados secuencialmente del 2 al 7 (el orden 1 ya existe con "Extra de Carne")

## Verificación existente

Ya se revisó la tabla: existe un extra previo "Extra de Carne" ($1.50) en orden 1, actualmente **inactivo**. Ninguno de los 6 nuevos nombres coincide con él, por lo que no habrá duplicados.

## Resultado esperado

Los clientes verán estos 6 extras como opciones seleccionables al momento de agregar cualquier hamburguesa al carrito.