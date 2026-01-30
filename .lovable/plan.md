

# Plan: Resetear Datos de Analíticas, Órdenes y Clientes

## Datos a Eliminar

| Tabla | Registros Actuales | Acción |
|-------|-------------------|--------|
| `order_items` | 74 | Eliminar todos |
| `orders` | 34 | Eliminar todos |
| `customers` | 16 | Eliminar todos |
| `pending_checkouts` | 3 | Eliminar todos |
| `rate_limits` | Variable | Limpiar |
| `order_number_seq` | N/A | Reiniciar a 1 |

---

## Orden de Ejecución

El orden es importante debido a las dependencias entre tablas:

```text
order_items  →  orders  →  customers  →  pending_checkouts  →  rate_limits
     ↓            ↓            ↓               ↓                   ↓
  Depende     Referencia   Independiente   Independiente      Limpieza
  de orders   customer_id
```

---

## Operaciones SQL

Se ejecutará una migración con las siguientes operaciones:

```sql
-- Paso 1: Eliminar items de órdenes (tienen FK a orders)
TRUNCATE TABLE order_items CASCADE;

-- Paso 2: Eliminar órdenes
TRUNCATE TABLE orders CASCADE;

-- Paso 3: Eliminar clientes
TRUNCATE TABLE customers CASCADE;

-- Paso 4: Eliminar checkouts pendientes
TRUNCATE TABLE pending_checkouts;

-- Paso 5: Limpiar rate limits
TRUNCATE TABLE rate_limits;

-- Paso 6: Reiniciar secuencia de números de orden
ALTER SEQUENCE order_number_seq RESTART WITH 1;
```

---

## Resultado Después del Reseteo

| Tabla | Registros |
|-------|-----------|
| `order_items` | 0 |
| `orders` | 0 |
| `customers` | 0 |
| `pending_checkouts` | 0 |
| `rate_limits` | 0 |

La próxima orden creada tendrá el número: **CAT-0001**

---

## Impacto

- Las analíticas mostrarán $0 en ventas y 0 órdenes
- El panel de clientes estará vacío
- El historial de órdenes se eliminará completamente
- Los datos de productos, categorías y configuración NO se afectarán

---

## Nota Importante

Esta acción es **irreversible**. Una vez ejecutada, no se podrá recuperar la información eliminada.

