// [2026-04-08] Refactor: las analíticas de visitas ahora usan funciones SQL
// (get_page_views_summary, get_popular_pages, get_page_views_totals) para agregar
// datos directamente en PostgreSQL. Esto elimina el límite de 1,000 filas del SDK
// y garantiza conteos exactos y verídicos.
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay } from 'date-fns';

export interface PageViewDataPoint {
  date: string;
  views: number;
  uniqueVisitors: number;
}

export interface PopularPage {
  path: string;
  views: number;
}

// [2026-04-10] Agregado soporte para granularidad 'monthly' para el filtro "Todo"
export const usePageViews = (
  startDate: Date,
  endDate: Date,
  granularity: 'hourly' | 'daily' | 'monthly' = 'daily'
) => {
  const [series, setSeries] = useState<PageViewDataPoint[]>([]);
  const [summary, setSummary] = useState({ totalViews: 0, uniqueVisitors: 0 });
  const [popularPages, setPopularPages] = useState<PopularPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const p_start = startOfDay(startDate).toISOString();
      const p_end = endOfDay(endDate).toISOString();

      try {
        const [seriesRes, totalsRes, popularRes] = await Promise.all([
          (supabase as any).rpc('get_page_views_summary', {
            p_start,
            p_end,
            p_granularity: granularity,
          }),
          (supabase as any).rpc('get_page_views_totals', {
            p_start,
            p_end,
          }),
          (supabase as any).rpc('get_popular_pages', {
            p_start,
            p_end,
            p_limit: 5,
          }),
        ]);

        if (seriesRes.error) throw seriesRes.error;
        if (totalsRes.error) throw totalsRes.error;
        if (popularRes.error) throw popularRes.error;

        setSeries(
          (seriesRes.data || []).map((row: any) => ({
            date: row.period,
            views: Number(row.views),
            uniqueVisitors: Number(row.unique_visitors),
          }))
        );

        const totals = totalsRes.data?.[0];
        setSummary({
          totalViews: Number(totals?.total_views ?? 0),
          uniqueVisitors: Number(totals?.unique_visitors ?? 0),
        });

        setPopularPages(
          (popularRes.data || []).map((row: any) => ({
            path: row.path,
            views: Number(row.views),
          }))
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching page views');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, granularity]);

  return { series, summary, popularPages, loading, error };
};
