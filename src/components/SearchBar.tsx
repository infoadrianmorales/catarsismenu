import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { trackSearch } from '@/lib/metaPixel';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * SearchBar con toggle animado.
 * Estado inicial = botón lupa redondo. Click → dispara evento Search en Meta
 * y despliega con animación slide la barra de búsqueda completa.
 * Colapsa automáticamente al perder foco si el input está vacío.
 */
export const SearchBar = ({ value, onChange, placeholder = '🔍 Buscar por nombre o ingrediente…' }: SearchBarProps) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Si hay contenido (p.ej. query recargada por URL), mantener abierto
  useEffect(() => {
    if (value) setOpen(true);
  }, [value]);

  const handleOpen = () => {
    setOpen(true);
    // Meta Pixel: intención de búsqueda al abrir el buscador (validación de evento)
    trackSearch('abrir_buscador');
    // autofocus con delay para dejar terminar la animación
    setTimeout(() => inputRef.current?.focus(), 320);
  };

  const handleClose = () => {
    onChange('');
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) trackSearch(value);
  };

  const handleBlur = () => {
    // colapsar sólo si está vacío
    if (!value.trim()) setOpen(false);
  };

  return (
    <div className="container px-4 py-8">
      <div className="max-w-2xl mx-auto flex justify-center">
        {/* Wrapper con ancho animado */}
        <div
          className={`relative transition-all duration-500 ease-out ${
            open ? 'w-full' : 'w-auto'
          }`}
        >
          {/* Glow */}
          <div
            className={`absolute inset-0 bg-secondary/40 rounded-full blur-xl transition-opacity duration-500 ${
              open ? 'opacity-100' : 'opacity-70'
            }`}
          />

          {!open ? (
            // Estado colapsado: píldora Buscar (lupa + label)
            <Button
              type="button"
              onClick={handleOpen}
              aria-label="Abrir buscador"
              aria-expanded={false}
              id="search-toggle-btn"
              data-meta-event="Search"
              className="group relative h-14 min-w-[220px] sm:min-w-[280px] px-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Search className="h-6 w-6 transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-heading uppercase text-lg tracking-wider">Buscar</span>
            </Button>
          ) : (
            // Estado abierto: barra completa
            <form
              onSubmit={handleSubmit}
              role="search"
              className="relative animate-in fade-in slide-in-from-left-4 duration-300"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-primary pointer-events-none" />
                <Input
                  ref={inputRef}
                  id="search-bar"
                  type="text"
                  placeholder={placeholder}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={handleBlur}
                  className="pl-12 pr-24 h-14 bg-card/80 backdrop-blur-sm border-2 border-primary/30 focus:border-primary text-foreground text-lg placeholder:text-muted-foreground rounded-full shadow-lg shadow-primary/10 transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-full"
                    aria-label="Cerrar buscador"
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
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
