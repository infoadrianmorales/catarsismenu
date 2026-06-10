// [2026-04-08] SOURCE TRACKING: Acepta prop `source` y lo pasa a AddToCartButton.
// [2026-06-10] PIXEL: dispara ViewContent en hover/touch sostenido (1 vez por
// producto/sesión via Set global), reemplazando el atributo data-meta-event que no
// hacía nada por sí solo.
import { useRef } from 'react';
import { MenuItem, Currency } from '@/types/menu';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrency, PriceDisplayMode } from '@/hooks/useCurrency';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { useViewMode } from '@/contexts/ViewModeContext';
import { ExpandableText } from '@/components/ExpandableText';
import { CartItemSource } from '@/contexts/CartContext';
import { trackViewContent } from '@/lib/metaPixel';

// Set global para deduplicar ViewContent por sesión
const viewedProductIds = new Set<string>();

interface MenuCardProps {
  item: MenuItem;
  currency: Currency;
  displayMode?: PriceDisplayMode;
  source?: CartItemSource;
}

export const MenuCard = ({ item, currency, displayMode = 'ambas', source = 'menu' }: MenuCardProps) => {
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
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerViewContent = () => {
    if (viewedProductIds.has(item.id)) return;
    viewedProductIds.add(item.id);
    trackViewContent({
      id: item.id,
      nombre: item.nombre,
      categoria: item.categoria,
      precio_usd: item.precio_usd,
    });
  };

  const handleEnter = () => {
    // Precarga la imagen
    const img = new Image();
    img.src = item.imagen;
    // ViewContent solo si el hover persiste 600ms (intención real)
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(triggerViewContent, 600);
  };

  const handleLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
  };

  return (
    <Card className="group h-full flex flex-col overflow-hidden border-border/40 bg-card hover:border-primary/50 transition-all duration-200 hover:shadow-glow hover:-translate-y-1" data-meta-event="ViewContent" id={`product-card-${item.id}`} onMouseEnter={handleEnter} onMouseLeave={handleLeave} onTouchStart={handleEnter}>
      <CardContent className="p-0 flex flex-col flex-1">
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
        
        {/* Content — flex column full height para empujar CTA al fondo */}
        <div className="p-4 pt-2 flex flex-col flex-1 space-y-3">
          <div className="space-y-1">
            {/* [2026-06-05] ALINEACIÓN: line-clamp-2 + min-h reserva 2 líneas siempre para igualar altura entre tarjetas */}
            <h3 className="font-display text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]">
              {item.nombre}
            </h3>
            <ExpandableText 
              text={item.descripcion_corta || ''} 
              maxLines={2} 
              className="text-sm"
            />
          </div>
          
          {/* Precio + CTA: mt-auto los clava al fondo para simetría entre tarjetas */}
          <div className="mt-auto flex flex-col gap-3">
            {renderPrices()}
            {!isLocalMode && <AddToCartButton product={item} variant="default" source={source} />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

