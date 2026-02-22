import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Loader2, Eye, RefreshCw, Copy, Check, CreditCard, XCircle, DollarSign, ShoppingBag, Sparkles, CalendarIcon, Trash2, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, isToday, subDays, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  order_number: string | null;
  created_at: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  currency_mode: string;
  exchange_rate: number | null;
  payment_method: string;
  payment_currency: string;
  subtotal: number;
  total: number;
  status: string;
  whatsapp_message: string;
}

interface OrderItem {
  id: string;
  product_name_snapshot: string;
  unit_price_snapshot: number;
  quantity: number;
  line_total: number;
}

type OrderTab = 'new' | 'paid' | 'canceled' | 'all';
type DatePreset = 'today' | '7days' | '30days' | 'all';

const STATUS_OPTIONS = [
  { value: 'PAID', label: 'Pagado', color: 'bg-green-500' },
  { value: 'PENDING', label: 'Pendiente', color: 'bg-yellow-500' },
  { value: 'CANCELED', label: 'Cancelado', color: 'bg-red-500' },
];

const STATUS_DISPLAY: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nuevo', color: 'bg-blue-500' },
  PENDING: { label: 'Pendiente', color: 'bg-yellow-500' },
  IN_PROGRESS: { label: 'En Proceso', color: 'bg-yellow-500' },
  PAYMENT_SUBMITTED: { label: 'Pago Enviado', color: 'bg-orange-500' },
  PAID: { label: 'Pagado', color: 'bg-green-500' },
  DELIVERED: { label: 'Entregado', color: 'bg-purple-500' },
  CANCELED: { label: 'Cancelado', color: 'bg-red-500' },
};

const PAYMENT_LABELS: Record<string, string> = {
  PAGOMOVIL: 'Pago Móvil',
  ZELLE: 'Zelle',
  USDT: 'USDT',
  ZINLI: 'Zinli',
  TRANSFER: 'Transferencia',
};

const TAB_CONFIG: Record<OrderTab, { label: string; icon: React.ReactNode }> = {
  new: { label: 'Nuevas', icon: <Sparkles className="h-4 w-4" /> },
  paid: { label: 'Pagadas', icon: <CreditCard className="h-4 w-4" /> },
  canceled: { label: 'Canceladas', icon: <XCircle className="h-4 w-4" /> },
  all: { label: 'Todas', icon: <ShoppingBag className="h-4 w-4" /> },
};

const formatBs = (n: number): string =>
  new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const classifyOrder = (order: Order): OrderTab => {
  if (order.status === 'CANCELED') return 'canceled';
  if (order.status === 'PAID' || order.status === 'DELIVERED') return 'paid';
  return 'new'; // NEW, IN_PROGRESS, PENDING, PAYMENT_SUBMITTED
};

