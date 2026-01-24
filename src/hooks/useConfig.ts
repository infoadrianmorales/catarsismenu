import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Config {
  tasa_ves: number;
  whatsapp: string;
  instagram_url: string;
  tiktok_url: string;
  maps_url: string;
}

const defaultConfig: Config = {
  tasa_ves: 50,
  whatsapp: '',
  instagram_url: '',
  tiktok_url: '',
  maps_url: '',
};

// Fetch all config from Supabase
const fetchConfig = async (): Promise<Config> => {
  const { data, error } = await supabase
    .from('config')
    .select('key, value');

  if (error) throw error;

  const configObj: Partial<Config> = {};
  data?.forEach((item) => {
    if (item.key === 'tasa_ves') {
      configObj.tasa_ves = parseFloat(item.value);
    } else if (['whatsapp', 'instagram_url', 'tiktok_url', 'maps_url'].includes(item.key)) {
      (configObj as Record<string, string | number>)[item.key] = item.value;
    }
  });

  return { ...defaultConfig, ...configObj };
};

export const useConfig = () => {
  const { data: config, isLoading: loading, refetch } = useQuery({
    queryKey: ['app-config'],
    queryFn: fetchConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const updateConfig = useCallback(async (key: string, value: string) => {
    const { error } = await supabase
      .from('config')
      .update({ value })
      .eq('key', key);

    if (error) {
      throw error;
    }

    await refetch();
  }, [refetch]);

  return {
    config: config ?? defaultConfig,
    loading,
    updateConfig,
    refetch,
  };
};
