import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, RefreshCw, Copy, Check, Clock, CreditCard, Truck, XCircle, DollarSign, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, isToday, startOfWeek, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

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

type OrderTab = 'pending' | 'paid' | 'delivered' | 'canceled' | 'all';

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'Nuevo', color: 'bg-blue-500' },
  { value: 'IN_PROGRESS', label: 'En Proceso', color: 'bg-yellow-500' },
  { value: 'PAYMENT_SUBMITTED', label: 'Pago Enviado', color: 'bg-orange-500' },
  { value: 'PAID', label: 'Pagado', color: 'bg-green-500' },
  { value: 'DELIVERED', label: 'Entregado', color: 'bg-purple-500' },
  { value: 'CANCELED', label: 'Cancelado', color: 'bg-red-500' },
];

const PAYMENT_LABELS: Record<string, string> = {
  PAGOMOVIL: 'Pago Móvil',
  ZELLE: 'Zelle',
  USDT: 'USDT',
  ZINLI: 'Zinli',
  TRANSFER: 'Transferencia',
};

const TAB_CONFIG: Record<OrderTab, { label: string; statuses: string[]; icon: React.ReactNode }> = {
  pending: { 
    label: 'Pendientes', 
    statuses: ['NEW', 'IN_PROGRESS', 'PAYMENT_SUBMITTED'],
    icon: <Clock className="h-4 w-4" />
  },
  paid: { 
    label: 'Pagadas', 
    statuses: ['PAID'],
    icon: <CreditCard className="h-4 w-4" />
  },
  delivered: { 
    label: 'Entregadas', 
    statuses: ['DELIVERED'],
    icon: <Truck className="h-4 w-4" />
  },
  canceled: { 
    label: 'Canceladas', 
    statuses: ['CANCELED'],
    icon: <XCircle className="h-4 w-4" />
  },
  all: { 
    label: 'Todas', 
    statuses: [],
    icon: <ShoppingBag className="h-4 w-4" />
  },
};

export const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<OrderTab>('pending');

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

  const fetchOrderItems = async (orderId: string) => {
    setLoadingItems(true);
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      toast.error('Error al cargar items');
    } else {
      setOrderItems(data || []);
    }
    setLoadingItems(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });

    const pending = orders.filter(o => ['NEW', 'IN_PROGRESS', 'PAYMENT_SUBMITTED'].includes(o.status)).length;
    
    const paidOrders = orders.filter(o => o.status === 'PAID' || o.status === 'DELIVERED');
    const paidToday = paidOrders.filter(o => isToday(new Date(o.created_at))).length;
    const paidThisWeek = paidOrders.filter(o => 
      isWithinInterval(new Date(o.created_at), { start: weekStart, end: now })
    ).length;
    
    const revenueToday = paidOrders
      .filter(o => isToday(new Date(o.created_at)))
      .reduce((sum, o) => sum + Number(o.total), 0);
    
    const canceled = orders.filter(o => o.status === 'CANCELED').length;

    return { pending, paidToday, paidThisWeek, revenueToday, canceled };
  }, [orders]);

  // Filter orders by active tab
  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter(o => TAB_CONFIG[activeTab].statuses.includes(o.status));
  }, [orders, activeTab]);

  // Count orders per tab
  const tabCounts = useMemo(() => {
    return {
      pending: orders.filter(o => TAB_CONFIG.pending.statuses.includes(o.status)).length,
      paid: orders.filter(o => TAB_CONFIG.paid.statuses.includes(o.status)).length,
      delivered: orders.filter(o => TAB_CONFIG.delivered.statuses.includes(o.status)).length,
      canceled: orders.filter(o => TAB_CONFIG.canceled.statuses.includes(o.status)).length,
      all: orders.length,
    };
  }, [orders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      toast.error('Error al actualizar estado');
    } else {
      toast.success('Estado actualizado');
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      );
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
    const statusConfig = STATUS_OPTIONS.find(s => s.value === status);
    return (
      <Badge className={`${statusConfig?.color || 'bg-gray-500'} text-white`}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const formatPrice = (amount: number, currency: string) => {
    return currency === 'VES' 
      ? `Bs ${amount.toFixed(2)}`
      : `$${amount.toFixed(2)}`;
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
        <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{kpis.pending}</p>
              <p className="text-xs text-muted-foreground">Pendientes de pago</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{kpis.paidToday} <span className="text-sm font-normal text-muted-foreground">/ {kpis.paidThisWeek}</span></p>
              <p className="text-xs text-muted-foreground">Pagadas hoy / semana</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <DollarSign className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">${kpis.revenueToday.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground">Ingresos hoy</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{kpis.canceled}</p>
              <p className="text-xs text-muted-foreground">Canceladas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as OrderTab)}>
        <TabsList className="grid w-full grid-cols-5">
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
                  <TableHead>ID</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className={
                    order.status === 'NEW' ? 'bg-blue-500/5' :
                    order.status === 'PAYMENT_SUBMITTED' ? 'bg-orange-500/5' :
                    undefined
                  }>
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
                    <TableCell className="font-semibold">
                      {formatPrice(order.total, order.currency_mode)}
                    </TableCell>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openOrderDetail(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Datos del Cliente</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Items del Pedido</CardTitle>
                </CardHeader>
                <CardContent>
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Información de Pago</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Método</p>
                    <p className="font-medium">
                      {PAYMENT_LABELS[selectedOrder.payment_method] || selectedOrder.payment_method}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Moneda</p>
                    <p className="font-medium">{selectedOrder.currency_mode}</p>
                  </div>
                  {selectedOrder.exchange_rate && (
                    <div>
                      <p className="text-muted-foreground">Tasa Usada</p>
                      <p className="font-medium">Bs {selectedOrder.exchange_rate.toFixed(2)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold text-lg text-secondary">
                      {formatPrice(selectedOrder.total, selectedOrder.currency_mode)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Message */}
              <Card>
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm">Mensaje de WhatsApp</CardTitle>
                  <Button variant="outline" size="sm" onClick={copyWhatsAppMessage} className="gap-2">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </Button>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-4 rounded-lg whitespace-pre-wrap overflow-x-auto">
                    {selectedOrder.whatsapp_message}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
