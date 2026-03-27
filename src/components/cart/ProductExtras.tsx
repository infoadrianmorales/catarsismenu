// FEATURE [EXTRAS]: Componente de selección de extras para un producto del carrito.
// Muestra checkboxes con nombre y precio de cada extra disponible.
// Los extras seleccionados se sincronizan con CartContext.

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ProductExtra } from '@/hooks/useProductExtras';
import { useCurrency } from '@/hooks/useCurrency';
import { Plus } from 'lucide-react';

interface SelectedExtra {
  extraId: string;
  nombre: string;
  precio_usd: number;
}

interface ProductExtrasProps {
  extras: ProductExtra[];
  selectedExtras: SelectedExtra[];
  onToggleExtra: (extra: ProductExtra) => void;
  compact?: boolean;
}

export const ProductExtras = ({ extras, selectedExtras, onToggleExtra, compact = false }: ProductExtrasProps) => {
  const { currency, displayMode, getPrices } = useCurrency();

  if (extras.length === 0) return null;

  const formatPrice = (priceUsd: number) => {
    const p = getPrices(priceUsd);
    if (displayMode === 'solo_usd') return p.formattedUSD;
    if (displayMode === 'solo_ves') return p.formattedVES;
    return currency === 'USD' ? p.formattedUSD : p.formattedVES;
  };

  const isSelected = (extraId: string) =>
    selectedExtras.some(e => e.extraId === extraId);

  return (
    <div className={`${compact ? 'mt-1.5' : 'mt-2'} space-y-1.5`}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Plus className="h-3 w-3" />
        <span className="font-medium">Agregar extras</span>
      </div>
      <div className={`grid ${compact ? 'gap-1' : 'gap-1.5'}`}>
        {extras.map(extra => (
          <label
            key={extra.id}
            className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 cursor-pointer transition-colors
              ${isSelected(extra.id)
                ? 'border-secondary bg-secondary/10 text-foreground'
                : 'border-border/50 hover:border-border text-muted-foreground hover:text-foreground'
              }`}
          >
            <Checkbox
              checked={isSelected(extra.id)}
              onCheckedChange={() => onToggleExtra(extra)}
              className="h-3.5 w-3.5"
            />
            <span className={`flex-1 ${compact ? 'text-[11px]' : 'text-xs'}`}>
              {extra.nombre}
            </span>
            <span className={`font-medium text-secondary ${compact ? 'text-[11px]' : 'text-xs'}`}>
              +{formatPrice(extra.precio_usd)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
