/**
 * Footer rediseñado — Layout de 4 columnas (Horarios, Dirección, Contáctanos, Información).
 * Se conservan todos los enlaces originales (WhatsApp, Maps, redes, legales).
 */
import { Instagram, Facebook, Youtube, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TapeDivider = () => (
  <div className="tape-divider overflow-hidden">
    <div className="tape-text whitespace-nowrap">
      CATARSIS • TU SPOT PARA DESCONECTAR • CATARSIS • TU SPOT PARA DESCONECTAR • CATARSIS • TU SPOT PARA DESCONECTAR •
    </div>
  </div>
);

// Icono personalizado de WhatsApp
const WhatsAppIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.5 14.4c-.3-.1-1.8-.9-2.1-1s-.5-.2-.7.1-.8 1-.9 1.2-.3.2-.6.1c-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.6c.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5 0-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.2 3.3 5.3 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.4 1.3 4.9L2 22l5.3-1.3C8.7 21.5 10.3 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z" />
  </svg>
);

const TikTokIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 pb-20 md:pb-8 pt-12">
      <div className="container px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
          {/* HORARIOS */}
          <div>
            <h3 className="font-display text-white text-lg font-bold mb-4">Horarios</h3>
            <div className="space-y-4 text-sm text-white/70">
              <div>
                <p className="text-white/50 uppercase tracking-wide text-xs">Lechería:</p>
                <p>De Lunes a Domingo:</p>
                <p className="font-semibold text-white">12:00 PM a 10:00 PM</p>
              </div>
              <div>
                <p className="text-white/50 uppercase tracking-wide text-xs">Caracas:</p>
                <p>De Lunes a Domingo:</p>
                <p className="font-semibold text-white">12:00 PM a 10:00 PM</p>
              </div>
            </div>
          </div>

          {/* DIRECCIÓN */}
          <div>
            <h3 className="font-display text-white text-lg font-bold mb-4">Dirección</h3>
            <div className="space-y-4 text-sm text-white/70">
              <div>
                <p className="text-white/50 uppercase tracking-wide text-xs">Lechería</p>
                <a
                  href="https://maps.google.com/?q=Catarsis+Lecheria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Avenida principal de Lechería, CC Aventura Plaza
                </a>
              </div>
              <div>
                <p className="text-white/50 uppercase tracking-wide text-xs">Caracas</p>
                <a
                  href="https://maps.google.com/?q=Catarsis+Caracas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Primera Avenida de Los Palos Grandes, Edificio Pinali, Locales PB-3 y PB-4
                </a>
              </div>
            </div>
          </div>

          {/* CONTÁCTANOS */}
          <div>
            <h3 className="font-display text-white text-lg font-bold mb-4">Contáctanos</h3>
            <div className="space-y-3 text-sm text-white/70">
              <p>
                Whatsapp Lechería:{' '}
                <a
                  href="https://api.whatsapp.com/send?phone=584249056438"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline underline-offset-2 hover:text-[#DB1F51]"
                >
                  0424-9056438
                </a>
              </p>
              <p>
                Whatsapp Caracas:{' '}
                <a
                  href="https://api.whatsapp.com/send?phone=584121158385"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline underline-offset-2 hover:text-[#DB1F51]"
                >
                  0412-1158385
                </a>
              </p>

              {/* Iconos redes */}
              <div className="flex items-center gap-2 pt-2">
                <a
                  href="mailto:hola@catarsisve.com"
                  aria-label="Email"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white transition-colors"
                  style={{ backgroundColor: 'rgba(219, 31, 81, 0.15)' }}
                >
                  <Mail className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com/catarsislecheria"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white transition-colors"
                  style={{ backgroundColor: 'rgba(219, 31, 81, 0.15)' }}
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://api.whatsapp.com/send?phone=584249056438"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white transition-colors"
                  style={{ backgroundColor: 'rgba(219, 31, 81, 0.15)' }}
                >
                  <WhatsAppIcon />
                </a>
                <a
                  href="https://www.facebook.com/Catarsis.ve/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white transition-colors"
                  style={{ backgroundColor: 'rgba(219, 31, 81, 0.15)' }}
                >
                  <Facebook className="h-4 w-4" />
                </a>
                <a
                  href="https://www.tiktok.com/@catarsis.lecheria"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white transition-colors"
                  style={{ backgroundColor: 'rgba(219, 31, 81, 0.15)' }}
                >
                  <TikTokIcon />
                </a>
                <a
                  href="https://www.youtube.com/@CatarsisLecheria"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-white transition-colors"
                  style={{ backgroundColor: 'rgba(219, 31, 81, 0.15)' }}
                >
                  <Youtube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN */}
          <div>
            <h3 className="font-display text-white text-lg font-bold mb-4">Información</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link
                  to="/politicas-de-privacidad"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  Políticas de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  to="/politicas-de-reembolso"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  Políticas de Reembolso
                </Link>
              </li>
              <li>
                <Link
                  to="/politicas-de-delivery"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  Políticas de Delivery
                </Link>
              </li>
              <li>
                <Link
                  to="/terminos-y-condiciones"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  Sitemap
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>
            © {new Date().getFullYear()} Catarsis — Drinks & Food. Todos los derechos reservados.
          </p>
          <p>
            Diseñado y desarrollado por{' '}
            <a
              href="https://www.moralesadrian.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors underline underline-offset-2"
            >
              Adrian Morales
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
