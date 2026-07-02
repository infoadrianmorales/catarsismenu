/**
 * TopBar — Barra superior con contacto rápido y horarios.
 * [2026-07-02] Ahora visible también en móvil con versión compacta
 * (menos gap, texto acortado) para no saturar el header.
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
    <div className="bg-[#1a2540] border-b border-white/5">
      {/* [2026-07-02] Grid 3 columnas: íconos izq · mensaje centrado · spacer der.
          Garantiza que "Abrimos todos los días" quede al centro en todas las
          resoluciones (móvil/tablet/desktop). */}
      <div className="container px-3 md:px-4 h-8 md:h-9 grid grid-cols-3 items-center text-[11px] md:text-xs text-white/80">
        {/* Íconos de contacto rápido: solo Instagram y ubicación */}
        <div className="flex items-center gap-3 md:gap-4 justify-self-start">
          <a
            href="https://instagram.com/catarsislecheria"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-white transition-colors"
          >
            <Instagram className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </a>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Ubicación en Google Maps"
            className="hover:text-white transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 md:h-4 md:w-4" />
          </a>
        </div>

        {/* Horarios (popover) — centrado. Copy corto en móvil, completo en md+. */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="justify-self-center inline-flex items-center gap-1.5 md:gap-2 hover:text-white transition-colors uppercase tracking-wide whitespace-nowrap"
            >
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden md:inline">Abrimos todos los días</span>
              <span className="hidden md:inline opacity-60">|</span>
              <span className="underline underline-offset-2">
                <span className="md:hidden">Abrimos todos los días</span>
                <span className="hidden md:inline">Click para ver los horarios</span>
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="center"
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

        {/* Spacer derecho para mantener el centrado del mensaje */}
        <div aria-hidden className="justify-self-end" />
      </div>
    </div>
  );
};


export default TopBar;

