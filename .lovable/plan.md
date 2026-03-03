

## Plan: 4 cambios en el panel de administración

### 1. Módulo de Metricool en ConfigPanel

**Archivo:** `src/components/admin/ConfigPanel.tsx`

Agregar una nueva Card al final del componente con:
- Campo de texto para el **hash ID de Metricool** (actualmente hardcodeado como `4157fa87e6bd40d5b2591b9947e24168` en `index.html`)
- Botón guardar que almacena el valor en la tabla `config` con key `metricool_hash`
- Descripción explicando que es el identificador del script de seguimiento
- Se cargará el valor existente desde config al montar

**Archivo:** `index.html`
- Cambiar el hash hardcodeado para que se lea dinámicamente no es posible en un HTML estático, así que el campo en config servirá como referencia para el admin, pero el hash real deberá actualizarse manualmente en `index.html`. Se mostrará una nota informativa indicando esto.

Alternativamente, se puede mover el script de Metricool a un componente React (`MetricoolProvider`) que lea el hash desde la config de la base de datos, haciéndolo dinámico. Esto es más robusto.

**Enfoque elegido:** Crear un componente `MetricoolScript` que lea `metricool_hash` desde config y cargue el script dinámicamente. Remover el script estático de `index.html`.

### 2. Arreglar selector de fecha personalizado en Analíticas

**Archivo:** `src/components/admin/AnalyticsPanel.tsx`

El problema: `handleDateSelect` espera `range?.from && range?.to` simultáneamente, pero el componente `Calendar` en modo `range` primero selecciona `from` y luego `to`. Cuando solo hay `from`, no se actualiza nada.

**Solución:** Cambiar el handler para almacenar selecciones parciales (solo `from`) y completar cuando se seleccione `to`. Usar el tipo `DateRange` correctamente y no cerrar el popover hasta que ambas fechas estén seleccionadas.

### 3. Órdenes: mostrar todas las órdenes activas sin filtro de fecha por defecto

**Archivo:** `src/components/admin/OrdersPanel.tsx`

Actualmente el preset por defecto es `'30days'` con `dateFrom = subDays(new Date(), 30)`. 

**Cambio:** En la pestaña "Nuevas", mostrar TODAS las órdenes que no estén pagadas ni canceladas, independientemente de la fecha. Cambiar el default a `'all'` con `dateFrom = undefined` y `dateTo = undefined`.

### 4. Modificar horario del cron de sincronización BCV

El cron actual está configurado para ejecutarse 2 veces al día (9:00 AM y 9:00 PM UTC = 5:00 AM y 5:00 PM VET).

**Nuevo horario:** Ejecutarse cada hora entre las 5:00 PM y 9:00 PM hora Venezuela (VET = UTC-4), es decir de 21:00 a 01:00 UTC. Eso serían 5 ejecuciones: 21:00, 22:00, 23:00, 00:00 y 01:00 UTC.

**Implementación:** Eliminar el cron existente y crear uno nuevo vía SQL (usando insert tool, no migration):
```sql
SELECT cron.unschedule('sync-bcv-morning');
SELECT cron.unschedule('sync-bcv-evening');

SELECT cron.schedule(
  'sync-bcv-afternoon',
  '0 21,22,23,0,1 * * *',
  $$ SELECT net.http_post(
    url:='https://qucqigemdbyclxqjzkbs.supabase.co/functions/v1/sync-bcv-rate',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}'::jsonb,
    body:='{}'::jsonb
  ) as request_id; $$
);
```

También actualizar el texto descriptivo en `ConfigPanel.tsx` línea 247 de "Se actualiza automáticamente a las 5:00 AM y 5:00 PM" a "Se actualiza automáticamente cada hora entre 5:00 PM y 9:00 PM (hora Venezuela)".

---

### Resumen de archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/components/admin/ConfigPanel.tsx` | Agregar Card de Metricool + actualizar texto del cron |
| `src/components/admin/AnalyticsPanel.tsx` | Arreglar selector de rango de fechas personalizado |
| `src/components/admin/OrdersPanel.tsx` | Cambiar filtro por defecto a "Todo" |
| `index.html` | Remover script estático de Metricool |
| `src/components/MetricoolProvider.tsx` | Nuevo: carga dinámica del script desde config |
| `src/App.tsx` | Incluir MetricoolProvider |
| SQL (cron) | Reconfigurar horario de sincronización BCV |

