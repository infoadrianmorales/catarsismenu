// [2026-07-02] CATARSIS — Menú hamburguesa junto al logo.
// Acceso rápido adicional (no reemplaza la navegación existente):
// - Buscador en vivo de productos
// - Categorías (desde Supabase vía usePublicCategories)
// - Horario oficial de Lechería
// - Contacto: WhatsApp, Instagram, Ubicación
import { useState, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Search,
  Clock,
  MessageCircle,
  Instagram,
  MapPin,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { usePublicCategories } from '@/hooks/usePublicCategories';
import { useProducts } from '@/hooks/useProducts';
import { appConfig } from '@/data/config';

// Rutas cortas ya registradas en App.tsx para categorías conocidas.
// Cualquier categoría fuera de esta lista cae al patrón /categoria/:slug.
const CATEGORY_SHORT_ROUTES: Record<string, string> = {
  'best-seller': '/best-seller',
  hamburguesas: '/hamburguesas',
  pizzas: '/pizzas',
  emparedados: '/emparedados',
  parrilla: '/parrilla',
  entradas: '/entradas',
  ensaladas: '/ensaladas',
  cocteleria: '/cocteleria',
};

export const HamburgerMenu = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { sectionCategories, loading: categoriesLoading } = usePublicCategories();
  const { products } = useProducts();

  // Búsqueda en vivo — mínimo 2 caracteres, máximo 6 resultados.
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return products
      .filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          (p.descripcion_corta ?? '').toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [query, products]);

  // Al elegir un producto: cerramos el menú, limpiamos búsqueda y navegamos.
  // [2026-07-02] URL canónica /{categoria}/{slug}
  const handleSelectProduct = (categoria: string, slug: string) => {
    setOpen(false);
    setQuery('');
    navigate(`/${categoria}/${slug}`);
  };

  const getCategoryUrl = (slug: string) =>
    CATEGORY_SHORT_ROUTES[slug] || `/categoria/${slug}`;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      {/* Trigger — ícono ☰. Tamaño táctil ≥44px por accesibilidad. */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Abrir menú"
          className="h-11 w-11 text-foreground hover:bg-white/5"
        >
          <MenuIcon className="h-6 w-6" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={8}
        // Evita que el foco automático mueva la vista y que al escribir
        // se dispare navegación por teclado del menú.
        onCloseAutoFocus={(e) => e.preventDefault()}
        className="w-[92vw] max-w-sm bg-[#010C23] border border-white/10 text-white p-0 rounded-xl shadow-2xl"
      >
        {/* ============ Buscador ============ */}
        <div className="p-3 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              // Detenemos las teclas para que Radix no navegue entre items
              // mientras el usuario escribe en el input.
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Buscar en el menú…"
              className="pl-9 pr-9 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus-visible:ring-[#DB1F51]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Resultados de búsqueda */}
          {searchResults.length > 0 && (
            <div className="mt-2 space-y-0.5 max-h-64 overflow-y-auto">
              {searchResults.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProduct(p.slug)}
                  className="w-full flex items-center gap-3 rounded-md px-2 py-1.5 text-left hover:bg-white/10 transition-colors"
                >
                  <Search className="h-3.5 w-3.5 text-[#DB1F51] shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{p.nombre}</p>
                    <p className="text-xs text-white/50 capitalize">{p.categoria}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
          {query.trim().length >= 2 && searchResults.length === 0 && (
            <p className="mt-2 text-xs text-white/50 px-2 py-2">
              Sin resultados para "{query}"
            </p>
          )}
        </div>

        {/* ============ Categorías ============ */}
        <div className="p-3 border-b border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2 px-2">
            Categorías
          </p>
          {categoriesLoading ? (
            <p className="text-xs text-white/50 px-2 py-2">Cargando…</p>
          ) : (
            <div className="grid grid-cols-1">
              {sectionCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    to={getCategoryUrl(cat.slug)}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-md px-2 py-2 text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-[#FFB800]" />
                    {cat.nombre}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ============ Horario + Contacto ============ */}
        <div className="p-3">
          {/* Horario oficial — coincide con TopBar/Footer (Lechería) */}
          <div className="flex items-start gap-3 px-2 py-2 mb-2">
            <Clock className="h-4 w-4 text-[#DB1F51] mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-white/60">Lunes a Domingo</p>
              <p className="text-sm font-semibold text-white">12:00 PM – 1:00 AM</p>
            </div>
          </div>

          {/* Contacto rápido */}
          <div className="flex flex-wrap gap-3 px-2">
            <a
              href={`https://wa.me/${appConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <a
              href={appConfig.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
            >
              <Instagram className="h-3.5 w-3.5" /> Instagram
            </a>
            <a
              href={appConfig.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="inline-flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
            >
              <MapPin className="h-3.5 w-3.5" /> Ubicación
            </a>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default HamburgerMenu;
