

## Plan: Dashboard detallado de ventas y comportamiento por origen

### Resumen
Crear 4 RPCs SQL para agregar datos server-side, un hook para consumirlas, y un componente dashboard que se integra debajo de las secciones existentes del AnalyticsPanel. No se modifica nada existente.

### Paso 1: Migraciones SQL (4 RPCs)

Una sola migración con las 4 funciones:

1. **`get_product_sales_history(date_from, date_to, category_filter)`** — historial de ventas por producto con cantidad, ingresos, última venta, categoría
2. **`get_sales_by_category(date_from, date_to)`** — ventas agrupadas por categoría
3. **`get_sales_by_source(date_from, date_to)`** — ventas agrupadas por source con porcentaje
4. **`get_extras_analytics(date_from, date_to)`** — extras vendidos desde extras_snapshot JSONB

Todas usan `SECURITY DEFINER`, `search_path = ''`, JOINs contra `orders` y `order_items`, excluyendo status `CANCELED`. La DB tiene 350 order_items, todos con source `menu` (esperado, el tracking se activó hoy).

### Paso 2: Hook `src/hooks/useProductSalesAnalytics.ts`

- Recibe `dateFrom`, `dateTo`, `categoryFilter` (opcional)
- Llama las 4 RPCs en paralelo con `Promise.all`
- Re-ejecuta cuando cambian los filtros
- Retorna `{ productHistory, salesByCategory, salesBySource, extrasAnalytics, isLoading, error }`

### Paso 3: Componente `src/components/admin/ProductSalesDashboard.tsx`

4 secciones con Tabs de shadcn/ui:

**Tab 1 — Historial de Productos**: Tabla ordenable (click en headers) con búsqueda por nombre y filtro de categoría. Columnas: Producto, Categoría, Cantidad, Ingresos, Pedidos, Última venta. Totales al pie.

**Tab 2 — Ventas por Categoría**: BarChart horizontal (Recharts) + tabla resumen con % del total.

**Tab 3 — Origen de Compras (Source)**: PieChart (Recharts) con colores de marca asignados. Labels legibles (menu→"Menú directo", best_seller→"Best Sellers", etc.). Banner informativo sobre la fecha de activación del tracking.

**Tab 4 — Extras Vendidos**: Lista ranking o mensaje informativo si no hay datos.

Colores de marca: Ocean Blue `#04308C`, Raspberry `#DB1F51`, Xanthous `#F2B60F`, Light Sea Green `#14B2AA`, violeta `#8B5CF6`.

### Paso 4: Integrar en `src/components/admin/AnalyticsPanel.tsx`

- Importar `ProductSalesDashboard`
- Renderizar al final del componente (después de la grid de 3 columnas, línea ~500)
- Pasar `startDate={start}` y `endDate={end}` para sincronizar filtros
- Separador visual con título "Detalle de Ventas y Comportamiento"
- Sin tocar ninguna sección existente

### Archivos

| Acción | Archivo |
|--------|---------|
| Crear | `supabase/migrations/add_sales_analytics_rpcs.sql` |
| Crear | `src/hooks/useProductSalesAnalytics.ts` |
| Crear | `src/components/admin/ProductSalesDashboard.tsx` |
| Modificar | `src/components/admin/AnalyticsPanel.tsx` (solo agregar import + render al final) |

### Verificación
Build con `npx tsc --noEmit`, confirmar que las RPCs devuelven datos, y que las secciones existentes del AnalyticsPanel no se alteran.

