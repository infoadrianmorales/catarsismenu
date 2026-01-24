
# Plan: Segmentación de Órdenes y Exportación para Meta

## Resumen

Reorganizaremos el panel de órdenes para separar claramente tres segmentos de clientes según su estado en el embudo de compra, y habilitaremos la exportación de datos de clientes optimizada para subir a Meta Ads Manager.

---

## Los 3 Segmentos de Clientes

| Segmento | Definición | Cómo se detecta |
|----------|------------|-----------------|
| **Pagado** | Cliente completó el pago | Órdenes con status `PAID` o `DELIVERED` |
| **Proceso Abierto** | Llegó a WhatsApp pero no pagó | Órdenes con status `NEW` o `IN_PROGRESS` (nunca marcadas como pagadas) |
| **Carrito Abandonado** | Agregó productos pero no completó checkout | Carrito guardado sin orden asociada |

---

## Fase 1: Reorganización del Panel de Órdenes

### 1.1 Tabs de Filtrado Rápido

Se agregarán tabs en la parte superior del panel de órdenes:

```text
┌──────────────────────────────────────────────────────────────────┐
│  [Pendientes de Pago (11)] [Pagadas (0)] [Entregadas] [Todas]   │
└──────────────────────────────────────────────────────────────────┘
```

| Tab | Estados Incluidos | Color |
|-----|-------------------|-------|
| Pendientes de Pago | `NEW`, `IN_PROGRESS`, `PAYMENT_SUBMITTED` | Azul/Amarillo |
| Pagadas | `PAID` | Verde |
| Entregadas | `DELIVERED` | Morado |
| Canceladas | `CANCELED` | Rojo |
| Todas | Todos los estados | - |

### 1.2 Tarjetas KPI en la Cabecera

Mostrar métricas rápidas:

- Pendientes de pago (número de órdenes sin pagar)
- Pagadas hoy/esta semana
- Ingresos del día (solo órdenes pagadas)
- Canceladas

### 1.3 Indicador Visual Mejorado

Cada fila de la tabla mostrará claramente el estado con colores más prominentes para identificar rápidamente qué necesita atención.

---

## Fase 2: Exportación de Clientes para Meta

### 2.1 Funcionalidad de Exportación

Se agregará un botón "Exportar para Meta" en el panel de Clientes que generará un archivo CSV compatible con Meta Custom Audiences.

### 2.2 Formato del CSV para Meta

Meta requiere columnas específicas con datos normalizados:

| Columna CSV | Origen en BD | Formato |
|-------------|--------------|---------|
| `email` | `customers.email` | minúsculas, sin espacios |
| `phone` | `customers.phone` | formato E.164 (+584241234567) |
| `fn` | `customers.first_name` | minúsculas |
| `ln` | `customers.last_name` | minúsculas |
| `country` | (fijo) | VE |

### 2.3 Opciones de Filtrado en Exportación

El usuario podrá elegir qué clientes exportar mediante un diálogo:

| Filtro | Descripción |
|--------|-------------|
| Todos los clientes | Exporta toda la base de datos |
| Solo clientes con compras pagadas | Clientes que tienen al menos una orden con status `PAID` o `DELIVERED` |
| Solo clientes con proceso abierto | Clientes cuyas órdenes están en `NEW`/`IN_PROGRESS` pero nunca pagaron |

### 2.4 Normalización de Teléfonos

Los teléfonos se convertirán automáticamente al formato E.164 requerido por Meta:

```text
Ejemplos de conversión:
04241234567     → +584241234567
+584241234567   → +584241234567
0424-123-4567   → +584241234567
424 123 4567    → +584241234567
```

---

## Fase 3: Carritos Abandonados (Simplificado)

### 3.1 Situación Actual

Actualmente los carritos se guardan en `localStorage` del navegador y son anónimos (no hay datos del cliente hasta que llega al checkout).

### 3.2 Enfoque Propuesto

Para detectar carritos abandonados sin modificar significativamente el flujo actual, implementaremos:

**Nueva tabla `pending_checkouts`:**
- Se crea un registro cuando el usuario llega a la página de Checkout con un carrito
- Guarda temporalmente: items del carrito, timestamp, un ID único
- Si el checkout se completa exitosamente, se elimina el registro
- Los registros que permanecen por más de X horas sin completar son "carritos abandonados"

### 3.3 Flujo de Detección

```text
Usuario en /checkout
       │
       ▼
┌─────────────────┐
│ Crear registro  │
│ pending_checkout│
└────────┬────────┘
         │
    ¿Completa?
    │       │
   Sí      No
    │       │
    ▼       ▼
┌────────┐  ┌───────────────┐
│Eliminar│  │ Queda como    │
│registro│  │ "abandonado"  │
└────────┘  └───────────────┘
```

### 3.4 Limitación Importante

Sin datos de contacto del usuario antes del checkout, no podemos recuperar carritos abandonados para remarketing directo. La tabla `pending_checkouts` servirá para:
- Estadísticas de conversión (% que llega a checkout vs % que completa)
- Si el usuario ingresa su email/teléfono primero (posible mejora futura), entonces sí se puede contactar

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/admin/OrdersPanel.tsx` | Agregar tabs de filtrado y tarjetas KPI |
| `src/components/admin/CustomersPanel.tsx` | Agregar botón y diálogo de exportación para Meta |
| `src/pages/Checkout.tsx` | Registrar entrada a checkout para tracking de abandono |

## Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| `src/lib/metaExport.ts` | Funciones de formateo y generación de CSV para Meta |

## Cambios en Base de Datos

| Tabla | Cambios |
|-------|---------|
| `pending_checkouts` | Nueva tabla para tracking de carritos abandonados |

---

## Resultado Esperado

Al completar esta implementación:

1. **Panel de Órdenes Mejorado**
   - Filtros rápidos por estado de pago
   - Vista clara de qué órdenes necesitan seguimiento
   - KPIs de ingresos y conversión

2. **Exportación para Meta Ads**
   - Un clic para descargar CSV compatible
   - Datos normalizados automáticamente
   - Filtros para segmentar la audiencia

3. **Tracking de Abandono**
   - Visibilidad de cuántos usuarios llegan al checkout sin completar
   - Base para futuras mejoras de recuperación de carritos
