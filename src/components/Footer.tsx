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
              alt="Catarsis" 
              className="h-16 md:h-20 w-auto"
            />
          </div>
          
          {/* Info */}
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Horario: Lun-Dom 12:00pm - 11:00pm</p>
            <p className="flex items-center justify-center md:justify-start gap-1">
              <MapPin className="h-4 w-4" />
              Lechería, Anzoátegui
            </p>
          </div>
          
          {/* Social */}
          <div className="flex items-center gap-6">
            <a 
              href="https://instagram.com/catarsislecheria"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="h-6 w-6" />
            </a>
            <a 
              href="https://www.facebook.com/Catarsis.ve/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="h-6 w-6" />
            </a>
            <a 
              href="https://www.tiktok.com/@catarsis.lecheria"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="TikTok"
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
              aria-label="YouTube"
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
          <a 
            href="/legal" 
            className="text-xs text-muted-foreground hover:text-primary transition-colors underline"
          >
            Aviso legal
          </a>
        </div>
      </div>
    </footer>
  );
};
