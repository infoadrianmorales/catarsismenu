// ================================================
// [2026-04-08] PRODUCT SALES DASHBOARD
// Dashboard detallado de ventas por producto, categoría,
// origen de compra y extras. Se integra al AnalyticsPanel.
// USA: Recharts, shadcn/ui Tabs, Tailwind.
// COLORES DE MARCA: Rich Black #010C23, Raspberry #DB1F51,
//   Xanthous #F2B60F, Ocean Blue #04308C,
//   Light Sea Green #14B2AA, Seasalt #F7F8F9
// ================================================

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Search, AlertCircle, Package, ArrowUpDown, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useProductSalesAnalytics } from '@/hooks/useProductSalesAnalytics';
import type { ProductSalesHistoryItem } from '@/hooks/useProductSalesAnalytics';

// [2026-04-08] Colores de marca para gráficos
// [2026-04-10] Colores y labels ampliados para nuevos sources
// (product_page, category) que mejoran la granularidad del tracking.
const SOURCE_COLORS: Record<string, string> = {
  menu: '#04308C',
  best_seller: '#DB1F51',
  suggestion: '#F2B60F',
  search: '#14B2AA',
  extras: '#8B5CF6',
  product_page: '#F97316',
  category: '#06B6D4',
};

const SOURCE_LABELS: Record<string, string> = {
  menu: 'Menú directo',
  best_seller: 'Best Sellers',
  suggestion: 'Sugerencias del carrito',
  search: 'Búsqueda',
  extras: 'Extras',
  product_page: 'Página de producto',
  category: 'Página de categoría',
};

const CATEGORY_COLORS = ['#04308C', '#DB1F51', '#F2B60F', '#14B2AA', '#8B5CF6', '#EC4899', '#F97316', '#06B6D4', '#84CC16', '#6366F1', '#EF4444', '#10B981'];

const CATEGORY_LABELS: Record<string, string> = {
  hamburguesas: 'Hamburguesas',
  pizzas: 'Pizzas',
  alitas: 'Alitas',
  bebidas: 'Bebidas',
  postres: 'Postres',
  acompanantes: 'Acompañantes',
  cocktails: 'Cocktails',
  entradas: 'Entradas',
  ensaladas: 'Ensaladas',
  emparedados: 'Emparedados',
  parrilla: 'Parrilla',
  cocteleria: 'Coctelería',
};

type SortKey = keyof Pick<ProductSalesHistoryItem, 'product_name' | 'category' | 'total_quantity' | 'total_revenue' | 'order_count' | 'last_sold_at'>;

interface Props {
  startDate: Date;
  endDate: Date;
}

