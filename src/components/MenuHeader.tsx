import { Currency } from '@/types/menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PriceDisplayMode } from '@/hooks/useCurrency';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useViewMode } from '@/contexts/ViewModeContext';
import { MessageCircle, Instagram, MapPin } from 'lucide-react';
import { appConfig } from '@/data/config';
import { trackContact } from '@/lib/metaPixel';
import logoCatarsis from '@/assets/logo-catarsis.png';

interface MenuHeaderProps {
  currency: Currency;
  onCurrencyToggle: () => void;
  displayMode?: PriceDisplayMode;
}

export const MenuHeader = ({ currency, onCurrencyToggle, displayMode = 'ambas' }: MenuHeaderProps) => {
  const { isLocalMode } = useViewMode();
  // Only show currency toggle if display mode is 'ambas'
  const showCurrencyToggle = displayMode === 'ambas';

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src={logoCatarsis} 
            alt="Catarsis" 
            className="h-10 md:h-14 w-auto"
          />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Mobile CTA Icons */}
          <div className="flex md:hidden items-center gap-1">
            {!isLocalMode && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10"
                onClick={() => {
                  const message = encodeURIComponent('Hola, vengo del menú web de Catarsis. Quiero hacer un pedido.');
                  window.open(`https://wa.me/${appConfig.whatsapp}?text=${message}`, '_blank');
                  trackContact('header');
                }}
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              asChild
            >
              <a href={appConfig.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            </Button>
            {!isLocalMode && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                asChild
              >
                <a href={appConfig.maps_url} target="_blank" rel="noopener noreferrer" aria-label="Ubicación">
                  <MapPin className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>

          {/* Currency Toggle - Hidden on mobile (shown in sticky bar) */}
          {showCurrencyToggle && (
            <div className="hidden md:flex items-center gap-3 bg-card/50 rounded-full px-4 py-2 border border-border/50">
              <Label 
                htmlFor="currency-desktop" 
                className={`text-sm font-medium cursor-pointer transition-colors ${
                  currency === 'USD' ? 'text-secondary' : 'text-muted-foreground'
                }`}
              >
                USD
              </Label>
              <Switch
                id="currency-desktop"
                checked={currency === 'VES'}
                onCheckedChange={onCurrencyToggle}
                className="data-[state=checked]:bg-secondary"
              />
              <Label 
                htmlFor="currency-desktop" 
                className={`text-sm font-medium cursor-pointer transition-colors ${
                  currency === 'VES' ? 'text-secondary' : 'text-muted-foreground'
                }`}
              >
                VES
              </Label>
            </div>
          )}

          {/* Show current currency label when not toggleable */}
          {!showCurrencyToggle && (
            <div className="hidden md:flex items-center bg-card/50 rounded-full px-4 py-2 border border-border/50">
              <span className="text-sm font-medium text-secondary">
                {displayMode === 'solo_usd' ? 'Precios en USD' : 'Precios en Bs'}
              </span>
            </div>
          )}

          {/* Cart Drawer - hidden in local mode */}
          {!isLocalMode && <CartDrawer />}
        </div>
      </div>
    </header>
  );
};
