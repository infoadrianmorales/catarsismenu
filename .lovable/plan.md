

## Rediseno del Modulo de Ordenes

### Cambios a implementar

#### 1. Simplificar tabs a 4: Nuevas, Pagadas, Canceladas, Todas

Eliminar la tab "Pendientes". La clasificacion queda:
- **Nuevas**: status NEW, IN_PROGRESS, PENDING, PAYMENT_SUBMITTED
- **Pagadas**: PAID, DELIVERED
- **Canceladas**: CANCELED
- **Todas**: sin filtro

#### 2. Agregar filtro por fecha

Selector de rango con botones rapidos (Hoy, 7 dias, 30 dias, Todo) y dos datepickers opcionales para rango personalizado. Se filtra client-side ya que el volumen es manejable. Los KPIs se recalculan al cambiar el rango.

#### 3. Mejorar KPIs

4 tarjetas que muestran datos del rango seleccionado:
- **Total Ordenes**: cantidad total
- **Ingresos USD**: suma de totales en dolares (el campo `total` siempre esta en USD)
- **Ingresos Bs**: suma de `total * exchange_rate` para mostrar el equivalente en bolivares
- **Ticket Promedio**: ingresos USD / cantidad (excl. canceladas)

#### 4. Mostrar total en la moneda correcta

La columna "Total" en la tabla mostrara ambos montos: el precio en USD y, si la orden fue en VES, tambien el equivalente en bolivares usando el `exchange_rate` de esa orden. Formato: `$11.99 / Bs 4,404.29`.

#### 5. Seleccion por lote (batch actions)

- Agregar checkbox en cada fila de la tabla
- Checkbox "seleccionar todos" en el header
- Cuando hay ordenes seleccionadas, mostrar una barra de acciones con:
  - Contador: "X ordenes seleccionadas"
  - Boton "Marcar como Pagadas" (verde)
  - Boton "Marcar como Canceladas" (rojo)
  - Boton "Deseleccionar"
- Las acciones por lote hacen un UPDATE masivo en la base de datos

#### 6. Auto-cancelacion de ordenes antiguas

Crear funcion SQL `auto_cancel_stale_orders()` que marca como CANCELED las ordenes NEW con mas de 48h. Se ejecuta automaticamente al abrir el panel, y tambien con un boton manual "Limpiar antiguas".

### Archivos a modificar/crear

| Archivo | Accion | Descripcion |
|---------|--------|-------------|
| Migracion SQL | Crear | Funcion `auto_cancel_stale_orders()` |
| `src/components/admin/OrdersPanel.tsx` | Modificar | Simplificar tabs a 4, agregar filtro de fechas, redisenar KPIs con totales USD/Bs, mostrar total en moneda correcta, agregar seleccion por lote con acciones masivas, boton de auto-cancelacion |

### Detalle tecnico

**Tabs simplificadas:**
```text
type OrderTab = 'new' | 'paid' | 'canceled' | 'all';

Nuevas:     status IN ('NEW', 'IN_PROGRESS', 'PENDING', 'PAYMENT_SUBMITTED')
Pagadas:    status IN ('PAID', 'DELIVERED')
Canceladas: status = 'CANCELED'
Todas:      sin filtro
```

**Total en moneda correcta:**
- El campo `total` siempre esta en USD
- Para ordenes en VES: mostrar `$total` + `Bs (total * exchange_rate)`
- Para ordenes en USD: mostrar solo `$total`
- Los KPIs muestran ambos totales agregados

**KPIs rediseñados:**
```text
[Total Ordenes]  [Ingresos $]  [Ingresos Bs]  [Ticket Promedio]
     41           $772.77       Bs 283,764      $18.85
```

**Seleccion por lote:**
```text
Estado: selectedIds: Set<string>

Header checkbox -> seleccionar/deseleccionar todos los visibles
Row checkbox -> toggle individual
Barra de acciones (aparece cuando selectedIds.size > 0):
  [3 ordenes seleccionadas]  [Pagadas ✓]  [Canceladas ✕]  [Deseleccionar]

handleBatchStatusChange(newStatus):
  await supabase.from('orders')
    .update({ status: newStatus })
    .in('id', Array.from(selectedIds))
  actualizar estado local
  limpiar seleccion
```

**Auto-cancelacion SQL:**
```text
CREATE FUNCTION auto_cancel_stale_orders()
RETURNS integer AS
  WITH updated AS (
    UPDATE orders 
    SET status = 'CANCELED'
    WHERE status = 'NEW' 
    AND created_at < now() - interval '48 hours'
    RETURNING id
  )
  SELECT count(*)::integer FROM updated;

-- Se llama via RPC al abrir el panel
```

**Filtro de fechas:**
- Botones rapidos: Hoy, 7 dias, 30 dias, Todo
- Dos Popovers con Calendar de shadcn para rango personalizado
- Filtrado client-side sobre el array de ordenes ya cargadas
- Los KPIs y la tabla se recalculan al cambiar el rango

