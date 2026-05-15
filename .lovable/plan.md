## Reordenar productos de Bebidas

Agrupar por tipo y tamaño (de mayor a menor) actualizando el campo `orden` en la tabla `products`.

### Nuevo orden propuesto

| # | Producto | Tamaño |
|---|----------|--------|
| 0 | Coca-Cola Sabor Original 2L | 2L |
| 1 | Coca-Cola Sabor Original 1.5L | 1.5L |
| 2 | Coca-Cola Sabor Original 1L | 1L |
| 3 | Coca-Cola Sabor Original 600ml | 600ml |
| 4 | Coca-Cola Sin Azúcar 2L | 2L |
| 5 | Coca-Cola Sin Azúcar 1L | 1L |
| 6 | Coca-Cola Zero 500ml | 500ml |
| 7 | Agua Mineral Nevada 600ml | 600ml |
| 8 | Cerveza Polar Light 250ml | 250ml |
| 9 | Cerveza Polar Pilsen 219ml | 219ml |
| 10 | Cerveza Solera Classic 250ml | 250ml |
| 11 | Cerveza Solera Light 250ml | 250ml |

### Lógica de agrupación

1. **Coca-Cola Sabor Original** (todas juntas, mayor a menor)
2. **Coca-Cola Sin Azúcar** (mayor a menor)
3. **Coca-Cola Zero**
4. **Agua**
5. **Cervezas** agrupadas por marca (Polar, Solera), de mayor a menor tamaño

### Cambios técnicos

- Un solo `UPDATE` por producto sobre `products.orden` (12 filas).
- No se modifican nombres, precios, imágenes ni estado `activo`.
- No hay cambios de código frontend.