const ProductSalesDashboard = ({ startDate, endDate }: Props) => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('total_quantity');
  const [sortAsc, setSortAsc] = useState(false);

  const { productHistory, salesByCategory, salesBySource, extrasAnalytics, isLoading, error } =
    useProductSalesAnalytics(startDate, endDate, categoryFilter);

  // [2026-04-08] Filtrado y ordenamiento de la tabla de historial
  const filteredHistory = useMemo(() => {
    let data = [...productHistory];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter(p => p.product_name.toLowerCase().includes(q));
    }
    data.sort((a, b) => {
      const aVal = a[sortKey] ?? '';
      const bVal = b[sortKey] ?? '';
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return sortAsc
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return data;
  }, [productHistory, searchQuery, sortKey, sortAsc]);

  const historyTotals = useMemo(() => ({
    quantity: filteredHistory.reduce((s, p) => s + p.total_quantity, 0),
    revenue: filteredHistory.reduce((s, p) => s + Number(p.total_revenue), 0),
  }), [filteredHistory]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  };

  const SortHeader = ({ label, field }: { label: string; field: SortKey }) => (
    <th
      className="text-left px-3 py-2 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none"
      onClick={() => handleSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <ArrowUpDown className="h-3 w-3" />
      </span>
    </th>
  );

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6 text-center text-destructive">
          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  // [2026-04-08] Datos para el gráfico de categorías
  const categoryChartData = salesByCategory.map(c => ({
    name: CATEGORY_LABELS[c.category] || c.category,
    revenue: Number(c.total_revenue),
    quantity: c.total_quantity,
  }));

  const categoryTotal = salesByCategory.reduce((s, c) => s + Number(c.total_revenue), 0);

  // [2026-04-08] Datos para el gráfico de source
  const sourceChartData = salesBySource.map(s => ({
    name: SOURCE_LABELS[s.source] || s.source,
    value: Number(s.total_revenue),
    source: s.source,
  }));

  const categoryChartConfig = Object.fromEntries(
    categoryChartData.map((c, i) => [c.name, { label: c.name, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }])
  );

  return (
    <div className="space-y-6">
      {/* [2026-04-08] Separador visual */}
      <div className="border-t pt-6">
        <h2 className="text-xl font-bold mb-1">Detalle de Ventas y Comportamiento</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Análisis detallado por producto, categoría y origen de compra
        </p>
      </div>

      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history">Productos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="source">Origen</TabsTrigger>
          <TabsTrigger value="extras">Extras</TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: HISTORIAL DE PRODUCTOS ===== */}
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Historial de Productos Vendidos</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar producto..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-9"
                  />
                </div>
                <Select
                  value={categoryFilter || 'all'}
                  onValueChange={v => setCategoryFilter(v === 'all' ? null : v)}
                >
                  <SelectTrigger className="w-full sm:w-[180px] h-9">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : filteredHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay ventas en este período</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <SortHeader label="Producto" field="product_name" />
                        <SortHeader label="Categoría" field="category" />
                        <SortHeader label="Cantidad" field="total_quantity" />
                        <SortHeader label="Ingresos ($)" field="total_revenue" />
                        <SortHeader label="Pedidos" field="order_count" />
                        <SortHeader label="Última venta" field="last_sold_at" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map(p => (
                        <tr key={p.product_id} className="border-b last:border-0 hover:bg-muted/50">
                          <td className="px-3 py-2 font-medium">{p.product_name}</td>
                          <td className="px-3 py-2">
                            <Badge variant="outline" className="text-xs">
                              {CATEGORY_LABELS[p.category || ''] || p.category || '—'}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{p.total_quantity}</td>
                          <td className="px-3 py-2 text-right tabular-nums font-medium">
                            ${Number(p.total_revenue).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{p.order_count}</td>
                          <td className="px-3 py-2 text-muted-foreground text-xs">
                            {format(new Date(p.last_sold_at), 'dd MMM yyyy', { locale: es })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 font-semibold">
                        <td className="px-3 py-2" colSpan={2}>Totales</td>
                        <td className="px-3 py-2 text-right tabular-nums text-amber-500">{historyTotals.quantity}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-amber-500">
                          ${historyTotals.revenue.toFixed(2)}
                        </td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 2: VENTAS POR CATEGORÍA ===== */}
        <TabsContent value="categories">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ventas por Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : categoryChartData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay ventas en este período</p>
                </div>
              ) : (
                <>
                  <ChartContainer config={categoryChartConfig} className="h-[300px] w-full">
                    <BarChart data={categoryChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" tickFormatter={v => `$${v}`} />
                      <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12 }} />
                      <ChartTooltip
                        content={<ChartTooltipContent formatter={(value) => `$${Number(value).toFixed(2)}`} />}
                      />
                      <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                        {categoryChartData.map((_, i) => (
                          <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Categoría</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Productos</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Unidades</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Ingresos</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesByCategory.map(c => (
                          <tr key={c.category} className="border-b last:border-0">
                            <td className="px-3 py-2 font-medium">{CATEGORY_LABELS[c.category] || c.category}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{c.product_count}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{c.total_quantity}</td>
                            <td className="px-3 py-2 text-right tabular-nums">${Number(c.total_revenue).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                              {categoryTotal > 0 ? ((Number(c.total_revenue) / categoryTotal) * 100).toFixed(1) : 0}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 3: ORIGEN DE COMPRAS (SOURCE) ===== */}
        <TabsContent value="source">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Origen de Compras</CardTitle>
            </CardHeader>
            <CardContent>
              {/* [2026-04-08] Banner informativo — eliminar después de 30 días */}
              <div className="bg-muted/50 border rounded-lg p-3 mb-4 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  El tracking de origen se activó el 8 de abril de 2026.
                  Los datos anteriores aparecen como "Menú directo".
                </p>
              </div>

              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : sourceChartData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay datos de origen en este período</p>
                </div>
              ) : (
                <>
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sourceChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={true}
                        >
                          {sourceChartData.map((entry) => (
                            <Cell key={entry.source} fill={SOURCE_COLORS[entry.source] || '#6B7280'} />
                          ))}
                        </Pie>
                        <ChartTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Origen</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Unidades</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">Ingresos</th>
                          <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salesBySource.map(s => (
                          <tr key={s.source} className="border-b last:border-0">
                            <td className="px-3 py-2 font-medium flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-sm shrink-0"
                                style={{ backgroundColor: SOURCE_COLORS[s.source] || '#6B7280' }}
                              />
                              {SOURCE_LABELS[s.source] || s.source}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">{s.total_quantity}</td>
                            <td className="px-3 py-2 text-right tabular-nums">${Number(s.total_revenue).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                              {Number(s.percentage).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 4: EXTRAS VENDIDOS ===== */}
        <TabsContent value="extras">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Extras Más Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : extrasAnalytics.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Aún no hay ventas de extras registradas.
                  </p>
                  <p className="text-xs mt-1">
                    Los datos aparecerán cuando los clientes empiecen a agregar extras a sus pedidos.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {extrasAnalytics.map((extra, index) => (
                    <div key={extra.extra_name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-sm">{extra.extra_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {extra.times_added} veces agregado
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm tabular-nums">{extra.total_quantity} uds</p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          ${Number(extra.total_revenue).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductSalesDashboard;
