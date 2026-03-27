// FEATURE [EXTRAS]: Hook para cargar extras disponibles por categoría/producto
// Los extras se cachean 2 minutos y se filtran por categoría del producto.
// Si un extra tiene product_id, solo aplica a ese producto específico;
// si product_id es null, aplica a toda la categoría.

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductExtra {
  id: string;
  nombre: string;
  precio_usd: number;
  categoria: string;
  product_id: string | null;
  activo: boolean;
  orden: number;
}

const fetchExtras = async (): Promise<ProductExtra[]> => {
  const { data, error } = await supabase
    .from('product_extras')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  if (error) throw error;
  return (data || []) as unknown as ProductExtra[];
};

export const useProductExtras = () => {
  const { data: allExtras = [], isLoading } = useQuery({
    queryKey: ['product-extras'],
    queryFn: fetchExtras,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Obtener extras aplicables a un producto específico
  const getExtrasForProduct = (productId: string, categoria: string): ProductExtra[] => {
    return allExtras.filter(extra =>
      extra.categoria === categoria &&
      (extra.product_id === null || extra.product_id === productId)
    );
  };

  // Verificar si una categoría tiene extras disponibles
  const categoryHasExtras = (categoria: string): boolean => {
    return allExtras.some(extra => extra.categoria === categoria);
  };

  return {
    allExtras,
    getExtrasForProduct,
    categoryHasExtras,
    isLoading,
  };
};