export const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderTab>('new');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [datePreset, setDatePreset] = useState<DatePreset>('30days');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(subDays(new Date(), 30));
  const [dateTo, setDateTo] = useState<Date | undefined>(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar órdenes');
      console.error(error);
    } else {
      setOrders(data || []);
    }
    setLoading(false);
  };

  const runAutoCancel = useCallback(async () => {
    const { data, error } = await supabase.rpc('auto_cancel_stale_orders');
    if (!error && data && data > 0) {
      toast.info(`${data} orden(es) antigua(s) cancelada(s) automáticamente`);
      fetchOrders();
    }
  }, []);

  const fetchOrderItems = async (orderId: string) => {
    setLoadingItems(true);
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    if (error) toast.error('Error al cargar items');
    else setOrderItems(data || []);
    setLoadingItems(false);
  };

  useEffect(() => {
    fetchOrders();
    runAutoCancel();
  }, []);

  // Date preset handler
  const handleDatePreset = (preset: DatePreset) => {
    setDatePreset(preset);
    const now = new Date();
    switch (preset) {
      case 'today':
        setDateFrom(startOfDay(now));
        setDateTo(endOfDay(now));
        break;
      case '7days':
        setDateFrom(subDays(now, 7));
        setDateTo(now);
        break;
      case '30days':
        setDateFrom(subDays(now, 30));
        setDateTo(now);
        break;
      case 'all':
        setDateFrom(undefined);
        setDateTo(undefined);
        break;
    }
  };

  // Filter orders by date range
  const dateFilteredOrders = useMemo(() => {
    if (!dateFrom && !dateTo) return orders;
    return orders.filter(o => {
      const d = new Date(o.created_at);
      if (dateFrom && d < startOfDay(dateFrom)) return false;
      if (dateTo && d > endOfDay(dateTo)) return false;
      return true;
    });
  }, [orders, dateFrom, dateTo]);

  // KPIs from date-filtered orders
  const kpis = useMemo(() => {
    const total = dateFilteredOrders.length;
    const nonCanceled = dateFilteredOrders.filter(o => o.status !== 'CANCELED');
    const revenueUsd = nonCanceled.reduce((s, o) => s + Number(o.total), 0);
    const revenueBs = nonCanceled.reduce((s, o) => {
      if (o.exchange_rate) return s + Number(o.total) * Number(o.exchange_rate);
      return s;
    }, 0);
    const avgTicket = nonCanceled.length > 0 ? revenueUsd / nonCanceled.length : 0;
    const canceled = dateFilteredOrders.filter(o => o.status === 'CANCELED').length;
    const cancelRate = total > 0 ? (canceled / total) * 100 : 0;
    return { total, revenueUsd, revenueBs, avgTicket, canceled, cancelRate };
  }, [dateFilteredOrders]);

  // Filter by tab
  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return dateFilteredOrders;
    return dateFilteredOrders.filter(o => classifyOrder(o) === activeTab);
  }, [dateFilteredOrders, activeTab]);

  // Tab counts
  const tabCounts = useMemo(() => ({
    new: dateFilteredOrders.filter(o => classifyOrder(o) === 'new').length,
    paid: dateFilteredOrders.filter(o => classifyOrder(o) === 'paid').length,
    canceled: dateFilteredOrders.filter(o => classifyOrder(o) === 'canceled').length,
    all: dateFilteredOrders.length,
  }), [dateFilteredOrders]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [activeTab, dateFrom, dateTo]);

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedOrders.length && paginatedOrders.every(o => selectedIds.has(o.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedOrders.map(o => o.id)));
    }
  };

  const handleBatchStatusChange = async (newStatus: string) => {
    const ids = Array.from(selectedIds);
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .in('id', ids);

    if (error) {
      toast.error('Error al actualizar órdenes');
    } else {
      toast.success(`${ids.length} orden(es) actualizada(s) a ${STATUS_DISPLAY[newStatus]?.label || newStatus}`);
      setOrders(prev => prev.map(o => ids.includes(o.id) ? { ...o, status: newStatus } : o));
      setSelectedIds(new Set());
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Error al actualizar estado');
    } else {
      toast.success('Estado actualizado');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  const openOrderDetail = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
  };

  const copyWhatsAppMessage = () => {
    if (selectedOrder?.whatsapp_message) {
      navigator.clipboard.writeText(selectedOrder.whatsapp_message);
      setCopied(true);
      toast.success('Mensaje copiado');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getStatusBadge = (status: string) => {
    const cfg = STATUS_DISPLAY[status] || { label: status, color: 'bg-gray-500' };
    return <Badge className={`${cfg.color} text-white`}>{cfg.label}</Badge>;
  };

  const formatTotal = (order: Order) => {
    const usd = `$${Number(order.total).toFixed(2)}`;
    if (order.payment_currency === 'VES' && order.exchange_rate) {
      const bs = formatBs(Number(order.total) * Number(order.exchange_rate));
      return (
        <div className="text-right">
          <p className="font-semibold">{usd}</p>
          <p className="text-xs text-muted-foreground">Bs {bs}</p>
        </div>
      );
    }
    return <span className="font-semibold">{usd}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold">Órdenes</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { runAutoCancel(); }} className="gap-2 text-xs">
            <Trash2 className="h-3.5 w-3.5" />
            Limpiar antiguas
          </Button>
          <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="flex flex-wrap items-center gap-2">
        {(['today', '7days', '30days', 'all'] as DatePreset[]).map(p => (
          <Button
            key={p}
            variant={datePreset === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleDatePreset(p)}
          >
            {{ today: 'Hoy', '7days': '7 días', '30days': '30 días', all: 'Todo' }[p]}
          </Button>
        ))}
        <div className="flex items-center gap-1 ml-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("gap-1 text-xs", !dateFrom && "text-muted-foreground")}>
                <CalendarIcon className="h-3.5 w-3.5" />
                {dateFrom ? format(dateFrom, 'dd/MM/yy') : 'Desde'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={(d) => { setDateFrom(d); setDatePreset('all'); }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground text-xs">—</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn("gap-1 text-xs", !dateTo && "text-muted-foreground")}>
                <CalendarIcon className="h-3.5 w-3.5" />
                {dateTo ? format(dateTo, 'dd/MM/yy') : 'Hasta'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={(d) => { setDateTo(d); setDatePreset('all'); }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{kpis.total}</p>
              <p className="text-xs text-muted-foreground">Total Órdenes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">${kpis.revenueUsd.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Ingresos USD</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <DollarSign className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">Bs {formatBs(kpis.revenueBs)}</p>
              <p className="text-xs text-muted-foreground">Ingresos Bs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <CreditCard className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">${kpis.avgTicket.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Ticket Promedio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as OrderTab); setSelectedIds(new Set()); }}>
        <TabsList className="grid w-full grid-cols-4">
          {(Object.keys(TAB_CONFIG) as OrderTab[]).map((tab) => (
            <TabsTrigger key={tab} value={tab} className="gap-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">{TAB_CONFIG[tab].icon}</span>
              {TAB_CONFIG[tab].label}
              {tabCounts[tab] > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {tabCounts[tab]}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Batch Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border">
          <span className="text-sm font-medium">{selectedIds.size} orden(es) seleccionada(s)</span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline" className="gap-1 text-green-700 border-green-300 hover:bg-green-50" onClick={() => handleBatchStatusChange('PAID')}>
              <CheckCircle2 className="h-4 w-4" />
              Pagadas
            </Button>
            <Button size="sm" variant="outline" className="gap-1 text-red-700 border-red-300 hover:bg-red-50" onClick={() => handleBatchStatusChange('CANCELED')}>
              <XCircle className="h-4 w-4" />
              Canceladas
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
              Deseleccionar
            </Button>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay órdenes en esta categoría
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={paginatedOrders.length > 0 && paginatedOrders.every(o => selectedIds.has(o.id))}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id} className={cn(
                    selectedIds.has(order.id) && 'bg-primary/5',
                    order.status === 'NEW' && 'bg-blue-500/5',
                    order.status === 'PAYMENT_SUBMITTED' && 'bg-orange-500/5',
                  )}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.has(order.id)}
                        onCheckedChange={() => toggleSelect(order.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold">
                      {order.order_number || `#${order.id.slice(0, 8).toUpperCase()}`}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(order.created_at), 'dd/MM/yy HH:mm', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.first_name} {order.last_name}</p>
                        <p className="text-xs text-muted-foreground">{order.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{formatTotal(order)}</TableCell>
                    <TableCell className="text-sm">
                      {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className="w-36 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${status.color}`} />
                                {status.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openOrderDetail(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-muted-foreground">
                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredOrders.length)} de {filteredOrders.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce<(number | '...')[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1]) > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <span key={`e${i}`} className="px-1 text-muted-foreground">…</span>
                    ) : (
                      <Button key={p} variant={p === currentPage ? 'default' : 'outline'} size="icon" className="h-8 w-8 text-xs" onClick={() => setCurrentPage(p)}>
                        {p}
                      </Button>
                    )
                  )}
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Orden {selectedOrder?.order_number || `#${selectedOrder?.id.slice(0, 8).toUpperCase()}`}
              {selectedOrder && getStatusBadge(selectedOrder.status)}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card>
                <CardContent className="pt-4 grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Nombre</p>
                    <p className="font-medium">{selectedOrder.first_name} {selectedOrder.last_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{selectedOrder.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Correo</p>
                    <p className="font-medium">{selectedOrder.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fecha</p>
                    <p className="font-medium">
                      {format(new Date(selectedOrder.created_at), "d 'de' MMMM, yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Items */}
              <Card>
                <CardContent className="pt-4">
                  {loadingItems ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                          <div>
                            <span className="font-medium">{item.quantity}x</span>{' '}
                            {item.product_name_snapshot}
                            <span className="text-muted-foreground ml-2">
                              @ ${item.unit_price_snapshot.toFixed(2)}
                            </span>
                          </div>
                          <span className="font-medium">${item.line_total.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardContent className="pt-4 grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Método</p>
                    <p className="font-medium">
                      {PAYMENT_LABELS[selectedOrder.payment_method] || selectedOrder.payment_method}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Moneda de pago</p>
                    <p className="font-medium">{selectedOrder.payment_currency}</p>
                  </div>
                  {selectedOrder.exchange_rate && (
                    <div>
                      <p className="text-muted-foreground">Tasa Usada</p>
                      <p className="font-medium">Bs {selectedOrder.exchange_rate.toFixed(2)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <div className="font-bold text-lg text-secondary">
                      ${Number(selectedOrder.total).toFixed(2)}
                      {selectedOrder.payment_currency === 'VES' && selectedOrder.exchange_rate && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">
                          / Bs {(Number(selectedOrder.total) * Number(selectedOrder.exchange_rate)).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Message */}
              {selectedOrder.whatsapp_message && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Mensaje de WhatsApp</p>
                      <Button variant="outline" size="sm" onClick={copyWhatsAppMessage} className="gap-2">
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copiado' : 'Copiar'}
                      </Button>
                    </div>
                    <pre className="text-xs bg-muted p-4 rounded-lg whitespace-pre-wrap overflow-x-auto">
                      {selectedOrder.whatsapp_message}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
