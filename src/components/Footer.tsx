import { appConfig } from '@/data/config';
import { Instagram, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 pb-20 md:pb-8">
      {/* Tape Divider */}
      <div className="tape-divider overflow-hidden mb-8">
        <div className="tape-text whitespace-nowrap">
          CATARSIS DRINKS & FOOD • CATARSIS DRINKS & FOOD • CATARSIS DRINKS & FOOD • CATARSIS DRINKS & FOOD •
        </div>
      </div>
      
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Brand */}
          <div className="space-y-2">
            <span className="font-display text-2xl font-black text-primary">
              CATARSIS
            </span>
            <p className="text-sm text-muted-foreground">
              Drinks & Food
            </p>
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
          <div className="flex items-center gap-4">
            <a 
              href={appConfig.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="h-5 w-5" />
              <span className="text-sm">@catarsislecheria</span>
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
