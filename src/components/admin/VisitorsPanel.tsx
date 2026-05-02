// [2026-05-02] CATARSIS — VisitorsPanel (pestaña Visitantes en /admin)
// Propósito: Dashboard admin con KPIs, tendencia diaria (Recharts) y widgets de fuentes/países/páginas populares.
// Modificaciones:
//   - Creación inicial — presets, KPIs, AreaChart, 3 tarjetas (fuentes, países, páginas).
//   - [2026-05-02] FIX: añadida 4ta tarjeta "Ciudades top" (byCity) y grid responsive a 4 columnas en xl.
//   - [2026-05-02] FIX UX: filas con país/ciudad "Desconocido(a)" se excluyen del top
//     y se muestran como contador "sin geo" debajo del título. Evita que las visitas
//     de builds antiguas cacheadas (sin geolocalización) dominen el ranking.
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Globe, Eye, Users, TrendingUp, Calendar as CalendarIcon, MapPin, Compass, Building2 } from 'lucide-react';
import { format, subDays, startOfMonth, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { useVisitorAnalytics } from '@/hooks/useVisitorAnalytics';
import { usePageViews } from '@/hooks/usePageViews';
import { cn } from '@/lib/utils';

type DatePreset = 'today' | 'yesterday' | '7days' | '30days' | 'thisMonth' | 'all' | 'custom';

const presets: { key: DatePreset; label: string }[] = [
  { key: 'today', label: 'Hoy' },
  { key: 'yesterday', label: 'Ayer' },
  { key: '7days', label: '7 días' },
  { key: '30days', label: '30 días' },
  { key: 'thisMonth', label: 'Este mes' },
  { key: 'all', label: 'Todo' },
];

const getDateRange = (preset: DatePreset, custom?: { from: Date; to: Date }) => {
  const now = new Date();
  switch (preset) {
    case 'today': return { start: startOfDay(now), end: endOfDay(now) };
    case 'yesterday': { const y = subDays(now, 1); return { start: startOfDay(y), end: endOfDay(y) }; }
    case '7days': return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    case '30days': return { start: startOfDay(subDays(now, 29)), end: endOfDay(now) };
    case 'thisMonth': return { start: startOfMonth(now), end: endOfDay(now) };
    case 'all': return { start: new Date('2020-01-01'), end: endOfDay(now) };
    case 'custom':
      if (custom) return { start: startOfDay(custom.from), end: endOfDay(custom.to) };
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
  }
};

// Banderas básicas — extender según tráfico real.
const flagOf = (country: string): string => {
  const map: Record<string, string> = {
    'Venezuela': '🇻🇪', 'United States': '🇺🇸', 'Colombia': '🇨🇴', 'Spain': '🇪🇸',
    'Mexico': '🇲🇽', 'Argentina': '🇦🇷', 'Chile': '🇨🇱', 'Peru': '🇵🇪',
    'Ecuador': '🇪🇨', 'Brazil': '🇧🇷', 'Panama': '🇵🇦', 'Dominican Republic': '🇩🇴',
    'Italy': '🇮🇹', 'Portugal': '🇵🇹', 'France': '🇫🇷', 'Germany': '🇩🇪',
    'Canada': '🇨🇦', 'United Kingdom': '🇬🇧',
  };
  return map[country] ?? '🌐';
};

export const VisitorsPanel = () => {
  const [selectedPreset, setSelectedPreset] = useState<DatePreset>('7days');
  const [customRange, setCustomRange] = useState<{ from: Date; to: Date } | undefined>();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [pendingRange, setPendingRange] = useState<DateRange | undefined>();

  const { start, end } = useMemo(() => getDateRange(selectedPreset, customRange), [selectedPreset, customRange]);

  const { bySource, byCountry, byCity, daily, loading, error } = useVisitorAnalytics(start, end);
  const { popularPages, summary, loading: pagesLoading } = usePageViews(start, end, 'daily');

  // [2026-05-02] Filtrar geo "Desconocido(a)" del ranking; se muestra aparte como contador.
  const knownCountries = byCountry.filter(r => r.country !== 'Desconocido');
  const unknownCountryCount = byCountry.find(r => r.country === 'Desconocido')?.total ?? 0;
  const knownCities = byCity.filter(r => r.city !== 'Desconocida');
  const unknownCityCount = byCity.find(r => r.city === 'Desconocida')?.total ?? 0;

  const totalSourceVisits = bySource.reduce((s, r) => s + r.total, 0);
  const totalCountryVisits = knownCountries.reduce((s, r) => s + r.total, 0);
  const totalCityVisits = knownCities.reduce((s, r) => s + r.total, 0);
  const topSource = bySource[0]?.source ?? '—';
  const distinctCountries = knownCountries.length;

  const chartData = daily.map(d => ({
    label: format(new Date(d.date), 'd MMM', { locale: es }),
    value: d.total,
  }));

  const handleDateSelect = (range: DateRange | undefined) => {
    if (!range) { setPendingRange(undefined); return; }
    setPendingRange(range);
    if (range.from && range.to && range.from.getTime() !== range.to.getTime()) {
      setCustomRange({ from: range.from, to: range.to });
      setSelectedPreset('custom');
      setCalendarOpen(false);
      setPendingRange(undefined);
    }
  };

  if (error) {
    return (
      <Card className="py-12 text-center">
        <Globe className="h-12 w-12 mx-auto text-destructive/50" />
        <h3 className="mt-4 font-semibold text-destructive">Error al cargar visitantes</h3>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
      </Card>
    );
  }

  const kpis = [
    { title: 'Visitas', value: summary.totalViews.toLocaleString(), icon: Eye },
    { title: 'Visitantes únicos', value: summary.uniqueVisitors.toLocaleString(), icon: Users },
    { title: 'Países', value: distinctCountries.toLocaleString(), icon: MapPin },
    { title: 'Fuente top', value: topSource, icon: Compass },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Visitantes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {format(start, "d 'de' MMMM", { locale: es })} - {format(end, "d 'de' MMMM, yyyy", { locale: es })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <Button key={p.key} variant={selectedPreset === p.key ? 'default' : 'outline'} size="sm"
              onClick={() => { setSelectedPreset(p.key); if (p.key !== 'custom') setCustomRange(undefined); }}>
              {p.label}
            </Button>
          ))}
          <Popover open={calendarOpen} onOpenChange={(o) => { setCalendarOpen(o); if (!o) setPendingRange(undefined); }}>
            <PopoverTrigger asChild>
              <Button variant={selectedPreset === 'custom' ? 'default' : 'outline'} size="sm" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Personalizado</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="range" selected={pendingRange ?? (customRange ? { from: customRange.from, to: customRange.to } : undefined)}
                onSelect={handleDateSelect} numberOfMonths={2} disabled={(d: Date) => d > new Date()} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.title}>
            <CardContent className="p-4">
              {(loading || pagesLoading) ? (
                <><Skeleton className="h-8 w-20 mb-2" /><Skeleton className="h-4 w-16" /></>
              ) : (
                <>
                  <k.icon className="h-5 w-5 text-muted-foreground mb-1" />
                  <p className="text-2xl font-bold truncate">{k.value}</p>
                  <p className="text-sm text-muted-foreground">{k.title}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tendencia diaria */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Tendencia diaria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : chartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-center">
              <div>
                <Globe className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">Sin visitas en este período</p>
              </div>
            </div>
          ) : (
            <ChartContainer config={{ value: { label: 'Visitas', color: 'hsl(var(--primary))' } }} className="h-64 w-full">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickMargin={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent labelFormatter={(v) => v} formatter={(v) => [v, 'Visitas']} />} />
                <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#colorVisitors)" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* 4 widgets: fuentes / países / ciudades / páginas */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Fuentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Compass className="h-5 w-5" /> Fuentes de tráfico
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-8 w-full" />)}</div>
            ) : bySource.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin datos</p>
            ) : (
              <div className="space-y-4">
                {bySource.map(r => {
                  const pct = totalSourceVisits ? Math.round((r.total / totalSourceVisits) * 100) : 0;
                  return (
                    <div key={r.source} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate">{r.source}</span>
                        <span className="text-muted-foreground shrink-0 ml-2">{r.total} ({pct}%)</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Países */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5" /> Países top
            </CardTitle>
            {unknownCountryCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unknownCountryCount.toLocaleString()} visita{unknownCountryCount === 1 ? '' : 's'} sin geo resolver
              </p>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-4 w-full" />)}</div>
            ) : knownCountries.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin datos geolocalizados</p>
            ) : (
              <div className="space-y-4">
                {knownCountries.map(r => {
                  const pct = totalCountryVisits ? Math.round((r.total / totalCountryVisits) * 100) : 0;
                  return (
                    <div key={r.country} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium truncate">
                          <span className="mr-1.5">{flagOf(r.country)}</span>{r.country}
                        </span>
                        <span className="text-muted-foreground shrink-0 ml-2">{r.total}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ciudades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="h-5 w-5" /> Ciudades top
            </CardTitle>
            {unknownCityCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {unknownCityCount.toLocaleString()} visita{unknownCityCount === 1 ? '' : 's'} sin geo resolver
              </p>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-4 w-full" />)}</div>
            ) : knownCities.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin datos geolocalizados</p>
            ) : (
              <div className="space-y-4">
                {knownCities.map(r => {
                  const pct = totalCityVisits ? Math.round((r.total / totalCityVisits) * 100) : 0;
                  return (
                    <div key={`${r.city}-${r.country}`} className="space-y-2">
                      <div className="flex justify-between text-sm gap-2">
                        <span className="font-medium truncate min-w-0">
                          <span className="mr-1.5">{flagOf(r.country)}</span>
                          {r.city}
                          <span className="text-muted-foreground ml-1 text-xs">· {r.country}</span>
                        </span>
                        <span className="text-muted-foreground shrink-0">{r.total}</span>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Páginas populares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="h-5 w-5" /> Páginas populares
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pagesLoading ? (
              <div className="space-y-3">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-4 w-full" />)}</div>
            ) : popularPages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin visitas</p>
            ) : (
              <div className="space-y-4">
                {popularPages.map((p, i) => (
                  <div key={p.path} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-medium text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                      <span className="font-medium truncate text-sm font-mono">{p.path}</span>
                    </div>
                    <span className="text-sm font-semibold shrink-0 ml-4">{p.views}</span>
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

export default VisitorsPanel;
