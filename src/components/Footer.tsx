/**
 * Footer rediseñado — Layout de 4 columnas con la información
 * original de Catarsis (solo Lechería).
 */
import { Instagram, Facebook, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TapeDivider = () => (
  <div className="tape-divider overflow-hidden">
    <div className="tape-text whitespace-nowrap">
      CATARSIS • TU SPOT PARA DESCONECTAR • CATARSIS • TU SPOT PARA DESCONECTAR • CATARSIS • TU SPOT PARA DESCONECTAR •
    </div>
  </div>
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
          {/* HORARIOS — solo Lechería (dato original) */}
          <div>
            <h3 className="font-display text-white text-lg font-bold mb-4">Horarios</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p className="text-white/50 uppercase tracking-wide text-xs">Lechería:</p>
              <p>Lunes a Domingo</p>
              <p className="font-semibold text-white">12:00 PM – 1:00 AM</p>
            </div>
          </div>

          {/* DIRECCIÓN — solo Lechería, link Google Maps original */}
          <div>
            <h3 className="font-display text-white text-lg font-bold mb-4">Dirección</h3>
            <div className="space-y-2 text-sm text-white/70">
              <p className="text-white/50 uppercase tracking-wide text-xs">Lechería</p>
              <a
                href="https://maps.google.com/?q=Catarsis+Lecheria"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                CC Aventura Plaza, Lechería, Anzoátegui
              </a>
            </div>
          </div>

          {/* CONTÁCTANOS — solo WhatsApp Lechería + IG/TikTok/FB/YT */}
          <div>
            <h3 className="font-display text-white text-lg font-bold mb-4">Contáctanos</h3>
            <div className="space-y-3 text-sm text-white/70">
              <p>
                Whatsapp:{' '}
                <a
                  href="https://api.whatsapp.com/send?phone=584249056438"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white underline underline-offset-2 hover:text-[#DB1F51]"
                >
                  +58 424-905-6438
                </a>
              </p>

              <div className="flex items-center gap-2 pt-2">
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

          {/* INFORMACIÓN — solo enlaces originales que existen como rutas */}
          <div>
            <h3 className="font-display text-white text-lg font-bold mb-4">Información</h3>
            <ul className="space-y-2 text-sm text-white/70">
              <li>
                <Link
                  to="/terminos-y-condiciones"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  Términos y condiciones
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
