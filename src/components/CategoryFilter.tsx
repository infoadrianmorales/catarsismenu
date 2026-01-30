import { MenuCategory } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  UtensilsCrossed, 
  Beef, 
  Sandwich, 
  Pizza, 
  Flame, 
  Salad, 
  Wine, 
  Cake,
  LayoutGrid,
  TrendingUp
} from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: MenuCategory;
  onCategoryChange: (category: MenuCategory) => void;
}

interface CategoryOption {
  id: MenuCategory;
  label: string;
  icon: React.ReactNode;
}

const categories: CategoryOption[] = [
  { id: 'todos', label: 'Todos', icon: <LayoutGrid className="h-4 w-4" /> },
  { id: 'best-seller', label: 'Best Seller', icon: <TrendingUp className="h-4 w-4" /> },
  { id: 'entradas', label: 'Entradas', icon: <UtensilsCrossed className="h-4 w-4" /> },
  { id: 'hamburguesas', label: 'Hamburguesas', icon: <Sandwich className="h-4 w-4" /> },
  { id: 'emparedados', label: 'Emparedados', icon: <Sandwich className="h-4 w-4" /> },
  { id: 'pizzas', label: 'Pizzas', icon: <Pizza className="h-4 w-4" /> },
  { id: 'parrilla', label: 'Parrilla', icon: <Flame className="h-4 w-4" /> },
  { id: 'ensaladas', label: 'Ensaladas', icon: <Salad className="h-4 w-4" /> },
  { id: 'cocteleria', label: 'Coctelería', icon: <Wine className="h-4 w-4" /> },
  { id: 'postres', label: 'Postres', icon: <Cake className="h-4 w-4" /> },
];

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 py-3">
      <div className="container px-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className={`
                  flex-shrink-0 gap-2 rounded-full transition-all duration-200
                  ${selectedCategory === category.id 
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow' 
                    : 'bg-card border-border/50 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary'
                  }
                `}
              >
                {category.icon}
                {category.label}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    </div>
  );
};
