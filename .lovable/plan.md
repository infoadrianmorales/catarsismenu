

# Plan: Simplificar Gestión de Estados de Órdenes

## Resumen

Modificaremos el panel de órdenes para que:
1. Todas las órdenes con estado `NEW` caigan siempre en la pestaña "Nuevas" (sin regla de 60 minutos)
2. El selector de estado muestre solo 3 opciones claras: **Pagado**, **Pendiente** y **Cancelado**

---

## Cambios Propuestos

### 1. Eliminar la Regla de 60 Minutos

La función `classifyOrder` se simplificará:

| Estado Actual | Tab Destino |
|---------------|-------------|
| `NEW` | Nuevas (siempre) |
| `IN_PROGRESS`, `PAYMENT_SUBMITTED` | Pendientes |
| `PAID`, `DELIVERED` | Pagadas |
| `CANCELED` | Canceladas |

### 2. Simplificar Opciones de Estado

El selector de estado pasará de 6 opciones a 3:

| Opción Actual | Nueva Opción |
|---------------|--------------|
| Nuevo | ❌ Se elimina |
| En Proceso | ❌ Se elimina |
| Pago Enviado | ❌ Se elimina |
| Pagado | ✅ **Pagado** |
| Entregado | ❌ Se elimina (fusionado con Pagado) |
| Cancelado | ✅ **Cancelado** |
| (nuevo) | ✅ **Pendiente** |

Nuevas opciones del selector:
```text
┌─────────────────────────────────┐
│  🟢 Pagado    → status: PAID    │
│  🟡 Pendiente → status: PENDING │
│  🔴 Cancelado → status: CANCELED│
└─────────────────────────────────┘
```

### 3. Flujo Operativo Simplificado

```text
┌─────────────────────────────────────────────────────────────┐
│                    ORDEN NUEVA LLEGA                         │
│                    (status: NEW)                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │   Tab "NUEVAS"       │
              │   (todas las NEW)    │
              └──────────┬───────────┘
                         │
         Operador revisa y decide:
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   PAGADO     │ │  PENDIENTE   │ │  CANCELADO   │
│  (cliente    │ │  (espera     │ │  (no se      │
│   ya pagó)   │ │   de pago)   │ │   concreta)  │
└──────────────┘ └──────────────┘ └──────────────┘
        │                │                │
        ▼                ▼                ▼
  Tab "Pagadas"   Tab "Pendientes"  Tab "Canceladas"
```

---

## Cambios en el Código

### Archivo: `src/components/admin/OrdersPanel.tsx`

#### 1. Actualizar STATUS_OPTIONS

Reducir las opciones del selector a 3:

```text
STATUS_OPTIONS actual (6 opciones):
├── NEW
├── IN_PROGRESS
├── PAYMENT_SUBMITTED
├── PAID
├── DELIVERED
└── CANCELED

STATUS_OPTIONS nuevo (3 opciones):
├── PAID (verde)      → "Pagado"
├── PENDING (amarillo) → "Pendiente"
└── CANCELED (rojo)   → "Cancelado"
```

#### 2. Simplificar classifyOrder

Eliminar la lógica de tiempo:

```text
function classifyOrder(order):
  if status == 'CANCELED':
    return 'canceled'
  if status in ['PAID', 'DELIVERED']:
    return 'paid'
  if status == 'NEW':
    return 'new'  // ← Siempre va a Nuevas
  if status in ['IN_PROGRESS', 'PAYMENT_SUBMITTED', 'PENDING']:
    return 'pending'
  return 'all'
```

#### 3. Actualizar getStatusBadge

Agregar soporte para el nuevo estado `PENDING`:

```text
STATUS_DISPLAY:
├── NEW → Azul, "Nuevo"
├── PENDING → Amarillo, "Pendiente"
├── PAID → Verde, "Pagado"
├── DELIVERED → Morado, "Entregado"
└── CANCELED → Rojo, "Cancelado"
```

---

## Estados en Base de Datos

| Estado | Descripción |
|--------|-------------|
| `NEW` | Orden recién creada, sin revisar |
| `PENDING` | Orden revisada, esperando pago |
| `PAID` | Pago confirmado |
| `DELIVERED` | Entregado (se trata igual que PAID en UI) |
| `CANCELED` | Cancelada |

**Nota**: Los estados `IN_PROGRESS` y `PAYMENT_SUBMITTED` existentes seguirán funcionando y aparecerán en "Pendientes".

---

## Resultado Esperado

1. **Tab "Nuevas"**: Todas las órdenes `NEW` sin importar antigüedad
2. **Selector simplificado**: Solo 3 opciones (Pagado, Pendiente, Cancelado)
3. **Flujo claro**: Nueva → Pendiente/Pagado/Cancelado
4. **Compatibilidad**: Los estados antiguos (`IN_PROGRESS`, `PAYMENT_SUBMITTED`, `DELIVERED`) siguen funcionando

---

## KPIs Actualizados

| KPI | Descripción |
|-----|-------------|
| Nuevas | Órdenes con estado `NEW` |
| Pendientes | Órdenes `PENDING`, `IN_PROGRESS`, `PAYMENT_SUBMITTED` |
| Pagadas | Órdenes `PAID` o `DELIVERED` |
| Canceladas | Órdenes `CANCELED` |

