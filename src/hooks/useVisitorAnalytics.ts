// [2026-05-02] CATARSIS — useVisitorAnalytics
// Propósito: Hook admin que consume las RPCs SECURITY DEFINER de analítica de visitantes.
// Modificaciones: Creación inicial — invoca get_visits_by_source, get_visits_by_country y get_visits_daily en paralelo y normaliza filas (source/country/daily con uniqueVisitors).
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay } from 'date-fns';

export interface SourceRow { source: string; total: number }
export interface CountryRow { country: string; total: number }
export interface DailyRow { date: string; total: number; uniqueVisitors: number }

export const useVisitorAnalytics = (startDate: Date, endDate: Date) => {
  const [bySource, setBySource] = useState<SourceRow[]>([]);
  const [byCountry, setByCountry] = useState<CountryRow[]>([]);
  const [daily, setDaily] = useState<DailyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      const p_start = startOfDay(startDate).toISOString();
      const p_end = endOfDay(endDate).toISOString();
      try {
        const [src, cty, day] = await Promise.all([
          (supabase as any).rpc('get_visits_by_source', { p_start, p_end }),
          (supabase as any).rpc('get_visits_by_country', { p_start, p_end }),
          (supabase as any).rpc('get_visits_daily', { p_start, p_end }),
        ]);
        if (src.error) throw src.error;
        if (cty.error) throw cty.error;
        if (day.error) throw day.error;

        setBySource((src.data || []).map((r: any) => ({ source: r.source, total: Number(r.total) })));
        setByCountry((cty.data || []).map((r: any) => ({ country: r.country, total: Number(r.total) })));
        setDaily((day.data || []).map((r: any) => ({
          date: r.date,
          total: Number(r.total),
          uniqueVisitors: Number(r.unique_visitors),
        })));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Error fetching visitor analytics');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [startDate, endDate]);

  return { bySource, byCountry, daily, loading, error };
};
