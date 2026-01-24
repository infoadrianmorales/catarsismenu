import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Eye, RefreshCw, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
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

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'Nuevo', color: 'bg-blue-500' },
  { value: 'IN_PROGRESS', label: 'En Proceso', color: 'bg-yellow-500' },
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

export const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [copied, setCopied] = useState(false);

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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold">Órdenes</h2>
        <Button variant="outline" size="sm" onClick={fetchOrders} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay órdenes registradas
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
                {orders.map((order) => (
                  <TableRow key={order.id}>
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
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
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
