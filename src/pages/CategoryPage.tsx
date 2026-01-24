import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { MenuHeader } from '@/components/MenuHeader';
import { Footer } from '@/components/Footer';
import { StickyActionBar } from '@/components/StickyActionBar';
import { SearchBar } from '@/components/SearchBar';
import { MenuCard } from '@/components/MenuCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { useProducts } from '@/hooks/useProducts';
import { useState, useMemo } from 'react';

const categoryTitles: Record<string, { title: string; subtitle: string }> = {
  entradas: {
    title: 'Entradas & Aperitivos',
    subtitle: 'El comienzo perfecto para una experiencia gastronómica inolvidable.',
  },
  hamburguesas: {
    title: 'Hamburguesas Gourmet',
    subtitle: 'Nuestras hamburguesas gourmet son jugosas y sabrosas. Ingredientes frescos combinados a la perfección.',
  },
  emparedados: {
    title: 'Emparedados Premium',
    subtitle: 'Sándwiches artesanales con ingredientes de primera calidad.',
  },
  pizzas: {
    title: 'Pizzas Artesanales',
    subtitle: 'Masa artesanal horneada a la perfección con ingredientes de primera calidad.',
  },
  parrilla: {
    title: 'Parrilla',
    subtitle: 'Carnes y mariscos a la parrilla, preparados en su punto perfecto.',
  },
  ensaladas: {
    title: 'Ensaladas Frescas',
    subtitle: 'Opciones ligeras y nutritivas con ingredientes frescos del día.',
  },
  cocteleria: {
    title: 'Coctelería Premium',
    subtitle: 'Combinaciones únicas y refrescantes que te transportan a otro nivel.',
  },
  postres: {
    title: 'Postres',
    subtitle: 'El final perfecto para una experiencia deliciosa.',
  },
  'best-seller': {
    title: '🔥 Best Seller',
    subtitle: 'Los favoritos de nuestros clientes. Los platos más pedidos del menú.',
  },
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { currency, toggleCurrency, displayMode } = useCurrency();
  const { products, bestSellers, loading } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  const categoryInfo = categoryTitles[slug || ''] || { 
    title: slug?.charAt(0).toUpperCase() + (slug?.slice(1) || ''), 
    subtitle: '' 
  };

  const categoryProducts = useMemo(() => {
    let items = slug === 'best-seller' 
      ? bestSellers 
      : products.filter(p => p.categoria === slug);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        p => p.nombre.toLowerCase().includes(query) || 
             p.descripcion_corta?.toLowerCase().includes(query) ||
             p.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return items;
  }, [slug, products, bestSellers, searchQuery]);

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader 
        currency={currency} 
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
      
      <div className="container px-4 py-6">
        {/* Back button and title */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-black text-foreground">
              {categoryInfo.title}
            </h1>
            {categoryInfo.subtitle && (
              <p className="text-muted-foreground text-sm mt-1">
                {categoryInfo.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Search within category */}
        <div className="mb-6">
          <SearchBar 
            value={searchQuery} 
            onChange={setSearchQuery}
            placeholder={`Buscar en ${categoryInfo.title}...`}
          />
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-lg" />
            ))}
          </div>
        ) : categoryProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              {searchQuery ? 'No encontramos coincidencias.' : 'No hay productos en esta categoría.'}
            </p>
            <Button variant="outline" asChild className="mt-4">
              <Link to="/">Volver al menú</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoryProducts.map(item => (
              <MenuCard 
                key={item.id} 
                item={item} 
                currency={currency}
                displayMode={displayMode}
              />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
      
      <StickyActionBar 
        currency={currency}
        onCurrencyToggle={toggleCurrency}
        displayMode={displayMode}
      />
    </div>
  );
};

export default CategoryPage;
