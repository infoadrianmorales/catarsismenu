Reordenar la categoría **Bebidas** para que los 4 jugos nuevos aparezcan primero en el feed principal.

## Nuevo orden

1. Jugo de Fresa
2. Jugo de Parchita
3. Jugo de Piña
4. Limonada
5. Coca-Cola Original 2L
6. Coca-Cola Original 1.5L
7. Coca-Cola Original 1L
8. Coca-Cola Original 355ml
9. Coca-Cola Sin Azúcar 2L
10. Coca-Cola Sin Azúcar 1L
11. Coca-Cola Zero 355ml
12. Agua Mineral Nevada 600ml
13. Cerveza Polar Light 250ml
14. Cerveza Polar Pilsen 219ml
15. Cerveza Solera Classic 250ml
16. Cerveza Solera Light 250ml

## Cambio técnico

- `UPDATE` al campo `orden` de las 16 filas de `products` con `categoria='bebidas'` vía la herramienta de datos de Cloud. No se toca esquema, código ni imágenes.
- En el Home (`CategorySection` con `slice(0,4)`) los 4 jugos serán los visibles con el botón "Ver más".