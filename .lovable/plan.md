

# Plan: Filtros Avanzados en Panel de Clientes

## Resumen

Agregaremos capacidades de filtrado avanzado al panel de clientes del administrador, permitiendo filtrar por:
1. **Estado de órdenes**: Pagado, Pendiente, Cancelado, Nuevo
2. **Productos comprados**: Seleccionar un producto específico para ver todos los clientes que lo han pedido

---

## Nueva Interfaz de Filtros

Se agregará una barra de filtros debajo del buscador actual:

```text
┌─────────────────────────────────────────────────────────────────────┐
│  🔍 Buscar...          │ Ordenar: ▼│ 🔄 │ Exportar Meta │          │
├─────────────────────────────────────────────────────────────────────┤
│  Estado: [ Todos ▼ ]   │  Producto: [ Todos los productos ▼ ]      │
└─────────────────────────────────────────────────────────────────────┘
```

### Opciones de Filtro por Estado

| Opción | Descripción | Estados Incluidos |
|--------|-------------|-------------------|
| Todos | Sin filtro de estado | - |
| Pagados | Clientes con al menos una compra pagada | `PAID`, `DELIVERED` |
| Pendientes | Clientes con órdenes pendientes de pago | `PENDING`, `IN_PROGRESS`, `PAYMENT_SUBMITTED` |
| Cancelados | Clientes con órdenes canceladas | `CANCELED` |
| Nuevos | Clientes con órdenes nuevas sin procesar | `NEW` |

### Opciones de Filtro por Producto

- Lista dinámica de todos los productos que han sido pedidos
- Se extraen de `order_items.product_name_snapshot`
- Muestra solo productos que tienen al menos una orden asociada

---

## Lógica de Filtrado

### Flujo de Datos Actualizado

```text
┌──────────────────────────────────────────────────────────────────┐
│                      FETCH CUSTOMERS                              │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│   1. Cargar customers                                             │
│   2. Cargar orders (con status y customer_id)                     │
│   3. Cargar order_items (con product_name_snapshot)  ← NUEVO      │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│              CONSTRUIR MAPAS DE RELACIONES                        │
│  • customerStatuses: customer_id → [status1, status2, ...]        │
│  • customerProducts: customer_id → [product1, product2, ...] NUEVO│
│  • allProducts: Set de productos únicos                     NUEVO │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                      APLICAR FILTROS                              │
│  1. Búsqueda de texto (nombre, email, teléfono)                   │
│  2. Filtro por estado (si no es "todos")                          │
│  3. Filtro por producto (si no es "todos")                        │
│  4. Ordenar por criterio seleccionado                             │
└──────────────────────────────────────────────────────────────────┘
```

### Reglas de Filtrado

#### Filtro por Estado
- Un cliente aparece en el filtro si tiene **al menos una orden** con ese estado
- Ejemplo: Si filtro "Pagados", muestro clientes que tienen mínimo una orden `PAID` o `DELIVERED`

#### Filtro por Producto  
- Un cliente aparece si ha pedido ese producto **en cualquier orden** (sin importar el estado)
- Se usa `product_name_snapshot` de la tabla `order_items`

#### Combinación de Filtros
- Los filtros se aplican en conjunto (AND)
- Ejemplo: Estado="Pagados" + Producto="Alitas" → Clientes que pagaron Y pidieron alitas

---

## Cambios en el Código

### Archivo: `src/components/admin/CustomersPanel.tsx`

#### 1. Nuevos Estados

```text
Estados actuales:
├── customers
├── allOrders
├── loading
├── searchQuery
├── sortBy
└── ...

Nuevos estados:
├── filterStatus: 'all' | 'paid' | 'pending' | 'canceled' | 'new'
├── filterProduct: string (nombre del producto o 'all')
├── customerProducts: Map<string, string[]>  // customer_id → productos
└── allProducts: string[]  // Lista de productos únicos
```

#### 2. Actualizar Fetch de Datos

Agregar query para obtener los productos por cliente:

