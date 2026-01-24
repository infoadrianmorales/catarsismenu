import { Link } from 'react-router-dom';
import { MenuItem, Currency } from '@/types/menu';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrency, PriceDisplayMode } from '@/hooks/useCurrency';
import { AddToCartButton } from '@/components/cart/AddToCartButton';

interface CompactProductCardProps {
  item: MenuItem;
  currency: Currency;
  displayMode?: PriceDisplayMode;
}

export const CompactProductCard = ({ item, currency, displayMode = 'ambas' }: CompactProductCardProps) => {
  const { getPrices } = useCurrency();
  const prices = getPrices(item.precio_usd);

  const renderPrice = () => {
    if (displayMode === 'solo_usd') {
      return <span className="text-base font-display font-bold text-secondary">{prices.formattedUSD}</span>;
    }
    if (displayMode === 'solo_ves') {
      return <span className="text-base font-display font-bold text-secondary">{prices.formattedVES}</span>;
    }
    return (
      <div className="flex flex-col">
        <span className={`text-base font-display font-bold ${currency === 'USD' ? 'text-secondary' : 'text-muted-foreground text-xs'}`}>
          {prices.formattedUSD}
        </span>
        <span className={`text-xs ${currency === 'VES' ? 'text-secondary font-semibold' : 'text-muted-foreground'}`}>
          {prices.formattedVES}
        </span>
      </div>
    );
  };

  return (
    <Card className="group overflow-hidden border-border/40 bg-card hover:border-primary/50 transition-all duration-200 hover:shadow-glow h-full flex flex-col">
      <CardContent className="p-0 flex flex-col h-full">
        {/* Image - Clickable to product detail */}
        <Link to={`/producto/${item.slug}`} className="block shrink-0">
          <div className="relative p-1 sm:p-1.5">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-white border border-foreground/10 shadow-sm">
              <img 
                src={item.imagen} 
                alt={`Foto de ${item.nombre}`}
                loading="lazy"
                className="h-full w-full object-cover p-1 sm:p-1.5 transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-105"
              />
            </div>
          </div>
        </Link>
        
        {/* Content */}
        <div className="p-2.5 pt-1.5 flex flex-col flex-1">
          <Link to={`/producto/${item.slug}`} className="block mb-1">
            <h3 className="font-display text-sm font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 whitespace-normal min-h-[2.5rem]">
              {item.nombre}
            </h3>
          </Link>
          
          {item.descripcion_corta && (
            <p className="text-xs text-muted-foreground line-clamp-2 whitespace-normal mb-2 leading-relaxed">
              {item.descripcion_corta}
            </p>
          )}
          
          <div className="mt-auto flex items-end justify-between gap-1 pt-1">
            {renderPrice()}
            <AddToCartButton product={item} variant="icon" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
