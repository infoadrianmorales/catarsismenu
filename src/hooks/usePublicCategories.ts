import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { 
  LayoutGrid, 
  TrendingUp,
  Utensils,
  Soup,
  Beef,
  Sandwich,
  Pizza,
  Flame,
  Salad,
  Wine,
  IceCream,
  UtensilsCrossed,
  Cake,
  Coffee,
  Beer,
  GlassWater,
  type LucideIcon
} from 'lucide-react';

export interface PublicCategory {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  icono: string;
  orden: number;
}

export interface CategoryWithIcon extends PublicCategory {
  icon: LucideIcon;
}

// Map icon names from DB to Lucide components
const iconMap: Record<string, LucideIcon> = {
  LayoutGrid,
  TrendingUp,
  Utensils,
  UtensilsCrossed,
  Soup,
  Beef,
  Sandwich,
  Pizza,
  Flame,
  Salad,
  Wine,
  IceCream,
  Cake,
  Coffee,
  Beer,
  GlassWater,
};

// Virtual categories that are handled by the app, not stored in DB
const virtualCategories: CategoryWithIcon[] = [
  {
    id: 'virtual-todos',
    slug: 'todos',
    nombre: 'Todos',
    descripcion: null,
    icono: 'LayoutGrid',
    orden: -2,
    icon: LayoutGrid,
  },
  {
    id: 'virtual-best-seller',
    slug: 'best-seller',
    nombre: 'Best Seller',
    descripcion: 'Los favoritos de nuestros clientes',
    icono: 'TrendingUp',
    orden: -1,
    icon: TrendingUp,
  },
];

export const usePublicCategories = () => {
  const { data: dbCategories = [], isLoading } = useQuery({
    queryKey: ['public-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, slug, nombre, descripcion, icono, orden')
        .eq('activo', true)
        .order('orden', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return (data || []) as PublicCategory[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // Map DB categories to include icon components
  const categoriesWithIcons: CategoryWithIcon[] = dbCategories.map(cat => ({
    ...cat,
    icon: iconMap[cat.icono] || Utensils,
  }));

  // Combine virtual + DB categories
  const allCategories = [...virtualCategories, ...categoriesWithIcons];

  // Helper to get category by slug
  const getCategoryBySlug = (slug: string): CategoryWithIcon | undefined => {
    return allCategories.find(cat => cat.slug === slug);
  };

  // Get only real DB categories (for sections, excluding virtual ones)
  const sectionCategories = [
    virtualCategories[1], // best-seller
    ...categoriesWithIcons,
  ];

  // Get category labels map for FilteredProductsGrid
  const categoryLabels: Record<string, string> = allCategories.reduce((acc, cat) => {
    acc[cat.slug] = cat.nombre;
    return acc;
  }, {} as Record<string, string>);

  return {
    categories: allCategories,
    sectionCategories,
    categoryLabels,
    loading: isLoading,
    getCategoryBySlug,
  };
};
