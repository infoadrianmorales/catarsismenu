

# Plan: Habilitar Cócteles para Delivery

## Problema Identificado

Los cócteles no se pueden agregar al carrito debido a que tienen `is_orderable = false` en la base de datos, aunque ya eliminamos la restricción del código frontend.

### Diagnóstico

| Restricción | Estado | Ubicación |
|-------------|--------|-----------|
| Array `NON_ORDERABLE_CATEGORIES` | ✅ Eliminada | `CartContext.tsx` línea 30 |
| Campo `is_orderable` en BD | ❌ `false` | Tabla `products` (coctelería) |

El código en líneas 61-64 de `CartContext.tsx` verifica este campo:
```typescript
if ('is_orderable' in product && product.is_orderable === false) {
  return false;
}
```

## Solución

Actualizar el campo `is_orderable` a `true` para todos los productos de la categoría "cocteleria" en la base de datos.

---

## Cambio Requerido

| Tipo | Descripción |
|------|-------------|
| Migración SQL | Actualizar `is_orderable = true` para categoría cocteleria |

### Consulta SQL

```sql
UPDATE products 
SET is_orderable = true 
WHERE categoria = 'cocteleria';
```

---

## Productos Afectados

| Producto | Estado Actual | Nuevo Estado |
|----------|---------------|--------------|
| Sangría | `is_orderable: false` | `is_orderable: true` |
| Rum Old Fashioned Tonic | `is_orderable: false` | `is_orderable: true` |
| Flowers | `is_orderable: false` | `is_orderable: true` |
| Catarsis Punch | `is_orderable: false` | `is_orderable: true` |
| Margarita on the Rocks | `is_orderable: false` | `is_orderable: true` |
| Long Island Tea | `is_orderable: false` | `is_orderable: true` |
| Green Gin | `is_orderable: false` | `is_orderable: true` |
| Whipped | `is_orderable: false` | `is_orderable: true` |
| Le Fraisier | `is_orderable: false` | `is_orderable: true` |
| Southside Berry | `is_orderable: false` | `is_orderable: true` |

---

## Resultado Esperado

Después de la migración:
- Los cócteles mostrarán el botón "Agregar" en lugar de "Solo en el local"
- Los usuarios podrán agregar cócteles al carrito
- Los cócteles se incluirán en pedidos de delivery

