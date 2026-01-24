import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PaymentMethod {
  id: string;
  label: string;
  enabled: boolean;
  supports_usd: boolean;
  supports_ves: boolean;
  instructions_usd: string | null;
  instructions_ves: string | null;
  display_order: number;
}

export const usePaymentMethods = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMethods = async () => {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('enabled', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setMethods(data);
      }
      setLoading(false);
    };

    fetchMethods();
  }, []);

  const getMethodById = (id: string): PaymentMethod | undefined => {
    return methods.find(m => m.id === id);
  };

  const getMethodsForCurrency = (currency: 'USD' | 'VES'): PaymentMethod[] => {
    return methods.filter(m => 
      currency === 'USD' ? m.supports_usd : m.supports_ves
    );
  };

  const getInstructions = (methodId: string, currency: 'USD' | 'VES'): string | null => {
    const method = getMethodById(methodId);
    if (!method) return null;
    return currency === 'USD' ? method.instructions_usd : method.instructions_ves;
  };

  return {
    methods,
    loading,
    getMethodById,
    getMethodsForCurrency,
    getInstructions,
  };
};
