import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, MenuCategory } from '@/types/menu';
import { menuItems as staticMenuItems } from '@/data/menuItems';

export const useProducts = () => {
  const [products, setProducts] = useState<MenuItem[]>(staticMenuItems);
  const [featuredProducts, setFeaturedProducts] = useState<MenuItem[]>([]);
  const [bestSellers, setBestSellers] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch products and best sellers in parallel
        const [productsResult, bestSellersResult] = await Promise.all([
          supabase
            .from('products')
            .select('*')
            .eq('activo', true)
            .order('orden', { ascending: true }),
          supabase
            .from('best_sellers_food')
            .select('*')
        ]);

        if (productsResult.error) {
          console.error('Error fetching products:', productsResult.error);
          setProducts(staticMenuItems);
          setFeaturedProducts([]);
        } else if (productsResult.data && productsResult.data.length > 0) {
          // Transform database products to MenuItem format
          const transformedProducts: MenuItem[] = productsResult.data.map(product => ({
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
          }));
          
          // Merge with static items (static items as fallback for categories not in DB)
          const dbCategories = new Set(transformedProducts.map(p => p.categoria));
          const staticFallback = staticMenuItems.filter(item => !dbCategories.has(item.categoria));
          
          setProducts([...transformedProducts, ...staticFallback]);
          
          // Filter featured products (max 4)
          const featured = transformedProducts.filter(p => p.destacado).slice(0, 4);
          setFeaturedProducts(featured);
        } else {
          setProducts(staticMenuItems);
          setFeaturedProducts([]);
        }

        // Process best sellers
        if (bestSellersResult.error) {
          console.error('Error fetching best sellers:', bestSellersResult.error);
          setBestSellers([]);
        } else if (bestSellersResult.data && bestSellersResult.data.length > 0) {
          const transformedBestSellers: MenuItem[] = bestSellersResult.data.map(product => ({
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
          }));
          setBestSellers(transformedBestSellers);
        } else {
          setBestSellers([]);
        }
      } catch (err) {
        console.error('Error:', err);
        setProducts(staticMenuItems);
        setFeaturedProducts([]);
        setBestSellers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, featuredProducts, bestSellers, loading, error };
};
