import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, endOfDay, format, eachDayOfInterval, eachHourOfInterval } from 'date-fns';

export interface PageViewDataPoint {
  date: string;
  views: number;
  uniqueVisitors: number;
}

export interface PopularPage {
  path: string;
  views: number;
}

interface RawPageView {
  session_id: string;
  path: string;
  created_at: string;
}

export const usePageViews = (
  startDate: Date,
  endDate: Date,
  granularity: 'hourly' | 'daily' = 'daily'
) => {
  const [pageViews, setPageViews] = useState<RawPageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await (supabase as any)
          .from('page_views')
          .select('session_id, path, created_at')
          .gte('created_at', startOfDay(startDate).toISOString())
          .lte('created_at', endOfDay(endDate).toISOString())
          .order('created_at', { ascending: true });

        if (fetchError) throw fetchError;
        setPageViews(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching page views');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  // Time series data
  const series = useMemo((): PageViewDataPoint[] => {
    if (granularity === 'hourly') {
      const hours = eachHourOfInterval({ start: startOfDay(startDate), end: endOfDay(endDate) });
      return hours.map(hour => {
        const hourStr = format(hour, "yyyy-MM-dd'T'HH");
        const hourViews = pageViews.filter(pv =>
          format(new Date(pv.created_at), "yyyy-MM-dd'T'HH") === hourStr
        );
        const uniqueSessions = new Set(hourViews.map(pv => pv.session_id));
        return {
          date: hour.toISOString(),
          views: hourViews.length,
          uniqueVisitors: uniqueSessions.size,
        };
      });
    } else {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      return days.map(day => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const dayViews = pageViews.filter(pv =>
          format(new Date(pv.created_at), 'yyyy-MM-dd') === dayStr
        );
        const uniqueSessions = new Set(dayViews.map(pv => pv.session_id));
        return {
          date: day.toISOString(),
          views: dayViews.length,
          uniqueVisitors: uniqueSessions.size,
        };
      });
    }
  }, [pageViews, startDate, endDate, granularity]);

  // Summary
  const summary = useMemo(() => {
    const uniqueSessions = new Set(pageViews.map(pv => pv.session_id));
    return {
      totalViews: pageViews.length,
      uniqueVisitors: uniqueSessions.size,
    };
  }, [pageViews]);

  // Popular pages
  const popularPages = useMemo((): PopularPage[] => {
    const pathMap = new Map<string, number>();
    pageViews.forEach(pv => {
      pathMap.set(pv.path, (pathMap.get(pv.path) || 0) + 1);
    });
    return Array.from(pathMap.entries())
      .map(([path, views]) => ({ path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
  }, [pageViews]);

  return { series, summary, popularPages, loading, error };
};
