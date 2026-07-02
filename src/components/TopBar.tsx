/**
 * TopBar — Barra superior con contacto rápido y horarios.
 * Se muestra sobre el MenuHeader en tablet/desktop (oculta en móvil para
 * no saturar el espacio superior).
 */
import { Mail, Instagram, Clock } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export const TopBar = () => {
  return (
    <div className="hidden md:block bg-[#1a2540] border-b border-white/5">
      <div className="container px-4 h-9 flex items-center justify-between text-xs text-white/80">
        {/* Íconos de contacto rápido */}
        <div className="flex items-center gap-4">
          <a
            href="mailto:hola@catarsisve.com"
            aria-label="Escríbenos por email"
            className="hover:text-white transition-colors"
          >
            <Mail className="h-4 w-4" />
          </a>
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
            href="https://api.whatsapp.com/send?phone=584249056438"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="hover:text-white transition-colors"
          >
            {/* Icono de WhatsApp */}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.5 14.4c-.3-.1-1.8-.9-2.1-1s-.5-.2-.7.1-.8 1-.9 1.2-.3.2-.6.1c-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.6c.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.3C8.7 21.5 10.3 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z" />
            </svg>
          </a>
        </div>

        {/* Horarios (popover) */}
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
            className="w-64 bg-[#010C23] border-white/10 text-white text-sm"
          >
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-[#DB1F51] text-xs uppercase tracking-wide">
                  Lechería
                </p>
                <p className="text-white/70 text-xs">Lunes a Domingo</p>
                <p className="font-semibold">12:00 PM – 10:00 PM</p>
              </div>
              <div>
                <p className="font-semibold text-[#DB1F51] text-xs uppercase tracking-wide">
                  Caracas
                </p>
                <p className="text-white/70 text-xs">Lunes a Domingo</p>
                <p className="font-semibold">12:00 PM – 10:00 PM</p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default TopBar;
