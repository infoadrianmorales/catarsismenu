import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { trackSearch } from '@/lib/metaPixel';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = '🔍 Buscar por nombre o ingrediente…' }: SearchBarProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      trackSearch(value);
    }
  };

  return (
    <div className="container px-4 py-8">
      <form onSubmit={handleSubmit} role="search" className="relative max-w-2xl mx-auto">
        {/* Glow effect background */}
        <div className="absolute inset-0 bg-secondary/40 rounded-full blur-xl" />
        
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary pointer-events-none" />
          <Input
            id="search-bar"
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pl-12 pr-24 h-14 bg-card/80 backdrop-blur-sm border-2 border-primary/30 focus:border-primary text-foreground text-lg placeholder:text-muted-foreground rounded-full shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {value && (
              <>
                {/* ACCESIBILIDAD [ARIA]: aria-labels en botones de búsqueda */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onChange('')}
                  className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-full"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-5 w-5" />
                </Button>
                <Button
                  id="search-submit-btn"
                  data-meta-event="Search"
                  type="submit"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                  aria-label="Buscar productos"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
