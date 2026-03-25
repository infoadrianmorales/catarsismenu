import { MenuItem, Currency } from '@/types/menu';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrency, PriceDisplayMode } from '@/hooks/useCurrency';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { useViewMode } from '@/contexts/ViewModeContext';
import { ExpandableText } from '@/components/ExpandableText';

interface MenuCardProps {
  item: MenuItem;
  currency: Currency;
  displayMode?: PriceDisplayMode;
}

export const MenuCard = ({ item, currency, displayMode = 'ambas' }: MenuCardProps) => {
  const { isLocalMode } = useViewMode();
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

  /* OPTIMIZACIÓN DE PERFORMANCE — MenuCard
     Cambios aplicados:
     - width y height para evitar saltos de layout (CLS)
     - alt descriptivo con marca para SEO
     CLS (Cumulative Layout Shift): cuando una imagen carga
     tarde y empuja el contenido hacia abajo — afecta la
     experiencia del usuario y el score de Google PageSpeed. */
  return (
    <Card className="group overflow-hidden border-border/40 bg-card hover:border-primary/50 transition-all duration-200 hover:shadow-glow hover:-translate-y-1" data-meta-event="ViewContent" id={`product-card-${item.id}`} onMouseEnter={() => { const img = new Image(); img.src = item.imagen; }} onTouchStart={() => { const img = new Image(); img.src = item.imagen; }}>
      <CardContent className="p-0">
        {/* White-background image container - zoom only on desktop */}
        <div className="relative p-1.5 sm:p-2">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-white border border-foreground/10 shadow-md sm:transition-transform sm:duration-300 sm:ease-out sm:group-hover:scale-105">
            <img 
              src={item.imagen} 
              alt={`${item.nombre} — Catarsis Drinks & Food, Lechería`}
              loading="lazy"
              width="400"
              height="400"
              className="h-full w-full object-cover p-1.5 sm:p-2"
            />
            {/* LAZY: Esta imagen está fuera de la pantalla inicial.
                Se carga solo cuando el usuario hace scroll hasta ella. */}
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 pt-2 space-y-3">
          <div className="space-y-1">
            <h3 className="font-display text-lg font-bold leading-tight group-hover:text-primary transition-colors">
              {item.nombre}
            </h3>
            <ExpandableText 
              text={item.descripcion_corta || ''} 
              maxLines={2} 
              className="text-sm"
            />
          </div>
          
          {/* Prices and Add to Cart */}
          <div className="flex items-center justify-between gap-2">
            {renderPrices()}
            {!isLocalMode && <AddToCartButton product={item} variant="compact" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
