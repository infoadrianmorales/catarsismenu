import { Instagram, MapPin, Facebook, Youtube, Clock, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoCatarsis from '@/assets/logo-catarsis-white.png';

/* OPTIMIZACIÓN DE PERFORMANCE — Footer
   Cambios aplicados:
   - loading="lazy" en logo (fuera de pantalla inicial)
   - width y height para evitar saltos de layout (CLS)
   - alt descriptivo ya correcto
   CLS (Cumulative Layout Shift): cuando una imagen carga
   tarde y empuja el contenido hacia abajo — afecta la
   experiencia del usuario y el score de Google PageSpeed. */
export const TapeDivider = () => (
  <div className="tape-divider overflow-hidden">
    <div className="tape-text whitespace-nowrap">
      CATARSIS • TU SPOT PARA DESCONECTAR • CATARSIS • TU SPOT PARA DESCONECTAR • CATARSIS • TU SPOT PARA DESCONECTAR •
    </div>
  </div>
);

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 pb-20 md:pb-8 pt-8">
      
      {/* TEXTO DESCRIPTIVO ELIMINADO: Reemplazado por SemanticSEOSection
          que contiene el mismo contenido optimizado para SEO e IA.
          Ver src/components/SemanticSEOSection.tsx */}
      
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <img 
              src={logoCatarsis} 
              alt="Catarsis Drinks & Food - Restaurante de hamburguesas en Lechería" 
              loading="lazy"
              width="240"
              height="80"
              className="h-16 md:h-20 w-auto"
            />
            {/* LAZY: Esta imagen está fuera de la pantalla inicial.
                Se carga solo cuando el usuario hace scroll hasta ella,
                reduciendo el tiempo de carga inicial del sitio. */}
            <p className="text-xs text-muted-foreground max-w-xs">
              Hamburguesas, pizzas, emparedados y coctelería en Lechería, Anzoátegui.
            </p>
          </div>
          
          {/* BADGES DE CONTACTO: Estilo visual consistente con
              SemanticSEOSection. Fondo Raspberry al 8% de opacidad,
              ícono en #DB1F51, texto gris claro.
              MANTENER hrefs intactos:
              - Ubicación → Google Maps
              - Teléfono → WhatsApp directo */}
          <div className="flex flex-wrap gap-2">
            {/* BADGE HORARIO — texto plano sin enlace */}
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-gray-300"
              style={{ backgroundColor: 'rgba(219, 31, 81, 0.08)' }}
            >
              <Clock className="h-3 w-3 shrink-0" style={{ color: '#DB1F51' }} />
              Lun-Dom · 12:00 PM – 1:00 AM
            </span>

            {/* BADGE UBICACIÓN — mantiene href a Google Maps */}
            <a
              href="https://maps.google.com/?q=Catarsis+Lecheria"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-gray-300 transition-colors hover:text-white"
              style={{ backgroundColor: 'rgba(219, 31, 81, 0.08)' }}
            >
              <MapPin className="h-3 w-3 shrink-0" style={{ color: '#DB1F51' }} />
              CC Aventura Plaza, Lechería, Anzoátegui
            </a>

            {/* BADGE TELÉFONO — mantiene href a WhatsApp */}
            <a
              href="https://api.whatsapp.com/send?phone=584249056438"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-gray-300 transition-colors hover:text-white"
              style={{ backgroundColor: 'rgba(219, 31, 81, 0.08)' }}
            >
              <Phone className="h-3 w-3 shrink-0" style={{ color: '#DB1F51' }} />
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
