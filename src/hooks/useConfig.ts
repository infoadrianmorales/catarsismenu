import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Config {
  tasa_ves: number;
  whatsapp: string;
  instagram_url: string;
  tiktok_url: string;
  maps_url: string;
  meta_pixel_id: string;
  meta_pixel_enabled: boolean;
  // [2026-06-10] Lista de eventos que el admin tiene configurados en Meta Events Manager
  // (declarativa, persistida como JSON string). La consume MetaPixelValidatorCard.
  meta_pixel_configured_events: string[];
  // [MARKETING-PANEL] Google integrations
  gtm_id: string;
  gtm_enabled: boolean;
  ga4_id: string;
  ga4_enabled: boolean;
  gads_conversion_id: string;
  gads_conversion_label: string;
  gads_enabled: boolean;
  google_site_verification: string;
  // [MARKETING-PANEL] GTM snippets editables (reemplazan el hardcode de index.html)
  gtm_head_snippet: string;
  gtm_body_snippet: string;
  gtm_custom_enabled: boolean;
}

const defaultConfig: Config = {
  tasa_ves: 50,
  whatsapp: '',
  instagram_url: '',
  tiktok_url: '',
  maps_url: '',
  meta_pixel_id: '',
  meta_pixel_enabled: false,
  meta_pixel_configured_events: [],
  gtm_id: '',
  gtm_enabled: false,
  ga4_id: '',
  ga4_enabled: false,
  gads_conversion_id: '',
  gads_conversion_label: '',
  gads_enabled: false,
  google_site_verification: '',
  gtm_head_snippet: '',
  gtm_body_snippet: '',
  gtm_custom_enabled: false,
};

const STRING_KEYS = [
  'whatsapp',
  'instagram_url',
  'tiktok_url',
  'maps_url',
  'meta_pixel_id',
  'gtm_id',
  'ga4_id',
  'gads_conversion_id',
  'gads_conversion_label',
  'google_site_verification',
  'gtm_head_snippet',
  'gtm_body_snippet',
];
const BOOL_KEYS = [
  'meta_pixel_enabled',
  'gtm_enabled',
  'ga4_enabled',
  'gads_enabled',
  'gtm_custom_enabled',
];
// Keys cuyo valor en BD es un JSON serializado (array u objeto)
const JSON_KEYS = ['meta_pixel_configured_events'];

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
    } else if (STRING_KEYS.includes(item.key)) {
      (configObj as Record<string, string | number | boolean>)[item.key] = item.value;
    } else if (BOOL_KEYS.includes(item.key)) {
      (configObj as Record<string, string | number | boolean>)[item.key] = item.value === 'true';
    }
  });

  return { ...defaultConfig, ...configObj };
};

export const useConfig = () => {
  const { data: config, isLoading: loading, refetch } = useQuery({
    queryKey: ['app-config'],
    queryFn: fetchConfig,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const updateConfig = useCallback(async (key: string, value: string) => {
    // Upsert so newly seeded marketing keys without prior row still work
    const { error } = await supabase
      .from('config')
      .upsert({ key, value }, { onConflict: 'key' });

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
