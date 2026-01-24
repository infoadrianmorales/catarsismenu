import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Loader2, Eye, RefreshCw, Search, Users, DollarSign, ShoppingBag, Calendar, Download, Facebook } from 'lucide-react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { exportCustomersForMeta, type ExportFilter, type CustomerForExport, type OrderStatus } from '@/lib/metaExport';

interface CustomerWithMetrics {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  created_at: string;
  order_count: number;
  total_spent: number;
  last_order_at: string | null;
}

interface CustomerOrder {
  id: string;
  created_at: string;
  payment_method: string;
  currency_mode: string;
  total: number;
  status: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW: { label: 'Nuevo', color: 'bg-blue-500' },
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

const EXPORT_FILTER_OPTIONS: { value: ExportFilter; label: string; description: string }[] = [
  { value: 'all', label: 'Todos los clientes', description: 'Exporta toda la base de datos' },
  { value: 'paid', label: 'Clientes con compras pagadas', description: 'Solo quienes completaron al menos un pago' },
  { value: 'open_process', label: 'Proceso abierto (sin pagar)', description: 'Llegaron a WhatsApp pero nunca pagaron' },
];

export const CustomersPanel = () => {
  const [customers, setCustomers] = useState<CustomerWithMetrics[]>([]);
  const [allOrders, setAllOrders] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'orders' | 'spent' | 'recent'>('recent');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithMetrics | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Export dialog state
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFilter, setExportFilter] = useState<ExportFilter>('all');
  const [exporting, setExporting] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    
    // Fetch customers with aggregated order data
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (customersError) {
      toast.error('Error al cargar compradores');
      console.error(customersError);
      setLoading(false);
      return;
    }

    // Fetch order metrics for each customer
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('customer_id, total, created_at, status')
      .not('customer_id', 'is', null);

    if (ordersError) {
      console.error(ordersError);
    }

    // Store all orders for export filtering
    setAllOrders((ordersData || []).map(o => ({ customer_id: o.customer_id!, status: o.status })));

    // Calculate metrics
    const metricsMap = new Map<string, { count: number; total: number; lastOrder: string | null }>();
    
    (ordersData || []).forEach(order => {
      const existing = metricsMap.get(order.customer_id!) || { count: 0, total: 0, lastOrder: null };
      metricsMap.set(order.customer_id!, {
        count: existing.count + 1,
        total: existing.total + Number(order.total),
        lastOrder: !existing.lastOrder || order.created_at > existing.lastOrder 
          ? order.created_at 
          : existing.lastOrder,
      });
    });

    const customersWithMetrics: CustomerWithMetrics[] = (customersData || []).map(customer => {
      const metrics = metricsMap.get(customer.id) || { count: 0, total: 0, lastOrder: null };
      return {
        ...customer,
        order_count: metrics.count,
        total_spent: metrics.total,
        last_order_at: metrics.lastOrder,
      };
    });

