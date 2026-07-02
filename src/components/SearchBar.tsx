import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trackSearch } from '@/lib/metaPixel';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * SearchBar — variante "Borde inclinado":
 * Botón Buscar integrado a la izquierda con cuchilla raspberry inclinada, top-border
 * xanthous, noise overlay y glow raspberry pulsante al enfocar. Submit (click o Enter)
 * dispara evento Search en Meta Pixel.
 */
export const SearchBar = ({
  value,
  onChange,
  placeholder = 'Buscar por nombre o ingrediente…',
}: SearchBarProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Se dispara tanto por click en el botón como por Enter en el input
    trackSearch(value.trim() || 'buscar_click');
  };

  return (
    <div className="container px-4 py-4 sm:py-6">
      <div className="relative max-w-2xl mx-auto group">
        {/* Glow raspberry ambiente + pulsante en focus */}
        <div
          className="absolute -inset-1.5 bg-primary rounded-full blur-2xl opacity-20 group-hover:opacity-40 group-focus-within:opacity-50 group-focus-within:animate-pulse transition-opacity duration-500 pointer-events-none"
          aria-hidden
        />

        <form
          onSubmit={handleSubmit}
          role="search"
          className="relative flex items-center h-12 sm:h-14 w-full bg-background border border-border/60 ring-1 ring-white/5 rounded-full shadow-2xl overflow-hidden"
        >
          {/* Noise overlay SVG turbulence */}
          <svg
            aria-hidden
            className="absolute inset-0 w-full h-full opacity-[0.04] mix-blend-overlay pointer-events-none"
          >
            <filter id="searchbar-noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#searchbar-noise)" />
          </svg>

          {/* Botón Buscar (izquierda) — dispara evento Meta Pixel */}
          <button
            id="search-submit-btn"
            data-meta-event="Search"
            type="submit"
            aria-label="Buscar productos"
            className="relative z-10 h-full flex items-center gap-2 sm:gap-3 pl-4 pr-5 sm:pl-6 sm:pr-8 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            {/* Top-border xanthous */}
            <span
              aria-hidden
              className="absolute top-0 left-0 right-0 h-[2px] bg-secondary/70"
            />
            <Search className="h-[18px] w-[18px] sm:h-5 sm:w-5" strokeWidth={2.5} />
            <span className="hidden sm:inline font-heading uppercase font-bold tracking-[0.15em] text-sm">
              Buscar
            </span>
            {/* Cuchilla inclinada fusionada */}
            <span
              aria-hidden
              className="absolute top-0 -right-4 h-full w-8 bg-primary -skew-x-12 z-0"
            />
          </button>

          {/* Input */}
          <input
            id="search-bar"
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="relative z-10 flex-1 min-w-0 h-full pl-4 sm:pl-8 pr-2 sm:pr-4 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm sm:text-base font-body"
          />

          {/* Botón limpiar (aparece con contenido) */}
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange('')}
              className="relative z-10 mr-2 h-8 w-8 sm:h-9 sm:w-9 shrink-0 text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-full"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          )}

          {/* Detalle xanthous decorativo derecha (solo si input vacío) */}
          {!value && (
            <span
              aria-hidden
              className="relative z-10 mr-4 sm:mr-6 w-1 h-4 bg-secondary/40 rounded-full shrink-0"
            />
          )}
        </form>
      </div>
    </div>
  );
};
