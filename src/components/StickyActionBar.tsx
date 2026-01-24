import { Currency } from '@/types/menu';
import { appConfig } from '@/data/config';
import { MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PriceDisplayMode } from '@/hooks/useCurrency';
import { CartDrawer } from '@/components/cart/CartDrawer';

interface StickyActionBarProps {
  currency: Currency;
  onCurrencyToggle: () => void;
  displayMode?: PriceDisplayMode;
}

export const StickyActionBar = ({ currency, onCurrencyToggle, displayMode = 'ambas' }: StickyActionBarProps) => {
  const showCurrencyToggle = displayMode === 'ambas';

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola, vengo del menú web de Catarsis. Quiero hacer un pedido.');
    window.open(`https://wa.me/${appConfig.whatsapp}?text=${message}`, '_blank');
    
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
            <Button
              size="sm"
              variant="ghost"
              onClick={handleShare}
              className="h-9 w-9 p-0"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            
            {/* Cart Drawer - Prominent in mobile */}
            <CartDrawer variant="sticky" />
            
            <Button
              size="sm"
              onClick={handleWhatsAppClick}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Pedir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
