

# Plan: Dashboard de Analíticas con Volumen de Ventas

## Resumen

Crear un dashboard interactivo estilo Shopify que combine métricas de tráfico (visitas, páginas vistas) con datos de ventas (pedidos, ingresos) para dar una visión completa del rendimiento del negocio.

---

## Vista Previa del Dashboard

```text
┌─────────────────────────────────────────────────────────────────────────┐
│  📊 Analíticas                    [Hoy] [7 días ▼] [30 días] [📅]      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐        │
│  │    245     │  │    892     │  │     18     │  │   $456     │        │
│  │  Visitas   │  │  Páginas   │  │  Pedidos   │  │  Ingresos  │        │
│  │   ↑ 12%    │  │   ↑ 8%     │  │   ↑ 25%    │  │   ↑ 18%    │        │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘        │
│                                                                          │
│  [Visitas ▼] [Pedidos] [Ingresos]                                       │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         ╭───────╮                                │    │
│  │                    ╭────╯       ╰────╮                           │    │
│  │               ╭────╯                 ╰────╮                      │    │
│  │          ╭────╯                           ╰────╮                 │    │
│  │     ╭────╯                                     ╰────────         │    │
│  │ ────╯                                                            │    │
│  │ Lun   Mar   Mié   Jue   Vie   Sáb   Dom                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────┐  ┌────────────────────────────┐   │
│  │  📈 Top Productos               │  │  💳 Métodos de Pago        │   │
│  │  1. Burger Classic — 24 uds     │  │  Zelle ████████░░ 45%      │   │
│  │  2. Pizza Pepperoni — 18 uds    │  │  Pago Móvil ███░░░ 30%     │   │
│  │  3. Wings BBQ — 15 uds          │  │  USDT ██░░░░ 15%           │   │
│  └─────────────────────────────────┘  └────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Métricas a Mostrar

### KPIs Principales (Tarjetas Superiores)

| Métrica | Fuente | Descripción |
|---------|--------|-------------|
| Visitantes | Analytics API | Usuarios únicos en el período |
| Páginas vistas | Analytics API | Total de vistas de páginas |
| Pedidos | Tabla `orders` | Órdenes creadas (excluye canceladas) |
| Ingresos | Tabla `orders` | Suma de `total` en USD (PAID/DELIVERED) |

### Gráficas Seleccionables

| Gráfica | Datos |
|---------|-------|
| Visitas | Serie temporal de visitantes |
| Páginas vistas | Serie temporal de pageviews |
| Pedidos | Órdenes por día/hora |
| Ingresos | Ventas en USD por día/hora |

### Widgets Secundarios

| Widget | Contenido |
|--------|-----------|
| Top Productos | 5 productos más vendidos en el período |
| Métodos de Pago | Distribución % de métodos usados |
| Tasa de Conversión | Visitantes → Pedidos |

---

## Selectores de Rango de Fechas

### Presets Rápidos
- **Hoy** → Granularidad horaria
- **Ayer** → Granularidad horaria  
- **7 días** → Granularidad diaria (default)
- **30 días** → Granularidad diaria
- **Este mes** → Desde día 1 del mes

### Selector Personalizado
- Calendario con date picker
- Selección de fecha inicio y fin
- Validación: máximo 90 días de rango

---

## Archivos a Crear

| Archivo | Descripción | Líneas |
|---------|-------------|--------|
| `src/components/admin/AnalyticsPanel.tsx` | Panel principal con gráficas | ~450 |
| `src/hooks/useAnalytics.ts` | Hook para datos de tráfico | ~100 |
| `src/hooks/useSalesAnalytics.ts` | Hook para datos de ventas | ~120 |

---

## Archivo a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Admin.tsx` | Agregar tab "Analíticas" como primera opción |

---

## Implementación Técnica

### Tipos de Datos