```text
Query adicional:
SELECT 
  orders.customer_id,
  order_items.product_name_snapshot
FROM orders
JOIN order_items ON orders.id = order_items.order_id
WHERE orders.customer_id IS NOT NULL
```

#### 3. Nueva Lógica de Filtrado

```text
function filterCustomers(customers, statusFilter, productFilter):
  return customers.filter(customer => {
    // 1. Filtro por estado
    if statusFilter != 'all':
      statuses = customerStatusesMap.get(customer.id)
      if not matchesStatusFilter(statuses, statusFilter):
        return false
    
    // 2. Filtro por producto
    if productFilter != 'all':
      products = customerProductsMap.get(customer.id)
      if not products.includes(productFilter):
        return false
    
    return true
  })
```

#### 4. Nuevos Componentes UI

Agregar selectores debajo del buscador existente:

```text
┌─ Select: Estado ──────────────────┐
│  • Todos                          │
│  • 🟢 Pagados (X)                 │
│  • 🟡 Pendientes (X)              │
│  • 🔴 Cancelados (X)              │
│  • 🔵 Nuevos (X)                  │
└───────────────────────────────────┘

┌─ Select: Producto ────────────────┐
│  • Todos los productos            │
│  • Alitas de Pollo Catarsis       │
│  • Ensalada César de Pollo        │
│  • Perla Negra                    │
│  • ...                            │
└───────────────────────────────────┘
```

---

## Estructura de Datos

### Nuevo Mapa de Productos por Cliente

```text
customerProducts: Map<customer_id, product_name[]>

Ejemplo:
{
  "4a4b77e7-...": ["Alitas de Pollo Catarsis", "Papas con Queso", "Rebozados del Mar"],
  "8e928f83-...": ["Alitas de Pollo Catarsis", "Ensalada César", "Perla Negra", "Parrilla de Pollo"],
  ...
}
```

### Nuevo Mapa de Estados por Cliente

```text
customerStatuses: Map<customer_id, status[]>

Ejemplo:
{
  "4a4b77e7-...": ["NEW", "PAID"],
  "8e928f83-...": ["NEW", "PAYMENT_SUBMITTED", "CANCELED"],
  ...
}
```

---

## Resultado Visual Esperado

### Barra de Filtros

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│  Compradores                                                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│  🔍 Buscar...           │Más reciente ▼│ 🔄 │ 📘 Exportar Meta               │
├──────────────────────────────────────────────────────────────────────────────┤
│  Estado: [Todos ▼]      Producto: [Todos los productos ▼]                    │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐                │
│  │ 45         │ │ 127        │ │ $3,420     │ │ $27        │                │
│  │ Compradores│ │ Órdenes    │ │ Ventas     │ │ Ticket Prom│                │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘                │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │ Cliente        │ Contacto       │ # Compras │ Total    │ Última │ 👁   │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │ Juan Pérez     │ +58412...      │    3      │ $45.00   │ 24/01  │ 👁   │   │
│  │ María García   │ +58424...      │    1      │ $22.50   │ 23/01  │ 👁   │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Indicadores de Filtro Activo

Cuando hay filtros activos, se mostrará un badge con la cantidad de resultados filtrados.

---

## Detalles Técnicos

### Opciones de Filtro por Estado

| Valor | Etiqueta | Estados de BD |
|-------|----------|---------------|
| `all` | Todos | - |
| `paid` | Pagados | `PAID`, `DELIVERED` |
| `pending` | Pendientes | `PENDING`, `IN_PROGRESS`, `PAYMENT_SUBMITTED` |
| `canceled` | Cancelados | `CANCELED` |
| `new` | Nuevos | `NEW` |

### Query para Productos

```sql
SELECT DISTINCT 
  orders.customer_id,
  order_items.product_name_snapshot
FROM orders
INNER JOIN order_items ON orders.id = order_items.order_id
WHERE orders.customer_id IS NOT NULL
```

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/admin/CustomersPanel.tsx` | Agregar estados, queries, lógica de filtrado y selectores UI |

