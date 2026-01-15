import { useState, useEffect, useCallback } from 'react';
import { Currency } from '@/types/menu';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'moneda_activa';

export type PriceDisplayMode = 'solo_usd' | 'solo_ves' | 'ambas';

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return (stored === 'VES' || stored === 'USD') ? stored : 'USD';
    }
    return 'USD';
  });

  const [exchangeRate, setExchangeRate] = useState<number>(50);
  const [displayMode, setDisplayMode] = useState<PriceDisplayMode>('ambas');

  // Fetch exchange rate and display mode from database
  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('config')
        .select('key, value')
        .in('key', ['tasa_ves', 'price_display_mode']);

      if (!error && data) {
        data.forEach(item => {
          if (item.key === 'tasa_ves') {
            setExchangeRate(parseFloat(item.value));
          } else if (item.key === 'price_display_mode') {
            setDisplayMode(item.value as PriceDisplayMode);
          }
        });
      }
    };

    fetchConfig();
  }, []);

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

  return {
    currency,
    toggleCurrency,
    formatPrice,
    getPrices,
    exchangeRate,
    displayMode,
  };
};
