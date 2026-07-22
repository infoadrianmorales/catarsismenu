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

// [2026-07-22] FALLBACK ROBUSTO: si la consulta a DB falla o retorna vacío
// (ej. Safari iOS bloqueando fetch, error de red intermitente), usamos esta
// lista hardcoded para que la home NUNCA quede sin categorías y los
// productos (aún los estáticos de menuItems.ts) siempre tengan dónde
// renderizarse. Mantener sincronizado con la tabla `categories`.
const fallbackDbCategories: PublicCategory[] = [
  { id: 'fb-entradas',    slug: 'entradas',    nombre: 'Entradas',    descripcion: null, icono: 'Soup',    orden: 1 },
  { id: 'fb-hamburguesas',slug: 'hamburguesas',nombre: 'Hamburguesas',descripcion: null, icono: 'Beef',    orden: 2 },
  { id: 'fb-emparedados', slug: 'emparedados', nombre: 'Emparedados', descripcion: null, icono: 'Sandwich',orden: 3 },
  { id: 'fb-pizzas',      slug: 'pizzas',      nombre: 'Pizzas',      descripcion: null, icono: 'Pizza',   orden: 4 },
  { id: 'fb-parrilla',    slug: 'parrilla',    nombre: 'Parrilla',    descripcion: null, icono: 'Flame',   orden: 5 },
  { id: 'fb-ensaladas',   slug: 'ensaladas',   nombre: 'Ensaladas',   descripcion: null, icono: 'Salad',   orden: 6 },
  { id: 'fb-bebidas',     slug: 'bebidas',     nombre: 'Bebidas',     descripcion: null, icono: 'GlassWater', orden: 7 },
  { id: 'fb-cocteleria',  slug: 'cocteleria',  nombre: 'Coctelería',  descripcion: null, icono: 'Wine',    orden: 8 },
];

export const usePublicCategories = () => {
  const { data: dbCategories = [], isLoading, error } = useQuery({
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

      // [2026-07-22 v2] Tratar respuesta vacía como fallo transitorio para
      // que React Query reintente en vez de cachearlo 5 minutos.
      if (!data || data.length === 0) {
        throw new Error('categories:empty-response');
      }

      return data as PublicCategory[];
    },
    staleTime: 60 * 1000, // 60 s (antes 5 min) para autocorregir estados degradados
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
  });

  // [2026-07-22] Si la query terminó (no loading) y no trajo datos,
  // usar el fallback hardcoded para blindar la home.
  const effectiveDbCategories = dbCategories.length === 0
    ? fallbackDbCategories
    : dbCategories;

  // Map DB categories to include icon components
  const categoriesWithIcons: CategoryWithIcon[] = effectiveDbCategories.map(cat => ({
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
    error: error as Error | null,
    usingFallback: dbCategories.length === 0,
    getCategoryBySlug,
  };
};