```typescript
// Punto de datos combinado (tráfico + ventas)
interface AnalyticsDataPoint {
  date: string;
  // Tráfico
  visitors: number;
  pageviews: number;
  // Ventas
  orders: number;
  revenue: number; // en USD
}

// Resumen del período
interface AnalyticsSummary {
  // Tráfico
  totalVisitors: number;
  totalPageviews: number;
  avgSessionDuration: number;
  // Ventas
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  conversionRate: number; // orders / visitors * 100
}

// Top productos
interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

// Distribución de métodos de pago
interface PaymentMethodStats {
  method: string;
  label: string;
  count: number;
  percentage: number;
}
```

### Hook useSalesAnalytics

```typescript
const useSalesAnalytics = (startDate: Date, endDate: Date) => {
  // Consultar orders en el rango de fechas
  const { data: orders } = useQuery({
    queryKey: ['sales-analytics', startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, 
          created_at, 
          total, 
          status, 
          payment_method,
          currency_mode
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .neq('status', 'CANCELED');
      
      if (error) throw error;
      return data;
    }
  });

  // Consultar order_items para top productos
  const { data: topProducts } = useQuery({
    queryKey: ['top-products', startDate, endDate],
    queryFn: async () => {
      // Obtener IDs de órdenes en el período
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          product_name_snapshot,
          quantity,
          line_total,
          orders!inner(created_at, status)
        `)
        .gte('orders.created_at', startDate.toISOString())
        .lte('orders.created_at', endDate.toISOString())
        .in('orders.status', ['PAID', 'DELIVERED']);
      
      // Agrupar por producto
      // ...
    }
  });

  return { orders, topProducts, loading, error };
};
```

### Hook useAnalytics (Tráfico)

```typescript
const useAnalytics = (startDate: string, endDate: string, granularity: 'hourly' | 'daily') => {
  // Usa la herramienta interna de Lovable para analytics
  // analytics--read_project_analytics
  
  return useQuery({
    queryKey: ['traffic-analytics', startDate, endDate, granularity],
    queryFn: async () => {
      // Llamada a la API de analytics del proyecto
      const response = await fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({ startDate, endDate, granularity })
      });
      return response.json();
    }
  });
};
```

### Gráfica Principal (Estilo Shopify)

```tsx
<ChartContainer config={chartConfig}>
  <AreaChart data={combinedData}>
    <defs>
      <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
      </linearGradient>
    </defs>
    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
    <XAxis 
      dataKey="date" 
      tickFormatter={(val) => format(new Date(val), granularity === 'hourly' ? 'HH:mm' : 'd MMM')}
    />
    <YAxis />
    <Tooltip content={<ChartTooltipContent />} />
    <Area 
      type="monotone" 
      dataKey={selectedMetric}
      stroke="#10b981" 
      fill="url(#colorMetric)"
      strokeWidth={2}
    />
  </AreaChart>
</ChartContainer>
```

### Widget Top Productos

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <TrendingUp className="h-4 w-4" />
      Top Productos
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {topProducts.map((product, index) => (
        <div key={product.name} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground w-5">
              {index + 1}.
            </span>
            <span className="font-medium">{product.name}</span>
          </div>
          <div className="text-right">
            <p className="font-semibold">{product.quantity} uds</p>
            <p className="text-xs text-muted-foreground">${product.revenue}</p>
          </div>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

### Widget Métodos de Pago

```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <CreditCard className="h-4 w-4" />
      Métodos de Pago
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-3">
      {paymentStats.map((method) => (
        <div key={method.method} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{method.label}</span>
            <span className="font-medium">{method.percentage}%</span>
          </div>
          <Progress value={method.percentage} className="h-2" />
        </div>
      ))}
    </div>
  </CardContent>
</Card>
```

---

## Cambios en Admin.tsx

```tsx
// Nueva importación
import { AnalyticsPanel } from '@/components/admin/AnalyticsPanel';
import { BarChart3 } from 'lucide-react';

