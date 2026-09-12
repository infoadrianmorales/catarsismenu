# Nueva pizza: Chistorrini

Agregar la pizza Chistorrini al menú, usando la foto enviada, sin tocar los demás productos ni el diseño.

## Datos del producto

- Categoría: Pizzas
- Nombre: Chistorrini
- Descripción: Base cremosa de queso crema y mozzarella, cubierta con chistorra, jamón ahumado, tocineta, cebolla y maíz, finalizada con un toque de pimienta negra.
- Precio: $12,50
- Etiqueta: "Nuevo"
- Aparece de primera en Pizzas y también entre los destacados de la página principal
- Disponible para pedir, igual que las demás pizzas

## La foto

- Se recorta al cuadrado centrado sobre la pizza (mismo formato 1:1 que el resto del menú), sin deformarla ni retocar colores ni ingredientes.
- Se guarda en tres tamaños optimizados en WebP (miniatura, tarjeta y detalle), igual que los productos recientes, buscando un peso por debajo de ~30 KB en la versión de tarjeta sin perder nitidez.
- Texto alternativo: "Pizza Chistorrini con chistorra, jamón ahumado, tocineta, cebolla y maíz - Catarsis Lechería".
- La carga diferida y el diseño adaptable ya vienen del sistema actual de tarjetas; no se cambia nada ahí.

## Orden de la categoría

Chistorrini queda en la posición 1 y las pizzas actuales bajan una posición: Margarita, Paradise, Pepperoni, Tasty, Veggie, Hot Honey. No se modifica ningún otro dato de esos productos.

## Detalles técnicos

- Procesar `IMG_8520.JPG` con recorte central 1:1 y generar `products/chistorrini.webp` (800), `chistorrini_400.webp` y `chistorrini_200.webp`; subirlas al bucket `product-images`.
- `INSERT` en `products` (slug `chistorrini`, categoría `pizzas`, `orden = 1`, `tags = {Nuevo}`, `destacado = true`, `activo = true`, `is_orderable = true`) y `UPDATE` de `orden` en las pizzas existentes.
- Añadir la misma entrada al catálogo de respaldo `src/data/menuItems.ts` para que se vea aunque falle la red.

## Verificación

Revisar en el navegador que la foto cargue sin rutas rotas, que Chistorrini salga primero en Pizzas y en destacados, que su página individual funcione y que nada más cambie.
