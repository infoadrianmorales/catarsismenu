import { Currency } from '@/types/menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface CurrencyToggleProps {
  currency: Currency;
  onToggle: () => void;
}

export const CurrencyToggle = ({ currency, onToggle }: CurrencyToggleProps) => {
  return (
    <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/20">
      <Label 
        htmlFor="currency-toggle" 
        className={`text-sm font-medium transition-colors ${
          currency === 'USD' ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        USD $
      </Label>
      <Switch
        id="currency-toggle"
        checked={currency === 'VES'}
        onCheckedChange={onToggle}
        className="data-[state=checked]:bg-accent"
      />
      <Label 
        htmlFor="currency-toggle" 
        className={`text-sm font-medium transition-colors ${
          currency === 'VES' ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        VES Bs
      </Label>
    </div>
  );
};
