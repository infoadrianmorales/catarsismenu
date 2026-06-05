## Problema

En la sección "Productos Destacados" los botones "Agregar al carrito" quedan a distintas alturas porque las descripciones tienen diferente número de líneas (algunas con "Ver más", otras sin él). El botón debe quedar siempre alineado al fondo de cada tarjeta.

## Cambio en `src/components/MenuCard.tsx`

- Card raíz: agregar `h-full flex flex-col` para que cada tarjeta ocupe toda la altura del grid.
- `CardContent`: convertirlo en `flex flex-col flex-1` (estructura vertical full-height).
- Contenedor de contenido (padding interno): `flex flex-col flex-1`.
- Bloque de prices + CTA: agregar `mt-auto` para empujarlo al fondo, independientemente del largo de la descripción.

Resultado: imágenes alineadas arriba, descripciones variables en el medio, precios + botón siempre clavados al fondo → simetría perfecta en toda la fila.

## Lo que NO se toca

- Estilo del botón CTA (ya tiene la forma Dynamic v2 con underline amarilla).
- `CompactProductCard` (ya usa `h-full flex flex-col` con `mt-auto`).
- Lógica, datos, precios.