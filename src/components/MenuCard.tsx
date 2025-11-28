import { MenuItem, Currency } from '@/types/menu';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MenuCardProps {
  item: MenuItem;
  currency: Currency;
  exchangeRate: number;
}

export const MenuCard = ({ item, currency, exchangeRate }: MenuCardProps) => {
  const displayPrice = currency === 'USD' 
    ? item.priceUSD.toFixed(2)
    : (item.priceUSD * exchangeRate).toFixed(2);
  
  const currencySymbol = currency === 'USD' ? '$' : 'Bs';

  return (
    <Card className="group overflow-hidden border-border/40 bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-glow hover:-translate-y-1">
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {item.featured && (
            <Badge className="absolute top-3 right-3 bg-secondary text-secondary-foreground font-bold">
              Destacado
            </Badge>
          )}
        </div>
        
        {/* Content */}
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-xl font-bold leading-tight group-hover:text-primary transition-colors">
              {item.name}
            </h3>
            <span className="text-2xl font-display font-black text-secondary whitespace-nowrap">
              {currencySymbol}{displayPrice}
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {item.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
