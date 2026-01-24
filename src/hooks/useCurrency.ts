import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Currency } from '@/types/menu';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'moneda_activa';

export type PriceDisplayMode = 'solo_usd' | 'solo_ves' | 'ambas';

// Fetch config from Supabase - cached with React Query
const fetchCurrencyConfig = async () => {
  const { data, error } = await supabase
    .from('config')
    .select('key, value')
    .in('key', ['tasa_ves', 'price_display_mode']);

  if (error) throw error;
  
  const result = {
    exchangeRate: 50,
    displayMode: 'ambas' as PriceDisplayMode,
  };
  
  data?.forEach(item => {
    if (item.key === 'tasa_ves') {
      result.exchangeRate = parseFloat(item.value);
    } else if (item.key === 'price_display_mode') {
      result.displayMode = item.value as PriceDisplayMode;
    }
  });
  
  return result;
};

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return (stored === 'VES' || stored === 'USD') ? stored : 'USD';
    }
    return 'USD';
  });

  // Use React Query for caching - only fetches once and caches for 5 minutes
  const { data: configData } = useQuery({
    queryKey: ['currency-config'],
    queryFn: fetchCurrencyConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const exchangeRate = configData?.exchangeRate ?? 50;
  const displayMode = configData?.displayMode ?? 'ambas';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const toggleCurrency = useCallback(() => {
    // Only allow toggle if display mode is 'ambas'
    if (displayMode !== 'ambas') return;
    
    setCurrency(prev => prev === 'USD' ? 'VES' : 'USD');
    // Analytics event
    window.dispatchEvent(new CustomEvent('analytics', {
      detail: { event: 'toggle_moneda', currency: currency === 'USD' ? 'VES' : 'USD' }
    }));
  }, [currency, displayMode]);

  const formatPrice = useCallback((priceUSD: number, showBoth = false) => {
    const priceVES = priceUSD * exchangeRate;
    
    if (showBoth) {
      return {
        usd: `$${priceUSD.toFixed(2)}`,
        ves: `Bs ${priceVES.toFixed(2)}`,
      };
    }
    
    if (currency === 'USD') {
      return `$${priceUSD.toFixed(2)}`;
    }
    return `Bs ${priceVES.toFixed(2)}`;
  }, [currency, exchangeRate]);

  const getPrices = useCallback((priceUSD: number) => {
    return {
      usd: priceUSD,
      ves: priceUSD * exchangeRate,
      formattedUSD: `$${priceUSD.toFixed(2)}`,
      formattedVES: `Bs ${(priceUSD * exchangeRate).toFixed(2)}`,
    };
  }, [exchangeRate]);

  return useMemo(() => ({
    currency,
    toggleCurrency,
    formatPrice,
    getPrices,
    exchangeRate,
    displayMode,
  }), [currency, toggleCurrency, formatPrice, getPrices, exchangeRate, displayMode]);
};
