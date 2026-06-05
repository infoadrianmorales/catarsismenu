Activar los 12 productos de la categoría **Bebidas** que actualmente están inactivos:

- Agua Mineral Nevada 600ml
- Cerveza Polar Light 250ml
- Cerveza Polar Pilsen 219ml
- Cerveza Solera Classic 250ml
- Cerveza Solera Light 250ml
- Coca-Cola Sabor Original 355ml / 1L / 1.5L / 2L
- Coca-Cola Sin Azúcar 1L / 2L
- Coca-Cola Zero 355ml

## Cambio

Una sola operación en la base de datos: marcar `activo = true` en todos los productos cuya categoría sea `bebidas`. Esto los hace visibles en el menú público.

## Lo que NO se toca

Precios, imágenes, descripciones, orden ni configuración de la categoría.