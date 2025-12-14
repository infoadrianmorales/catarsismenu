import { useState, useEffect, useCallback } from 'react';
import { Currency } from '@/types/menu';
import { appConfig } from '@/data/config';

const STORAGE_KEY = 'moneda_activa';

export const useCurrency = () => {
  const [currency, setCurrency] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return (stored === 'VES' || stored === 'USD') ? stored : 'USD';
    }
    return 'USD';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const toggleCurrency = useCallback(() => {
    setCurrency(prev => prev === 'USD' ? 'VES' : 'USD');
    // Analytics event
    window.dispatchEvent(new CustomEvent('analytics', {
      detail: { event: 'toggle_moneda', currency: currency === 'USD' ? 'VES' : 'USD' }
    }));
  }, [currency]);

  const formatPrice = useCallback((priceUSD: number, showBoth = false) => {
    const priceVES = priceUSD * appConfig.tasa_ves;
    
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
  }, [currency]);

  const getPrices = useCallback((priceUSD: number) => {
    return {
      usd: priceUSD,
      ves: priceUSD * appConfig.tasa_ves,
      formattedUSD: `$${priceUSD.toFixed(2)}`,
      formattedVES: `Bs ${(priceUSD * appConfig.tasa_ves).toFixed(2)}`,
    };
  }, []);

  return {
    currency,
    toggleCurrency,
    formatPrice,
    getPrices,
    exchangeRate: appConfig.tasa_ves,
  };
};
