import { MenuCategory } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryFilterProps {
  selectedCategory: MenuCategory;
  onCategoryChange: (category: MenuCategory) => void;
}

const categories: { value: MenuCategory; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'burgers', label: 'Burgers' },
  { value: 'pizzas', label: 'Pizzas' },
  { value: 'cocktails', label: 'Cocktails' },
  { value: 'entradas', label: 'Entradas' },
];

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  return (
    <div className="w-full border-y border-border/40 bg-card/50 backdrop-blur-sm">
      <ScrollArea className="w-full">
        <div className="container flex gap-2 px-4 py-4">
          {categories.map((category) => (
            <Button
              key={category.value}
              variant={selectedCategory === category.value ? 'default' : 'outline'}
              onClick={() => onCategoryChange(category.value)}
              className={`
                whitespace-nowrap rounded-full px-6 py-2 font-medium transition-all
                ${selectedCategory === category.value 
                  ? 'bg-primary text-primary-foreground shadow-glow scale-105' 
                  : 'hover:bg-primary/10 hover:border-primary/50'
                }
              `}
            >
              {category.label}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
