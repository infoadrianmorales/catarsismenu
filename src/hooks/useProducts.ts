import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, MenuCategory } from '@/types/menu';
import { menuItems as staticMenuItems } from '@/data/menuItems';

// Fetch products from Supabase
const fetchProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('activo', true)
    .order('orden', { ascending: true });

  if (error) throw error;
  return data;
};

// Fetch best sellers from Supabase
const fetchBestSellers = async () => {
  const { data, error } = await supabase
    .from('best_sellers_food')
    .select('*');

  if (error) throw error;
  return data;
};

// Transform DB product to MenuItem
const transformProduct = (product: any): MenuItem => ({
  id: product.id,
  nombre: product.nombre,
  slug: product.slug,
  descripcion_corta: product.descripcion_corta || '',
  precio_usd: Number(product.precio_usd),
  categoria: product.categoria as Exclude<MenuCategory, 'todos' | 'best-seller'>,
  imagen: product.imagen_url || '/placeholder.svg',
  ratio: '1x1' as const,
  tags: product.tags || [],
  orden: product.orden || 0,
  destacado: product.destacado || false,
  is_orderable: product.is_orderable !== false,
});

export const useProducts = () => {
  // Cached query for products - stale for 2 minutes
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Cached query for best sellers
  const { data: bestSellersData, isLoading: bestSellersLoading } = useQuery({
    queryKey: ['best-sellers'],
    queryFn: fetchBestSellers,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Memoized transformed products
  const products = useMemo(() => {
    if (!productsData || productsData.length === 0) {
      return staticMenuItems;
    }

    const transformedProducts = productsData.map(transformProduct);
    
    // Merge with static items (static items as fallback for categories not in DB)
    const dbCategories = new Set(transformedProducts.map(p => p.categoria));
    const staticFallback = staticMenuItems.filter(item => !dbCategories.has(item.categoria));
    
    return [...transformedProducts, ...staticFallback];
  }, [productsData]);

  // Memoized featured products
  const featuredProducts = useMemo(() => {
    if (!productsData) return [];
    return productsData
      .filter(p => p.destacado)
      .map(transformProduct);
  }, [productsData]);

  // Memoized best sellers
  const bestSellers = useMemo(() => {
    if (!bestSellersData) return [];
    return bestSellersData.map(transformProduct);
  }, [bestSellersData]);

  return {
    products,
    featuredProducts,
    bestSellers,
    loading: productsLoading || bestSellersLoading,
    error: productsError?.message || null,
  };
};
