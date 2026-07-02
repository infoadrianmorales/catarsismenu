/**
 * TopBar — Barra superior con contacto rápido y horarios.
 * Se muestra sobre el MenuHeader en tablet/desktop (oculta en móvil para
 * no saturar el espacio superior).
 */
import { Instagram, Clock, MapPin } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Enlace oficial a Google Maps de CC Aventura Plaza, Lechería
const MAPS_URL = 'https://maps.app.goo.gl/8Q9zJ2Y5Xk3fN7wF9';

export const TopBar = () => {
  return (
    <div className="hidden md:block bg-[#1a2540] border-b border-white/5">
      <div className="container px-4 h-9 flex items-center justify-between text-xs text-white/80">
        {/* Íconos de contacto rápido: solo Instagram y ubicación */}
        <div className="flex items-center gap-4">
          <a
            href="https://instagram.com/catarsislecheria"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-white transition-colors"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ubicación en Google Maps"
            className="hover:text-white transition-colors"
          >
            <MapPin className="h-4 w-4" />
          </a>
        </div>

        {/* Horarios (popover) — solo Lechería */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 hover:text-white transition-colors uppercase tracking-wide"
            >
              <Clock className="h-3.5 w-3.5" />
              <span>Abrimos todos los días</span>
              <span className="opacity-60">|</span>
              <span className="underline underline-offset-2">Click para ver los horarios</span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-56 bg-[#010C23] border-white/10 text-white text-sm"
          >
            <div>
              <p className="font-semibold text-[#DB1F51] text-xs uppercase tracking-wide">
                Lechería
              </p>
              <p className="text-white/70 text-xs">Lunes a Domingo</p>
              <p className="font-semibold">12:00 PM – 1:00 AM</p>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default TopBar;