// Actualizar TabsList a 10 columnas
<TabsList className="grid w-full grid-cols-10 mb-6">
  {/* Nueva primera tab */}
  <TabsTrigger value="analytics" className="gap-2">
    <BarChart3 className="h-4 w-4" />
    <span className="hidden sm:inline">Analíticas</span>
  </TabsTrigger>
  {/* ... resto de tabs existentes ... */}
</TabsList>

// Nuevo TabsContent (primera posición)
<TabsContent value="analytics">
  <AnalyticsPanel />
</TabsContent>
```

---

## Consultas a Base de Datos

### Pedidos por Período

```sql
SELECT 
  date_trunc('day', created_at) as date,
  COUNT(*) as orders,
  SUM(total) as revenue
FROM orders
WHERE created_at BETWEEN $1 AND $2
  AND status NOT IN ('CANCELED')
GROUP BY date_trunc('day', created_at)
ORDER BY date;
```

### Top Productos

```sql
SELECT 
  oi.product_name_snapshot as name,
  SUM(oi.quantity) as total_quantity,
  SUM(oi.line_total) as total_revenue
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
WHERE o.created_at BETWEEN $1 AND $2
  AND o.status IN ('PAID', 'DELIVERED')
GROUP BY oi.product_name_snapshot
ORDER BY total_quantity DESC
LIMIT 5;
```

### Distribución de Métodos de Pago

```sql
SELECT 
  payment_method,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 1) as percentage
FROM orders
WHERE created_at BETWEEN $1 AND $2
  AND status IN ('PAID', 'DELIVERED')
GROUP BY payment_method
ORDER BY count DESC;
```

---

## Estados del Dashboard

### Loading State

```tsx
<div className="space-y-6">
  {/* KPIs skeleton */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[1,2,3,4].map(i => (
      <Card key={i}>
        <CardContent className="p-4">
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    ))}
  </div>
  {/* Chart skeleton */}
  <Card>
    <CardContent className="p-6">
      <Skeleton className="h-64 w-full" />
    </CardContent>
  </Card>
</div>
```

### Empty State

```tsx
<Card className="py-12 text-center">
  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50" />
  <h3 className="mt-4 font-semibold">Sin datos disponibles</h3>
  <p className="text-sm text-muted-foreground mt-1">
    No hay información para el período seleccionado
  </p>
</Card>
```

---

## Responsive Design

### Desktop (>1024px)
- 4 tarjetas KPI en fila
- Gráfica principal ancha
- 2 widgets lado a lado

### Tablet (768-1024px)
- 4 tarjetas KPI en fila
- Gráfica ancha
- Widgets apilados

### Mobile (<768px)
- 2 tarjetas KPI por fila
- Gráfica compacta
- Widgets apilados
- Selectores de fecha en dropdown

---

## Librerías Utilizadas

| Librería | Uso | Estado |
|----------|-----|--------|
| recharts | Gráficas | ✅ Instalada |
| date-fns | Fechas | ✅ Instalada |
| react-day-picker | Calendario | ✅ Instalada |
| @tanstack/react-query | Fetching | ✅ Instalada |

---

## Resumen de Archivos

| Archivo | Acción | Líneas |
|---------|--------|--------|
| `src/hooks/useAnalytics.ts` | Crear | ~100 |
| `src/hooks/useSalesAnalytics.ts` | Crear | ~120 |
| `src/components/admin/AnalyticsPanel.tsx` | Crear | ~450 |
| `src/pages/Admin.tsx` | Modificar | +20 |

---

## Beneficios

- **Vista unificada**: Tráfico + ventas en un solo lugar
- **Decisiones informadas**: Correlacionar visitas con conversiones
- **Identificar tendencias**: Ver días/horas pico de ventas
- **Productos estrella**: Saber qué vender más
- **Optimizar pagos**: Ver métodos preferidos por clientes

