import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, format, eachDayOfInterval, eachHourOfInterval } from 'date-fns';

export interface SalesDataPoint {
  date: string;
  orders: number;
  revenue: number;
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface PaymentMethodStats {
  method: string;
  label: string;
  count: number;
  percentage: number;
}

export interface SalesSummary {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: string;
  payment_method: string;
}

interface OrderItem {
  product_name_snapshot: string;
  quantity: number;
  line_total: number;
}

export const useSalesAnalytics = (
  startDate: Date,
  endDate: Date,
  granularity: 'hourly' | 'daily' = 'daily'
) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch orders in date range (excluding canceled)
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('id, created_at, total, status, payment_method')
          .gte('created_at', startOfDay(startDate).toISOString())
          .lte('created_at', endOfDay(endDate).toISOString())
          .neq('status', 'CANCELED');

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);

        // Get order IDs for items query (ALL orders except CANCELED)
        const validOrderIds = (ordersData || []).map(o => o.id);

        if (validOrderIds.length > 0) {
          const { data: itemsData, error: itemsError } = await supabase
            .from('order_items')
            .select('product_name_snapshot, quantity, line_total')
            .in('order_id', validOrderIds);

          if (itemsError) throw itemsError;
          setOrderItems(itemsData || []);
        } else {
          setOrderItems([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching sales data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  // Calculate time series data
  const series = useMemo((): SalesDataPoint[] => {
    if (granularity === 'hourly') {
      const hours = eachHourOfInterval({ start: startOfDay(startDate), end: endOfDay(endDate) });
      return hours.map(hour => {
        const hourStr = format(hour, "yyyy-MM-dd'T'HH");
        const hourOrders = orders.filter(o => 
          format(new Date(o.created_at), "yyyy-MM-dd'T'HH") === hourStr
        );
        return {
          date: hour.toISOString(),
          orders: hourOrders.length,
          revenue: hourOrders.reduce((sum, o) => sum + Number(o.total), 0)
        };
      });
    } else {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      return days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayOrders = orders.filter(o => 
          format(new Date(o.created_at), 'yyyy-MM-dd') === dayStr
        );
        return {
          date: day.toISOString(),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + Number(o.total), 0)
        };
      });
    }
  }, [orders, startDate, endDate, granularity]);

  // Calculate summary
  const summary = useMemo((): SalesSummary => {
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    return {
      totalOrders: orders.length,
      totalRevenue,
      avgOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0
    };
  }, [orders]);

  // Calculate top products
  const topProducts = useMemo((): TopProduct[] => {
    const productMap = new Map<string, { quantity: number; revenue: number }>();
    
    orderItems.forEach(item => {
      const existing = productMap.get(item.product_name_snapshot) || { quantity: 0, revenue: 0 };
      productMap.set(item.product_name_snapshot, {
        quantity: existing.quantity + item.quantity,
        revenue: existing.revenue + Number(item.line_total)
      });
    });

    return Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orderItems]);

  // Calculate payment method distribution
  const paymentMethods = useMemo((): PaymentMethodStats[] => {
    const methodMap = new Map<string, number>();
    
    orders.forEach(order => {
      const count = methodMap.get(order.payment_method) || 0;
      methodMap.set(order.payment_method, count + 1);
    });

    const total = orders.length || 1;
    
    const methodLabels: Record<string, string> = {
      'zelle': 'Zelle',
      'pago_movil': 'Pago Móvil',
      'usdt': 'USDT',
      'efectivo_usd': 'Efectivo USD',
      'efectivo_ves': 'Efectivo VES',
      'binance': 'Binance Pay',
      'transferencia': 'Transferencia'
    };

    return Array.from(methodMap.entries())
      .map(([method, count]) => ({
        method,
        label: methodLabels[method] || method,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  return {
    series,
    summary,
    topProducts,
    paymentMethods,
    loading,
    error
  };
};
