import { MenuCategory } from '@/types/menu';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicCategories } from '@/hooks/usePublicCategories';

interface CategoryFilterProps {
  selectedCategory: MenuCategory;
  onCategoryChange: (category: MenuCategory) => void;
}

export const CategoryFilter = ({ selectedCategory, onCategoryChange }: CategoryFilterProps) => {
  const { categories, loading } = usePublicCategories();

  if (loading) {
    return (
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 py-3">
        <div className="container px-4">
          <div className="flex gap-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50 py-3">
      <div className="container px-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.slug ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onCategoryChange(category.slug)}
                  className={`
                    flex-shrink-0 gap-2 rounded-full transition-all duration-200
                    ${selectedCategory === category.slug 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow' 
                      : 'bg-card border-border/50 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary'
                    }
                  `}
                >
                  <IconComponent className="h-4 w-4" />
                  {category.nombre}
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="invisible" />
        </ScrollArea>
      </div>
    </div>
  );
};
