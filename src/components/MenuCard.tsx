import { MenuItem, Currency } from '@/types/menu';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrency, PriceDisplayMode } from '@/hooks/useCurrency';

interface MenuCardProps {
  item: MenuItem;
  currency: Currency;
  displayMode?: PriceDisplayMode;
}

export const MenuCard = ({ item, currency, displayMode = 'ambas' }: MenuCardProps) => {
  const { getPrices } = useCurrency();
  const prices = getPrices(item.precio_usd);

  const renderPrices = () => {
    if (displayMode === 'solo_usd') {
      return (
        <span className="text-xl font-display font-black text-secondary">
          {prices.formattedUSD}
        </span>
      );
    }
    
    if (displayMode === 'solo_ves') {
      return (
        <span className="text-xl font-display font-black text-secondary">
          {prices.formattedVES}
        </span>
      );
    }
    
    // Display mode: ambas
    return (
      <div className="flex flex-col">
        <span className={`text-xl font-display font-black ${currency === 'USD' ? 'text-secondary' : 'text-muted-foreground text-sm'}`}>
          {prices.formattedUSD}
        </span>
        <span className={`text-sm ${currency === 'VES' ? 'text-secondary font-bold' : 'text-muted-foreground'}`}>
          {prices.formattedVES}
        </span>
      </div>
    );
  };

  return (
    <Card className="group overflow-hidden border-border/40 bg-card hover:border-primary/50 transition-all duration-200 hover:shadow-glow hover:-translate-y-1">
      <CardContent className="p-0">
        {/* White-background image container */}
        <div className="relative p-2">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-white border border-foreground/10 shadow-md">
            <img 
              src={item.imagen} 
              alt={`Foto de ${item.nombre} sobre fondo blanco`}
              loading="lazy"
              className="h-full w-full object-cover p-2"
            />
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 pt-2 space-y-3">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold leading-tight group-hover:text-primary transition-colors">
              {item.nombre}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {item.descripcion_corta}
            </p>
          </div>
          
          {/* Prices */}
          <div className="flex items-center justify-between gap-2">
            {renderPrices()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