    setCustomers(customersWithMetrics);
    setLoading(false);
  };

  const fetchCustomerOrders = async (customerId: string) => {
    setLoadingOrders(true);
    const { data, error } = await supabase
      .from('orders')
      .select('id, created_at, payment_method, currency_mode, total, status')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar historial');
    } else {
      setCustomerOrders(data || []);
    }
    setLoadingOrders(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openCustomerDetail = (customer: CustomerWithMetrics) => {
    setSelectedCustomer(customer);
    fetchCustomerOrders(customer.id);
  };

  // Handle Meta export
  const handleExport = () => {
    setExporting(true);
    
    const customersForExport: CustomerForExport[] = customers.map(c => ({
      id: c.id,
      first_name: c.first_name,
      last_name: c.last_name,
      phone: c.phone,
      email: c.email,
    }));

    const result = exportCustomersForMeta(customersForExport, allOrders, exportFilter);
    
    if (result.success) {
      toast.success(`Exportados ${result.count} clientes`, {
        description: `Archivo: ${result.filename}`,
      });
      setShowExportDialog(false);
    } else {
      toast.error('No hay clientes para exportar con este filtro');
    }
    
    setExporting(false);
  };

  // Get count for each export filter
  const getFilterCount = (filter: ExportFilter): number => {
    const customersForExport: CustomerForExport[] = customers.map(c => ({
      id: c.id,
      first_name: c.first_name,
      last_name: c.last_name,
      phone: c.phone,
      email: c.email,
    }));

    if (filter === 'all') return customers.length;

    const customerOrdersMap = new Map<string, string[]>();
    allOrders.forEach(order => {
      const existing = customerOrdersMap.get(order.customer_id) || [];
      existing.push(order.status);
      customerOrdersMap.set(order.customer_id, existing);
    });

    return customersForExport.filter(customer => {
      const statuses = customerOrdersMap.get(customer.id) || [];
      
      if (filter === 'paid') {
        return statuses.some(s => s === 'PAID' || s === 'DELIVERED');
      }
      
      if (filter === 'open_process') {
        const hasPaid = statuses.some(s => s === 'PAID' || s === 'DELIVERED');
        const hasOrders = statuses.length > 0;
        return hasOrders && !hasPaid;
      }
      
      return true;
    }).length;
  };

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        customer.first_name.toLowerCase().includes(query) ||
        customer.last_name.toLowerCase().includes(query) ||
        customer.phone.includes(query) ||
        customer.email.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'orders':
          return b.order_count - a.order_count;
        case 'spent':
          return b.total_spent - a.total_spent;
        case 'recent':
        default:
          if (!a.last_order_at && !b.last_order_at) return 0;
          if (!a.last_order_at) return 1;
          if (!b.last_order_at) return -1;
          return new Date(b.last_order_at).getTime() - new Date(a.last_order_at).getTime();
      }
    });

  const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-display font-bold">Compradores</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Más reciente</SelectItem>
              <SelectItem value="orders">Más compras</SelectItem>
              <SelectItem value="spent">Mayor gasto</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchCustomers}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setShowExportDialog(true)}
            className="gap-2"
          >
            <Facebook className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar para Meta</span>
            <span className="sm:hidden">Meta</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{customers.length}</p>
              <p className="text-xs text-muted-foreground">Total compradores</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary/10">
              <ShoppingBag className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{customers.reduce((sum, c) => sum + c.order_count, 0)}</p>
              <p className="text-xs text-muted-foreground">Total órdenes</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ${customers.reduce((sum, c) => sum + c.total_spent, 0).toFixed(0)}
              </p>
              <p className="text-xs text-muted-foreground">Total ventas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                ${customers.length > 0 
                  ? (customers.reduce((sum, c) => sum + c.total_spent, 0) / customers.reduce((sum, c) => sum + c.order_count, 0) || 0).toFixed(0)
                  : '0'}
              </p>
              <p className="text-xs text-muted-foreground">Ticket promedio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {filteredCustomers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {searchQuery ? 'No se encontraron compradores' : 'No hay compradores registrados'}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead className="text-center"># Compras</TableHead>
                  <TableHead className="text-right">Total Gastado</TableHead>
                  <TableHead>Última Compra</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <p className="font-medium">{customer.first_name} {customer.last_name}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{customer.phone}</p>
                      <p className="text-xs text-muted-foreground">{customer.email}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{customer.order_count}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-secondary">
                      {formatPrice(customer.total_spent)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {customer.last_order_at 
                        ? format(new Date(customer.last_order_at), 'dd/MM/yy', { locale: es })
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openCustomerDetail(customer)}
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

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer?.first_name} {selectedCustomer?.last_name}
            </DialogTitle>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-primary">{selectedCustomer.order_count}</p>
                    <p className="text-xs text-muted-foreground">Compras</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold text-secondary">{formatPrice(selectedCustomer.total_spent)}</p>
                    <p className="text-xs text-muted-foreground">Total Gastado</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">
                      {selectedCustomer.order_count > 0 
                        ? formatPrice(selectedCustomer.total_spent / selectedCustomer.order_count)
                        : '$0'}
                    </p>
                    <p className="text-xs text-muted-foreground">Ticket Promedio</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-lg font-bold">
                      {selectedCustomer.last_order_at 
                        ? format(new Date(selectedCustomer.last_order_at), 'dd/MM/yy', { locale: es })
                        : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Última Compra</p>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Teléfono</p>
                    <p className="font-medium">{selectedCustomer.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Correo</p>
                    <p className="font-medium">{selectedCustomer.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cliente desde</p>
                    <p className="font-medium">
                      {format(new Date(selectedCustomer.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Order History */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Historial de Compras</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingOrders ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : customerOrders.length === 0 ? (
                    <p className="text-center py-8 text-muted-foreground">Sin órdenes registradas</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Método</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead>Estado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customerOrders.map((order) => {
                          const statusConfig = STATUS_LABELS[order.status];
                          return (
                            <TableRow key={order.id}>
                              <TableCell className="text-sm">
                                {format(new Date(order.created_at), 'dd/MM/yy HH:mm', { locale: es })}
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                #{order.id.slice(0, 8).toUpperCase()}
                              </TableCell>
                              <TableCell className="text-sm">
                                {PAYMENT_LABELS[order.payment_method] || order.payment_method}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {order.currency_mode === 'VES' 
                                  ? `Bs ${order.total.toFixed(2)}`
                                  : `$${order.total.toFixed(2)}`}
                              </TableCell>
                              <TableCell>
                                <Badge className={`${statusConfig?.color || 'bg-gray-500'} text-white`}>
                                  {statusConfig?.label || order.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Facebook className="h-5 w-5 text-blue-600" />
              Exportar para Meta Ads
            </DialogTitle>
            <DialogDescription>
              Genera un archivo CSV compatible con Meta Custom Audiences para crear públicos personalizados en Facebook e Instagram.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label className="text-sm font-medium mb-3 block">Selecciona qué clientes exportar:</Label>
            <RadioGroup value={exportFilter} onValueChange={(v) => setExportFilter(v as ExportFilter)}>
              {EXPORT_FILTER_OPTIONS.map((option) => {
                const count = getFilterCount(option.value);
                return (
                  <div key={option.value} className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor={option.value} className="font-medium cursor-pointer flex items-center gap-2">
                        {option.label}
                        <Badge variant="secondary" className="text-xs">{count}</Badge>
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-sm">
            <p className="font-medium mb-2">El archivo incluirá:</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• <code className="bg-background px-1 rounded">email</code> - Correo normalizado (minúsculas)</li>
              <li>• <code className="bg-background px-1 rounded">phone</code> - Teléfono en formato E.164 (+58...)</li>
              <li>• <code className="bg-background px-1 rounded">fn</code> / <code className="bg-background px-1 rounded">ln</code> - Nombre y apellido</li>
              <li>• <code className="bg-background px-1 rounded">country</code> - País (VE)</li>
            </ul>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleExport} disabled={exporting || getFilterCount(exportFilter) === 0} className="gap-2">
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Descargar CSV ({getFilterCount(exportFilter)})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
