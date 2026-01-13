import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Config {
  tasa_ves: number;
  whatsapp: string;
  instagram_url: string;
  tiktok_url: string;
  maps_url: string;
}

export const useConfig = () => {
  const [config, setConfig] = useState<Config>({
    tasa_ves: 50,
    whatsapp: '',
    instagram_url: '',
    tiktok_url: '',
    maps_url: '',
  });
  const [loading, setLoading] = useState(true);

  const fetchConfig = useCallback(async () => {
    const { data, error } = await supabase
      .from('config')
      .select('key, value');

    if (error) {
      console.error('Error fetching config:', error);
      return;
    }

    if (data) {
      const configObj: Partial<Config> = {};
      data.forEach((item) => {
        if (item.key === 'tasa_ves') {
          configObj.tasa_ves = parseFloat(item.value);
        } else if (item.key in configObj || ['whatsapp', 'instagram_url', 'tiktok_url', 'maps_url'].includes(item.key)) {
          (configObj as Record<string, string | number>)[item.key] = item.value;
        }
      });
      setConfig(prev => ({ ...prev, ...configObj }));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const updateConfig = async (key: string, value: string) => {
    const { error } = await supabase
      .from('config')
      .update({ value })
      .eq('key', key);

    if (error) {
      throw error;
    }

    await fetchConfig();
  };

  return {
    config,
    loading,
    updateConfig,
    refetch: fetchConfig,
  };
};
