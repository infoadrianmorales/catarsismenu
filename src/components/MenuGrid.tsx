import { MenuItem, Currency, MenuCategory } from '@/types/menu';
import { MenuCard } from './MenuCard';

interface MenuGridProps {
  items: MenuItem[];
  currency: Currency;
  exchangeRate: number;
  selectedCategory: MenuCategory;
}

const categoryTitles: Record<Exclude<MenuCategory, 'todos'>, { title: string; subtitle: string }> = {
  burgers: {
    title: 'Burgers Gourmet',
    subtitle: 'Nuestras hamburguesas gourmet son jugosas y sabrosas. Ingredientes frescos combinados a la perfección.',
  },
  pizzas: {
    title: 'Pizzas Artesanales',
    subtitle: 'Masa artesanal horneada a la perfección con ingredientes de primera calidad.',
  },
  cocktails: {
    title: 'Cocktails Premium',
    subtitle: 'Combinaciones únicas y refrescantes que te transportan a otro nivel.',
  },
  entradas: {
    title: 'Entradas & Aperitivos',
    subtitle: 'El comienzo perfecto para una experiencia gastronómica inolvidable.',
  },
};

export const MenuGrid = ({ items, currency, exchangeRate, selectedCategory }: MenuGridProps) => {
  const filteredItems = selectedCategory === 'todos' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  const groupedItems = selectedCategory === 'todos'
    ? {
        burgers: items.filter(i => i.category === 'burgers'),
        pizzas: items.filter(i => i.category === 'pizzas'),
        cocktails: items.filter(i => i.category === 'cocktails'),
        entradas: items.filter(i => i.category === 'entradas'),
      }
    : null;

  if (selectedCategory !== 'todos') {
    const categoryInfo = categoryTitles[selectedCategory];
    return (
      <section className="container px-4 py-12">
        <div className="mb-8 space-y-2">
          <h2 className="text-3xl md:text-4xl font-display font-black text-foreground">
            {categoryInfo.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            {categoryInfo.subtitle}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <MenuCard 
              key={item.id} 
              item={item} 
              currency={currency} 
              exchangeRate={exchangeRate}
            />
          ))}
        </div>
      </section>
    );
  }

  // Show all categories with sections
  return (
    <div className="space-y-16 py-12">
      {groupedItems && Object.entries(groupedItems).map(([category, items]) => {
        if (items.length === 0) return null;
        const categoryInfo = categoryTitles[category as Exclude<MenuCategory, 'todos'>];
        
        return (
          <section key={category} className="container px-4">
            <div className="mb-8 space-y-2">
              <h2 className="text-3xl md:text-4xl font-display font-black text-foreground">
                {categoryInfo.title}
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                {categoryInfo.subtitle}
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map(item => (
                <MenuCard 
                  key={item.id} 
                  item={item} 
                  currency={currency} 
                  exchangeRate={exchangeRate}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
