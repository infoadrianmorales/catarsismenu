import { Currency } from '@/types/menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { PriceDisplayMode } from '@/hooks/useCurrency';

interface MenuHeaderProps {
  currency: Currency;
  onCurrencyToggle: () => void;
  displayMode?: PriceDisplayMode;
}

export const MenuHeader = ({ currency, onCurrencyToggle, displayMode = 'ambas' }: MenuHeaderProps) => {
  // Only show currency toggle if display mode is 'ambas'
  const showCurrencyToggle = displayMode === 'ambas';

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border/50">
      <div className="container px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="font-display text-xl md:text-2xl font-black text-primary">
            CATARSIS
          </span>
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
      </div>
    </header>
  );
};
