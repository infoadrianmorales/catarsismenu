

# Plan: Reorganización de Tabs de Órdenes

## Resumen

Reorganizaremos las pestañas del panel de órdenes para reflejar mejor el flujo operativo del negocio, fusionando "Pagadas" y "Entregadas" en un solo tab, y separando las órdenes nuevas de las pendientes por tiempo.

---

## Nueva Estructura de Tabs

| Tab | Estados Incluidos | Descripción | Icono |
|-----|-------------------|-------------|-------|
| **Nuevas** | `NEW` | Órdenes recién recibidas (< 60 min) | ⭐ Sparkles |
| **Pendientes** | `IN_PROGRESS`, `PAYMENT_SUBMITTED` | Órdenes en espera de pago (> 60 min sin acción) | ⏰ Clock |
| **Pagadas** | `PAID`, `DELIVERED` | Órdenes con pago confirmado o entregadas | ✅ CheckCircle |
| **Canceladas** | `CANCELED` | Órdenes canceladas | ❌ XCircle |
| **Todas** | Todos los estados | Vista completa | 📦 ShoppingBag |

---

## Lógica de Clasificación Automática

### Regla de los 60 minutos

Las órdenes con estado `NEW` que tengan más de 60 minutos desde su creación se mostrarán automáticamente en la pestaña "Pendientes" en lugar de "Nuevas".

```text
Flujo de clasificación:
┌─────────────────────────────────────┐
│      Orden creada (status: NEW)     │
└─────────────────┬───────────────────┘
                  │
         ¿Tiene más de 60 min?
                  │
        ┌─────────┴─────────┐
        │                   │
       No                  Sí
        │                   │
        ▼                   ▼
┌─────────────┐    ┌─────────────────┐
│ Tab "Nuevas"│    │ Tab "Pendientes"│
└─────────────┘    └─────────────────┘
```

### Criterio de Tiempo

- **Nuevas**: Órdenes `NEW` creadas hace menos de 60 minutos
- **Pendientes**: Órdenes `NEW` con más de 60 minutos + `IN_PROGRESS` + `PAYMENT_SUBMITTED`

---

## Cambios en el Código

### 1. Actualizar TAB_CONFIG

Se modificará la configuración de pestañas:

```text
TAB_CONFIG actual:
├── pending: ['NEW', 'IN_PROGRESS', 'PAYMENT_SUBMITTED']
├── paid: ['PAID']
├── delivered: ['DELIVERED']
├── canceled: ['CANCELED']
└── all: []

TAB_CONFIG nuevo:
├── new: ['NEW'] (con filtro < 60 min)
├── pending: ['IN_PROGRESS', 'PAYMENT_SUBMITTED', 'NEW > 60 min']
├── paid: ['PAID', 'DELIVERED']
├── canceled: ['CANCELED']
└── all: []
```

### 2. Lógica de Filtrado Inteligente

Se implementará una función que clasifique las órdenes según:
1. Estado de la orden
2. Tiempo transcurrido desde la creación (para órdenes `NEW`)

### 3. Actualizar KPIs

Los KPIs se ajustarán para reflejar la nueva estructura:
- **Nuevas**: Cantidad de órdenes nuevas (< 60 min)
- **Pendientes**: Órdenes que requieren seguimiento
- **Pagadas hoy/semana**: Combinación de `PAID` + `DELIVERED`
- **Canceladas**: Sin cambios

### 4. Actualizar Grid de Tabs

El grid pasará de 5 columnas a 5 (mismo número, diferentes tabs):
- Se elimina "Entregadas" 
- Se renombra "Pendientes" → "Nuevas"
- Se agrega nuevo "Pendientes" con lógica de tiempo

---

## Archivo a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/admin/OrdersPanel.tsx` | Actualizar TAB_CONFIG, lógica de filtrado, KPIs y etiquetas |

---

## Detalles de Implementación

### Nueva Lógica de Clasificación

```text
function classifyOrder(order):
  if order.status == 'CANCELED':
    return 'canceled'
  if order.status in ['PAID', 'DELIVERED']:
    return 'paid'
  if order.status == 'NEW':
    if minutesSinceCreation(order) < 60:
      return 'new'
    else:
      return 'pending'
  if order.status in ['IN_PROGRESS', 'PAYMENT_SUBMITTED']:
    return 'pending'
  return 'all'
```

### Nuevos Iconos y Etiquetas

| Tab | Icono | Etiqueta | Color Fondo |
|-----|-------|----------|-------------|
| Nuevas | Sparkles | "Nuevas" | Azul |
| Pendientes | Clock | "Pendientes" | Amarillo/Naranja |
| Pagadas | CheckCircle | "Pagadas" | Verde |
| Canceladas | XCircle | "Canceladas" | Rojo |
| Todas | ShoppingBag | "Todas" | Gris |

---

## Resultado Esperado

1. **Tab "Nuevas"**: Muestra solo órdenes `NEW` recientes (< 60 min) - foco en atención inmediata
2. **Tab "Pendientes"**: Órdenes que necesitan seguimiento (> 60 min sin pago o en proceso)
3. **Tab "Pagadas"**: Todas las órdenes exitosas (pagadas + entregadas) en un solo lugar
4. **Eliminación de redundancia**: Ya no hay tab separado de "Entregadas"
5. **Automatización**: Las órdenes se mueven automáticamente de "Nuevas" a "Pendientes" después de 60 min

---

## Flujo Visual del Cliente

```text
┌───────────┐    ┌───────────────┐    ┌──────────┐
│  NUEVAS   │ →  │  PENDIENTES   │ →  │ PAGADAS  │
│ (< 60min) │    │ (> 60min sin  │    │ (PAID o  │
│           │    │  actualizar)  │    │DELIVERED)│
└───────────┘    └───────────────┘    └──────────┘
                         │
                         ▼
                  ┌────────────┐
                  │ CANCELADAS │
                  └────────────┘
```

