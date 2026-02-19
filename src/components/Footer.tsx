import { Instagram, MapPin, Facebook, Youtube } from 'lucide-react';
import logoCatarsis from '@/assets/logo-catarsis.png';

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 pb-20 md:pb-8">
      {/* Tape Divider */}
      <div className="tape-divider overflow-hidden mb-8">
        <div className="tape-text whitespace-nowrap">
          CATARSIS • TU SPOT PARA DESCONECTAR • CATARSIS • TU SPOT PARA DESCONECTAR • CATARSIS • TU SPOT PARA DESCONECTAR •
        </div>
      </div>
      
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <img 
              src={logoCatarsis} 
              alt="Catarsis Drinks & Food - Restaurante de hamburguesas en Lechería" 
              className="h-16 md:h-20 w-auto"
            />
            <p className="text-xs text-muted-foreground max-w-xs">
              Hamburguesas, pizzas, emparedados y coctelería en Lechería, Anzoátegui.
            </p>
          </div>
          
          {/* Info */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Horario: Lun-Dom 12:00pm - 1:00am</p>
            <address className="not-italic">
              <a 
                href="https://maps.google.com/?q=Catarsis+Lecheria"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center md:justify-start gap-1 hover:text-primary transition-colors"
              >
                <MapPin className="h-4 w-4" />
                CC Costa Mar, Local 7, Lechería, Anzoátegui
              </a>
            </address>
            <a 
              href="tel:+584249056438"
              className="block hover:text-primary transition-colors"
            >
              +58 424-905-6438
            </a>
          </div>
          
          {/* Social */}
          <div className="flex items-center gap-6">
            <a 
              href="https://instagram.com/catarsislecheria"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Catarsis en Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a 
              href="https://www.facebook.com/Catarsis.ve/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Catarsis en Facebook"
            >
              <Facebook className="h-6 w-6" />
            </a>
            <a 
              href="https://www.tiktok.com/@catarsis.lecheria"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Catarsis en TikTok"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
            <a 
              href="https://www.youtube.com/@CatarsisLecheria"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Catarsis en YouTube"
            >
              <Youtube className="h-6 w-6" />
            </a>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Catarsis — Drinks & Food. Todos los derechos reservados.
          </p>
          <div className="flex items-center justify-center gap-3 mt-1">
            <a 
              href="/terminos-y-condiciones" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
            >
              Términos y condiciones
            </a>
            <span className="text-xs text-muted-foreground">•</span>
            <a 
              href="/sitemap.xml" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
            >
              Sitemap
            </a>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Diseñado y desarrollado por{' '}
            <a 
              href="https://www.moralesadrian.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors underline"
            >
              Adrian Morales
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
