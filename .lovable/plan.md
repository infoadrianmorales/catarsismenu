

## Plan: Agregar filtro "Todo" al AnalyticsPanel

### Resumen
Agregar un preset "Todo" a los filtros de fecha del AnalyticsPanel que muestre el historial completo. Adaptar la granularidad del gráfico para rangos largos. El OrdersPanel ya tiene "Todo", no necesita cambios.

### Cambios

**1. `src/components/admin/AnalyticsPanel.tsx`**

- Agregar `'all'` al tipo `DatePreset`:
  ```typescript
  type DatePreset = 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'all' | 'custom';
  ```

- Agregar al array `presets`:
  ```typescript
  { key: 'all', label: 'Todo' },
  ```

- En `getDateRange`, agregar caso `'all'`:
  ```typescript
  case 'all':
    return { start: new Date('2020-01-01'), end: endOfDay(now), granularity: 'daily' as const };
  ```

- Adaptar granularidad del gráfico: para "Todo", el rango puede ser de años. `eachDayOfInterval` generaría miles de puntos. Solución: en `chartData` (useMemo línea ~110), cuando el preset sea `'all'`, agrupar los datapoints por semana o mes para que el gráfico sea legible. Se agrupará por mes si el rango es mayor a 90 días.

- Ajustar el `dateLabel` en `chartData`: para granularidad mensual usar `format(date, "MMM yy")`.

**2. `src/hooks/useSalesAnalytics.ts`**

- Agregar soporte para granularidad `'monthly'` al tipo y al cálculo de `series`. Usar `eachMonthOfInterval` de date-fns para generar los puntos cuando `granularity === 'monthly'`.

**3. `src/hooks/usePageViews.ts`**

- Agregar soporte para granularidad `'monthly'` al tipo para que las visitas también se agrupen correctamente con el filtro "Todo".

### Archivos

| Acción | Archivo |
|--------|---------|
| Modificar | `src/components/admin/AnalyticsPanel.tsx` |
| Modificar | `src/hooks/useSalesAnalytics.ts` |
| Modificar | `src/hooks/usePageViews.ts` |

### No se modifica
- `OrdersPanel.tsx` — ya tiene "Todo"
- `ProductSalesDashboard.tsx` — recibe `startDate/endDate` del AnalyticsPanel, funciona automáticamente
- RPCs — aceptan cualquier rango de fechas, sin cambios

### Verificación
Build limpio, botón "Todo" visible y funcional, gráfico legible con granularidad mensual, todas las secciones y tabs responden al filtro.

