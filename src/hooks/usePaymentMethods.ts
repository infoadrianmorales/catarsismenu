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
      // SEGURIDAD [PM-4]: Se reemplazó SELECT directo en
      // payment_methods por llamada a RPC get_active_payment_methods.
      // La tabla ya no es accesible públicamente de forma directa.
      // La función RPC (SECURITY DEFINER) controla qué datos se
      // exponen y a quién. El ORDER BY display_order está incluido
      // en la RPC, no se necesita .order() adicional.
      const { data, error } = await supabase
        .rpc('get_active_payment_methods');

      if (!error && data) {
        setMethods(data as unknown as PaymentMethod[]);
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
