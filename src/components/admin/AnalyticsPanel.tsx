import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { 
  BarChart3, 
  Users, 
  Eye, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  CreditCard,
  Calendar as CalendarIcon,
  Loader2
} from 'lucide-react';
import { format, subDays, startOfMonth, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSalesAnalytics } from '@/hooks/useSalesAnalytics';
import { cn } from '@/lib/utils';

type DatePreset = 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'custom';
type MetricType = 'orders' | 'revenue';

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
    case 'yesterday':
      const yesterday = subDays(now, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday), granularity: 'hourly' as const };
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

export const AnalyticsPanel = () => {
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>('7days');
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>();
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('orders');
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { start, end, granularity } = useMemo(
    () => getDateRange(selectedPreset, customRange),
    [selectedPreset, customRange]
  );

  const { series, summary, topProducts, paymentMethods, loading, error } = useSalesAnalytics(
    start,
    end,
    granularity
  );

  const chartConfig = {
    orders: {
      label: 'Pedidos',
      color: 'hsl(var(--primary))',
    },
    revenue: {
      label: 'Ingresos',
      color: 'hsl(142 71% 45%)',
    },
  };

  const chartData = useMemo(() => {
    return series.map(point => ({
      ...point,
      dateLabel: granularity === 'hourly' 
        ? format(new Date(point.date), 'HH:mm')
        : format(new Date(point.date), 'd MMM', { locale: es })
    }));
  }, [series, granularity]);

  const handlePresetClick = (preset: DatePreset) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      setCustomRange(undefined);
    }
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      setCustomRange({ from: range.from, to: range.to });
      setSelectedPreset('custom');
      setCalendarOpen(false);
    }
  };

  if (error) {
    return (
      <Card className="py-12 text-center">
        <BarChart3 className="h-12 w-12 mx-auto text-destructive/50" />
        <h3 className="mt-4 font-semibold text-destructive">Error al cargar datos</h3>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </Card>
    );
  }

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
          
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
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
                selected={customRange ? { from: customRange.from, to: customRange.to } : undefined}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Pedidos"
          value={summary.totalOrders}
          icon={ShoppingBag}
          loading={loading}
          format="number"
        />
        <KPICard
          title="Ingresos"
          value={summary.totalRevenue}
          icon={DollarSign}
          loading={loading}
          format="currency"
        />
        <KPICard
          title="Ticket Promedio"
          value={summary.avgOrderValue}
          icon={TrendingUp}
          loading={loading}
          format="currency"
        />
        <KPICard
          title="Productos Vendidos"
          value={topProducts.reduce((sum, p) => sum + p.quantity, 0)}
          icon={Eye}
          loading={loading}
          format="number"
        />
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-lg">Tendencia</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={selectedMetric === 'orders' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('orders')}
              >
                Pedidos
              </Button>
              <Button
                variant={selectedMetric === 'revenue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedMetric('revenue')}
              >
                Ingresos
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData.length === 0 || chartData.every(d => d.orders === 0 && d.revenue === 0) ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Sin datos para este período
                </p>
              </div>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="5%" 
                      stopColor={selectedMetric === 'orders' ? 'hsl(var(--primary))' : 'hsl(142 71% 45%)'} 
                      stopOpacity={0.3}
                    />
                    <stop 
                      offset="95%" 
                      stopColor={selectedMetric === 'orders' ? 'hsl(var(--primary))' : 'hsl(142 71% 45%)'} 
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="dateLabel" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickMargin={8}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickMargin={8}
                  tickFormatter={(value) => selectedMetric === 'revenue' ? `$${value}` : value}
                />
                <ChartTooltip 
                  content={
                    <ChartTooltipContent 
                      labelFormatter={(value) => value}
                      formatter={(value, name) => {
                        if (name === 'revenue') return [`$${Number(value).toFixed(2)}`, 'Ingresos'];
                        return [value, 'Pedidos'];
                      }}
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey={selectedMetric}
                  stroke={selectedMetric === 'orders' ? 'hsl(var(--primary))' : 'hsl(142 71% 45%)'}
                  fill="url(#colorMetric)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom widgets */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Top Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
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
                      <span className="font-medium truncate">{product.name}</span>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="font-semibold">{product.quantity} uds</p>
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
            {loading ? (
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
      </div>
    </div>
  );
};

// KPI Card Component
interface KPICardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
  format: 'number' | 'currency' | 'percent';
}

const KPICard = ({ title, value, icon: Icon, loading, format: formatType }: KPICardProps) => {
  const formattedValue = useMemo(() => {
    if (formatType === 'currency') {
      return `$${value.toFixed(2)}`;
    }
    if (formatType === 'percent') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  }, [value, formatType]);

  return (
    <Card>
      <CardContent className="p-4">
        {loading ? (
          <>
            <Skeleton className="h-8 w-20 mb-2" />
            <Skeleton className="h-4 w-16" />
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{formattedValue}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
