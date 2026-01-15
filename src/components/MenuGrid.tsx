import { MenuItem, Currency, MenuCategory } from '@/types/menu';
import { MenuCard } from './MenuCard';
import { PriceDisplayMode } from '@/hooks/useCurrency';

interface MenuGridProps {
  items: MenuItem[];
  currency: Currency;
  selectedCategory: MenuCategory;
  displayMode?: PriceDisplayMode;
}

const categoryTitles: Record<Exclude<MenuCategory, 'todos'>, { title: string; subtitle: string }> = {
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
};

export const MenuGrid = ({ items, currency, selectedCategory, displayMode = 'ambas' }: MenuGridProps) => {
  const filteredItems = selectedCategory === 'todos' 
    ? items 
    : items.filter(item => item.categoria === selectedCategory);

  const groupedItems = selectedCategory === 'todos'
    ? {
        entradas: items.filter(i => i.categoria === 'entradas'),
        hamburguesas: items.filter(i => i.categoria === 'hamburguesas'),
        emparedados: items.filter(i => i.categoria === 'emparedados'),
        pizzas: items.filter(i => i.categoria === 'pizzas'),
        parrilla: items.filter(i => i.categoria === 'parrilla'),
        ensaladas: items.filter(i => i.categoria === 'ensaladas'),
        cocteleria: items.filter(i => i.categoria === 'cocteleria'),
        postres: items.filter(i => i.categoria === 'postres'),
      }
    : null;

  // Empty state
  if (filteredItems.length === 0) {
    return (
      <section className="container px-4 py-16 text-center">
        <p className="text-muted-foreground text-lg">
          No encontramos coincidencias. Prueba otro término o cambia de categoría.
        </p>
      </section>
    );
  }

  if (selectedCategory !== 'todos') {
    const categoryInfo = categoryTitles[selectedCategory];
    return (
      <section className="container px-4 py-8">
        <div className="mb-6 space-y-1">
          <h2 className="text-2xl md:text-3xl font-display font-black text-foreground">
            {categoryInfo.title}
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
            {categoryInfo.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map(item => (
            <MenuCard 
              key={item.id} 
              item={item} 
              currency={currency}
              displayMode={displayMode}
            />
          ))}
        </div>
      </section>
    );
  }

  // Show all categories with sections
  return (
    <div className="space-y-12 py-8">
      {groupedItems && Object.entries(groupedItems).map(([category, categoryItems]) => {
        if (categoryItems.length === 0) return null;
        const categoryInfo = categoryTitles[category as Exclude<MenuCategory, 'todos'>];
        
        return (
          <section key={category} id={category} className="container px-4 scroll-mt-32">
            <div className="mb-6 space-y-1">
              <h2 className="text-2xl md:text-3xl font-display font-black text-foreground">
                {categoryInfo.title}
              </h2>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
                {categoryInfo.subtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryItems.map(item => (
                <MenuCard 
                  key={item.id} 
                  item={item} 
                  currency={currency}
                  displayMode={displayMode}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
