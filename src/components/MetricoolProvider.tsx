import { useEffect } from 'react';
import { useConfig } from '@/hooks/useConfig';

export const MetricoolProvider = () => {
  const { config, loading } = useConfig();

  useEffect(() => {
    if (loading) return;

    // Read metricool_hash from config (we need to fetch it separately since useConfig doesn't include it)
    const loadMetricool = async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data } = await supabase
        .from('config')
        .select('value')
        .eq('key', 'metricool_hash')
        .single();

      const hash = data?.value;
      if (!hash || hash.trim() === '') return;

      // Avoid loading twice
      if (document.getElementById('metricool-script')) return;

      const script = document.createElement('script');
      script.id = 'metricool-script';
      script.type = 'text/javascript';
      script.src = 'https://tracker.metricool.com/resources/be.js';
      script.onload = () => {
        if ((window as any).beTracker) {
          (window as any).beTracker.t({ hash });
        }
      };
      document.head.appendChild(script);
    };

    loadMetricool();
  }, [loading]);

  return null;
};
