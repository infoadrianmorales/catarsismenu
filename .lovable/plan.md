## Plan: Renombrar Coca-Cola "Menos Azúcar" → "Sabor Original"

Unificar los nombres quitando "Menos Azúcar" de los 3 productos que lo tienen, dejándolos como "Sabor Original".

### Cambios en `nombre` (UPDATE en `products`)

| Slug | Nombre actual | Nombre nuevo |
|---|---|---|
| `coca-cola-menos-azucar-1-5l` | Coca-Cola Sabor Original Menos Azúcar 1.5L | Coca-Cola Sabor Original 1.5L |
| `coca-cola-menos-azucar-2l` | Coca-Cola Sabor Original Menos Azúcar 2L | Coca-Cola Sabor Original 2L |
| `coca-cola-menos-azucar-1l` | Coca-Cola Sabor Original Menos Azúcar 1L | Coca-Cola Sabor Original 1L |
| `coca-cola-original-1l` | Coca-Cola Original 1L | Coca-Cola Sabor Original 1L *(unificar wording)* |

### Conflicto de nombre duplicado

Quedan dos productos con el mismo nombre "Coca-Cola Sabor Original 1L":
- `coca-cola-original-1l` (existente original)
- `coca-cola-menos-azucar-1l` (la nueva foto subida con etiqueta "Menos Azúcar")

Necesito decidir antes de ejecutar: ¿elimino uno, mantengo ambos con sufijo distinto, o dejo solo uno activo? Te pregunto.

### Lo que NO se toca

- `descripcion_corta`, `tags`, `slug`, `imagen_url`, `precio_usd`, `activo` se mantienen.
- Otros productos de Bebidas (Zero, Sin Azúcar, cervezas, agua) no cambian.
- Sin cambios de UI ni código.
