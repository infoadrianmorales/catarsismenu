import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { 
  BarChart3, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  Calendar as CalendarIcon,
  Eye,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { format, subDays, startOfMonth, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSalesAnalytics } from '@/hooks/useSalesAnalytics';
import { usePageViews } from '@/hooks/usePageViews';
import { cn } from '@/lib/utils';
import type { DateRange } from 'react-day-picker';
// [2026-04-08] Dashboard detallado de ventas y comportamiento
import ProductSalesDashboard from './ProductSalesDashboard';

type DatePreset = 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'custom';
type MetricType = 'orders' | 'revenue' | 'avgTicket' | 'views';

const presets: { key: DatePreset; label: string }[] = [
  { key: 'today', label: 'Hoy' },
  { key: 'yesterday', label: 'Ayer' },
  { key: '7days', label: '7 días' },
  { key: '30days', label: '30 días' },
  { key: 'thisMonth', label: 'Este mes' },
];

const getDateRange = (preset: DatePreset, customRange?: { from: Date; to: Date }) => {
  const now = new Date();
  switch (preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now), granularity: 'hourly' as const };
    case 'yesterday': {
      const yesterday = subDays(now, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday), granularity: 'hourly' as const };
    }
    case '7days':
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now), granularity: 'daily' as const };
    case '30days':
      return { start: startOfDay(subDays(now, 29)), end: endOfDay(now), granularity: 'daily' as const };
    case 'thisMonth':
      return { start: startOfMonth(now), end: endOfDay(now), granularity: 'daily' as const };
    case 'custom':
      if (customRange) {
        return { start: startOfDay(customRange.from), end: endOfDay(customRange.to), granularity: 'daily' as const };
      }
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now), granularity: 'daily' as const };
    default:
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now), granularity: 'daily' as const };
  }
};

// Get the previous period of equal duration for comparison
const getPreviousPeriod = (start: Date, end: Date) => {
  const durationMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);
  return { start: prevStart, end: prevEnd };
};

