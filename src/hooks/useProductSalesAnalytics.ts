// ================================================
// [2026-04-08] USE PRODUCT SALES ANALYTICS
// Hook que consume las 4 RPCs de analytics detallado:
// get_product_sales_history, get_sales_by_category,
// get_sales_by_source, get_extras_analytics.
// Usa RPCs server-side para evitar el límite de 1000
// filas del SDK de Supabase.
// ================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductSalesHistoryItem {
  product_id: string;
  product_name: string;
  category: string | null;
  total_quantity: number;
  total_revenue: number;
  last_sold_at: string;
  order_count: number;
}

export interface SalesByCategoryItem {
  category: string;
  total_quantity: number;
  total_revenue: number;
  product_count: number;
}

export interface SalesBySourceItem {
  source: string;
  total_quantity: number;
  total_revenue: number;
  order_count: number;
  percentage: number;
}

export interface ExtrasAnalyticsItem {
  extra_name: string;
  total_quantity: number;
  total_revenue: number;
  times_added: number;
}

export const useProductSalesAnalytics = (
  dateFrom: Date,
  dateTo: Date,
  categoryFilter?: string | null
) => {
  const [productHistory, setProductHistory] = useState<ProductSalesHistoryItem[]>([]);
  const [salesByCategory, setSalesByCategory] = useState<SalesByCategoryItem[]>([]);
  const [salesBySource, setSalesBySource] = useState<SalesBySourceItem[]>([]);
  const [extrasAnalytics, setExtrasAnalytics] = useState<ExtrasAnalyticsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fromISO = dateFrom.toISOString();
        const toISO = dateTo.toISOString();

        // [2026-04-08] Llamadas en paralelo a las 4 RPCs
        const [historyRes, categoryRes, sourceRes, extrasRes] = await Promise.all([
          supabase.rpc('get_product_sales_history', {
            date_from: fromISO,
            date_to: toISO,
            category_filter: categoryFilter || null,
          }),
          supabase.rpc('get_sales_by_category', {
            date_from: fromISO,
            date_to: toISO,
          }),
          supabase.rpc('get_sales_by_source', {
            date_from: fromISO,
            date_to: toISO,
          }),
          supabase.rpc('get_extras_analytics', {
            date_from: fromISO,
            date_to: toISO,
          }),
        ]);

        if (historyRes.error) throw historyRes.error;
        if (categoryRes.error) throw categoryRes.error;
        if (sourceRes.error) throw sourceRes.error;
        if (extrasRes.error) throw extrasRes.error;

        setProductHistory((historyRes.data as ProductSalesHistoryItem[]) || []);
        setSalesByCategory((categoryRes.data as SalesByCategoryItem[]) || []);
        setSalesBySource((sourceRes.data as SalesBySourceItem[]) || []);
        setExtrasAnalytics((extrasRes.data as ExtrasAnalyticsItem[]) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [dateFrom, dateTo, categoryFilter]);

  return { productHistory, salesByCategory, salesBySource, extrasAnalytics, isLoading, error };
};
