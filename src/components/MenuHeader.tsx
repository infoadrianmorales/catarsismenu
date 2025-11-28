import { Currency } from '@/types/menu';
import { CurrencyToggle } from './CurrencyToggle';

interface MenuHeaderProps {
  currency: Currency;
  onCurrencyToggle: () => void;
}

export const MenuHeader = ({ currency, onCurrencyToggle }: MenuHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-display font-bold tracking-tight">
            <span className="text-primary">CATARSIS</span>
            <span className="text-foreground text-lg ml-2">Drinks & Food</span>
          </h1>
        </div>
        
        <CurrencyToggle currency={currency} onToggle={onCurrencyToggle} />
      </div>
    </header>
  );
};