export const AnalyticsPanel = () => {
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>('7days');
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>();
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('orders');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { start, end, granularity } = useMemo(
    () => getDateRange(selectedPreset, customRange),
    [selectedPreset, customRange]
  );

  const prev = useMemo(() => getPreviousPeriod(start, end), [start, end]);

  // Current period data
  const { series, summary, topProducts, paymentMethods, loading, error } = useSalesAnalytics(start, end, granularity);
  const { series: viewsSeries, summary: viewsSummary, popularPages, loading: viewsLoading } = usePageViews(start, end, granularity);

  // Previous period data for comparison
  const { summary: prevSummary } = useSalesAnalytics(prev.start, prev.end, granularity);
  const { summary: prevViewsSummary } = usePageViews(prev.start, prev.end, granularity);

  const metricColors: Record<MetricType, string> = {
    orders: 'hsl(var(--primary))',
    revenue: 'hsl(142 71% 45%)',
    avgTicket: 'hsl(38 92% 50%)',
    views: 'hsl(221 83% 53%)',
  };

  const chartConfig = {
    value: {
      label: selectedMetric === 'orders' ? 'Pedidos' : selectedMetric === 'revenue' ? 'Ingresos' : selectedMetric === 'avgTicket' ? 'Ticket Prom.' : 'Visitas',
      color: metricColors[selectedMetric],
    },
  };

  const chartData = useMemo(() => {
    if (selectedMetric === 'views') {
      return viewsSeries.map(point => ({
        dateLabel: granularity === 'hourly'
          ? format(new Date(point.date), 'HH:mm')
          : format(new Date(point.date), 'd MMM', { locale: es }),
        value: point.views,
      }));
    }

    return series.map((point, i) => {
      let value = 0;
      if (selectedMetric === 'orders') value = point.orders;
      else if (selectedMetric === 'revenue') value = point.revenue;
      else if (selectedMetric === 'avgTicket') value = point.orders > 0 ? point.revenue / point.orders : 0;

      return {
        dateLabel: granularity === 'hourly'
          ? format(new Date(point.date), 'HH:mm')
          : format(new Date(point.date), 'd MMM', { locale: es }),
        value,
      };
    });
  }, [series, viewsSeries, selectedMetric, granularity]);

  const handlePresetClick = (preset: DatePreset) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') setCustomRange(undefined);
  };

  const [pendingRange, setPendingRange] = useState<DateRange | undefined>();

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range) {
      setPendingRange(undefined);
      return;
    }
    setPendingRange(range);
    // Only close when we have two distinct dates (real range completed)
    if (range.from && range.to && range.from.getTime() !== range.to.getTime()) {
      setCustomRange({ from: range.from, to: range.to });
      setSelectedPreset('custom');
      setCalendarOpen(false);
      setPendingRange(undefined);
    }
  };

  const handleCalendarOpen = (open: boolean) => {
    setCalendarOpen(open);
    if (open && customRange) {
      setPendingRange({ from: customRange.from, to: customRange.to });
    } else if (!open) {
      setPendingRange(undefined);
    }
  };

  // Calculate deltas
  const calcDelta = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const kpis = [
    {
      key: 'orders' as MetricType,
      title: 'Pedidos',
      value: summary.totalOrders,
      delta: calcDelta(summary.totalOrders, prevSummary.totalOrders),
      icon: ShoppingBag,
      format: 'number' as const,
    },
    {
      key: 'revenue' as MetricType,
      title: 'Ingresos',
      value: summary.totalRevenue,
      delta: calcDelta(summary.totalRevenue, prevSummary.totalRevenue),
      icon: DollarSign,
      format: 'currency' as const,
    },
    {
      key: 'avgTicket' as MetricType,
      title: 'Ticket Promedio',
      value: summary.avgOrderValue,
      delta: calcDelta(summary.avgOrderValue, prevSummary.avgOrderValue),
      icon: TrendingUp,
      format: 'currency' as const,
    },
    {
      key: 'views' as MetricType,
      title: 'Visitas',
      value: viewsSummary.totalViews,
      delta: calcDelta(viewsSummary.totalViews, prevViewsSummary.totalViews),
      icon: Eye,
      format: 'number' as const,
      subtitle: `${viewsSummary.uniqueVisitors} únicos`,
    },
  ];

  if (error) {
    return (
      <Card className="py-12 text-center">
        <BarChart3 className="h-12 w-12 mx-auto text-destructive/50" />
        <h3 className="mt-4 font-semibold text-destructive">Error al cargar datos</h3>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </Card>
    );
  }

  const isLoading = loading || viewsLoading;

  return (
    <div className="space-y-6">
      {/* Header with date selectors */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Analíticas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {format(start, "d 'de' MMMM", { locale: es })} - {format(end, "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {presets.map(preset => (
            <Button
              key={preset.key}
              variant={selectedPreset === preset.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetClick(preset.key)}
            >
              {preset.label}
            </Button>
          ))}
          
          <Popover open={calendarOpen} onOpenChange={handleCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={selectedPreset === 'custom' ? 'default' : 'outline'}
                size="sm"
                className="gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Personalizado</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={pendingRange ?? (customRange ? { from: customRange.from, to: customRange.to } : undefined)}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                disabled={(date: Date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Interactive KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card
            key={kpi.key}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedMetric === kpi.key && 'ring-2 ring-primary shadow-md'
            )}
            onClick={() => setSelectedMetric(kpi.key)}
          >
            <CardContent className="p-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-1">
                    <kpi.icon className="h-5 w-5 text-muted-foreground" />
                    {kpi.delta !== 0 && (
                      <span className={cn(
                        'flex items-center text-xs font-medium',
                        kpi.delta > 0 ? 'text-emerald-600' : 'text-red-500'
                      )}>
                        {kpi.delta > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {Math.abs(kpi.delta)}%
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold">
                    {kpi.format === 'currency' ? `$${kpi.value.toFixed(2)}` : kpi.value.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">{kpi.title}</p>
                  {kpi.subtitle && (
                    <p className="text-xs text-muted-foreground/70">{kpi.subtitle}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            Tendencia: {chartConfig.value.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData.length === 0 || chartData.every(d => d.value === 0) ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">Sin datos para este período</p>
              </div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={metricColors[selectedMetric]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={metricColors[selectedMetric]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="dateLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickMargin={8} />
                <YAxis
                  axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickMargin={8}
                  tickFormatter={(v) => ['revenue', 'avgTicket'].includes(selectedMetric) ? `$${v}` : String(v)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(v) => v}
                      formatter={(value) => {
                        if (['revenue', 'avgTicket'].includes(selectedMetric))
                          return [`$${Number(value).toFixed(2)}`, chartConfig.value.label];
                        return [value, chartConfig.value.label];
                      }}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={metricColors[selectedMetric]}
                  fill="url(#colorMetric)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom widgets: 3 columns */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Top Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin ventas en este período</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-medium text-muted-foreground w-5 shrink-0">
                        {index + 1}.
                      </span>
                      <span className="font-medium truncate text-sm">{product.name}</span>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-semibold text-sm">{product.quantity} uds</p>
                      <p className="text-xs text-muted-foreground">${product.revenue.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-5 w-5" />
              Métodos de Pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <CreditCard className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin pagos en este período</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.method} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{method.label}</span>
                      <span className="text-muted-foreground">
                        {method.count} ({method.percentage}%)
                      </span>
                    </div>
                    <Progress value={method.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Popular Pages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5" />
              Páginas Populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                ))}
              </div>
            ) : popularPages.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin visitas registradas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {popularPages.map((page, index) => (
                  <div key={page.path} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-medium text-muted-foreground w-5 shrink-0">
                        {index + 1}.
                      </span>
                      <span className="font-medium truncate text-sm font-mono">{page.path}</span>
                    </div>
                    <span className="text-sm font-semibold shrink-0 ml-4">{page.views}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* [2026-04-08] Dashboard detallado de ventas y comportamiento */}
      <ProductSalesDashboard startDate={start} endDate={end} />
    </div>
  );
};
