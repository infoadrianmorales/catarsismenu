## Cargar extras por categoría

Voy a insertar/actualizar los extras en la tabla `product_extras` en un solo lote, agrupados por categoría. Los extras "Carne 150gr" y "Carne 75gr" para hamburguesas tienen reglas especiales y se cargan ligados a productos específicos (`product_id`); el resto son extras de categoría (`product_id = NULL`).

### Hamburguesas — extras de categoría (`product_id = NULL`)
| Nombre | Precio |
|---|---|
| Tocineta | 1.50 |
| Pollo | 2.50 |
| Pepinillos | 1.00 |
| Jalapeños | 1.00 |
| Queso facilista | 1.50 |
| Cebolla caramelizada | 1.00 |

### Hamburguesas — extras por producto
- **Carne 150gr — $3.00** → ligado a todas las hamburguesas **excepto** Double Cheesy y Thousand Cheesy.
- **Carne 75gr — $1.50** → ligado **solo** a Double Cheesy y Thousand Cheesy.

### Pizzas — extras de categoría
Jalapeño 1.50, Jamón ahumado 1.50, Tocineta 1.50, Pepperoni 1.50, Queso mozarella 3.00, Maíz 1.50, Aceitunas negras 1.50, Champiñones 1.50, Pimentón ahumado 1.50, Tomate seco 1.50, Cebolla caramelizada 1.50, Anchoas 1.50, Miel picante 1.00, Pesto 1.00.

### Emparedados — extras de categoría
Tocineta 1.50, Pollo 2.50, Pepinillos 1.00, Jalapeños 1.00, Queso facilista 1.50, Cebolla caramelizada 1.00.

### Reglas para evitar duplicados
En `hamburguesas` ya existen algunos extras similares. Manejo así:
- **"Tocineta" ($1.50)** → ya existe igual, se omite.
- **"Queso facilita" ($1.50)** → se renombra a "Queso facilista" (typo corregido en tu pedido).
- **"Pepinillos" ($1.00)** → ya existe, se omite.
- **"Cebollas caramelizadas" ($0.50)** → se actualiza a "Cebolla caramelizada" $1.00.
- Los extras existentes que no están en tu lista (Pollo crispy $2.50, Carne smash $2.50, Extra de Carne inactivo) **se dejan tal cual** — no los borro a menos que me lo indiques.
- Se agrega "Pollo $2.50" como extra nuevo (no es el mismo que "Pollo crispy").

### Implementación
Una sola migración (o `INSERT` masivo) con:
1. `UPDATE` de los duplicados a renombrar / actualizar.
2. `INSERT` de los extras de categoría faltantes (hamburguesas, pizzas, emparedados).
3. `INSERT` por producto para las dos variantes de carne en hamburguesas, usando subqueries `WHERE nombre IN (...)`.

El campo `orden` se asignará secuencialmente dentro de cada categoría comenzando desde el siguiente disponible.

### Verificación
Después de aplicar, consulto `product_extras` filtrado por las 3 categorías para confirmar el resultado.
