import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, MenuCategory } from '@/types/menu';
import { menuItems as staticMenuItems } from '@/data/menuItems';

export const useProducts = () => {
  const [products, setProducts] = useState<MenuItem[]>(staticMenuItems);
  const [featuredProducts, setFeaturedProducts] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('activo', true)
          .order('orden', { ascending: true });

        if (error) {
          console.error('Error fetching products:', error);
          // Fall back to static data
          setProducts(staticMenuItems);
          setFeaturedProducts([]);
        } else if (data && data.length > 0) {
          // Transform database products to MenuItem format
          const transformedProducts: MenuItem[] = data.map(product => ({
            id: product.id,
            nombre: product.nombre,
            slug: product.slug,
            descripcion_corta: product.descripcion_corta || '',
            precio_usd: Number(product.precio_usd),
            categoria: product.categoria as Exclude<MenuCategory, 'todos'>,
            imagen: product.imagen_url || '/placeholder.svg',
            ratio: '1x1' as const,
            tags: product.tags || [],
            orden: product.orden || 0,
            destacado: product.destacado || false,
          }));
          
          // Merge with static items (static items as fallback for categories not in DB)
          const dbCategories = new Set(transformedProducts.map(p => p.categoria));
          const staticFallback = staticMenuItems.filter(item => !dbCategories.has(item.categoria));
          
          setProducts([...transformedProducts, ...staticFallback]);
          
          // Filter featured products (max 4)
          const featured = transformedProducts.filter(p => p.destacado).slice(0, 4);
          setFeaturedProducts(featured);
        } else {
          // No products in DB, use static data
          setProducts(staticMenuItems);
          setFeaturedProducts([]);
        }
      } catch (err) {
        console.error('Error:', err);
        setProducts(staticMenuItems);
        setFeaturedProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, featuredProducts, loading, error };
};
