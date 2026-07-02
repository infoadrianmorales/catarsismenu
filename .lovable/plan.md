## Problema detectado
Aunque el título ya reserva 2 líneas (`min-h-[2.5rem]`) y "Ver más" siempre ocupa espacio, el **párrafo de descripción** no reserva altura: los productos con descripción de 1 línea (ej. Coca-Cola: "Refresco de cola sabor original 355ml") quedan más cortos que los de 2 líneas, empujando el precio + botón "Agregar al carrito" a distinta altura entre tarjetas vecinas.

## Cambio único en `src/components/ExpandableText.tsx`

Reservar altura mínima de 2 líneas en el `<p>` de la descripción para que todas las tarjetas tengan la misma altura de bloque de texto, garantizando que el precio y el botón CTA queden **exactamente al mismo nivel** en toda la grilla.

- Añadir `min-h-[2rem]` al `<p>` (equivale a ~2 líneas de `text-xs leading-relaxed`).
- Añadir el mismo `min-h-[2rem]` al fallback vacío (`if (!text)`) para mantener consistencia cuando un producto no tiene descripción.

## Por qué esto arregla todos los productos
`MenuCard` ya usa `mt-auto` en el contenedor de precio + CTA, así que basta con que todos los bloques superiores tengan altura idéntica. Con las 3 reservas activas (título, descripción, "Ver más"), el CTA queda perfectamente alineado en cualquier categoría (bebidas, cócteles, hamburguesas, etc.), sin importar la longitud del texto.

## Fuera de alcance
No se modifica `MenuCard.tsx`, ni la lógica de precios, ni el botón. Solo el `min-h` del párrafo de descripción.