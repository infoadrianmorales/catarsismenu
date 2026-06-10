import { Currency } from '@/types/menu';
import { appConfig } from '@/data/config';
import { MessageCircle, Share2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PriceDisplayMode } from '@/hooks/useCurrency';
import { trackContact, trackLead } from '@/lib/metaPixel';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface StickyActionBarProps {
  currency: Currency;
  onCurrencyToggle: () => void;
  displayMode?: PriceDisplayMode;
}

export const StickyActionBar = ({ currency, onCurrencyToggle, displayMode = 'ambas' }: StickyActionBarProps) => {
  const showCurrencyToggle = displayMode === 'ambas';
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola, vengo del menú web de Catarsis. Quiero hacer un pedido.');
    window.open(`https://wa.me/${appConfig.whatsapp}?text=${message}`, '_blank');
    
    trackContact('sticky_bar');
    trackLead('sticky_bar');
    window.dispatchEvent(new CustomEvent('analytics', {
      detail: { event: 'click_whatsapp', source: 'sticky_bar' }
    }));
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Catarsis — Drinks & Food',
      text: 'Mira el menú de Catarsis: burgers, pizzas, cocteles y más.',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
      
      window.dispatchEvent(new CustomEvent('analytics', {
        detail: { event: 'share_menu', currency }
      }));
    } catch (err) {
      console.log('Share failed:', err);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-card/95 backdrop-blur-md border-t border-border/50 px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between gap-3">
          {/* Currency Toggle or Label */}
          {showCurrencyToggle ? (
            <div className="flex items-center gap-2">
              <Label 
                htmlFor="currency-mobile" 
                className={`text-xs font-medium ${currency === 'USD' ? 'text-secondary' : 'text-muted-foreground'}`}
              >
                USD
              </Label>
              <Switch
                id="currency-mobile"
                checked={currency === 'VES'}
                onCheckedChange={onCurrencyToggle}
                className="data-[state=checked]:bg-secondary"
              />
              <Label 
                htmlFor="currency-mobile" 
                className={`text-xs font-medium ${currency === 'VES' ? 'text-secondary' : 'text-muted-foreground'}`}
              >
                VES
              </Label>
            </div>
          ) : (
            <span className="text-xs font-medium text-secondary">
              {displayMode === 'solo_usd' ? 'USD' : 'Bs'}
            </span>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* ACCESIBILIDAD [ARIA]: aria-label en botón de compartir para lectores de pantalla. */}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              className="h-9 w-9 p-0"
              data-meta-event="Share"
              id="sticky-share-btn"
              aria-label="Compartir menú"
            >
              <Share2 className="h-5 w-5" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={handleWhatsAppClick}
              className="h-9 w-9 p-0 text-muted-foreground"
              data-meta-event="Contact"
              id="sticky-whatsapp-btn"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              onClick={() => navigate(totalItems > 0 ? '/carrito' : '/')}
              className={cn(
                "font-bold gap-2 relative",
                totalItems > 0
                  ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
              data-meta-event="ViewCart"
              id="sticky-cart-btn"
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 ? (
                <>
                  Carrito
                  <Badge className="h-5 min-w-5 flex items-center justify-center p-0 px-1 text-[10px] bg-primary text-primary-foreground">
                    {totalItems}
                  </Badge>
                </>
              ) : (
                <span>Menú</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
