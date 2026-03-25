import { Instagram, MapPin, Facebook, Youtube } from 'lucide-react';
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
export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 pb-20 md:pb-8">
      {/* Tape Divider */}
      <div className="tape-divider overflow-hidden mb-8">
        <div className="tape-text whitespace-nowrap">
          CATARSIS • TU SPOT PARA DESCONECTAR • CATARSIS • TU SPOT PARA DESCONECTAR • CATARSIS • TU SPOT PARA DESCONECTAR •
        </div>
      </div>
      
      {/* SEO Content - Integrated */}
      <div className="container px-4 mb-8">
        <div className="max-w-3xl mx-auto text-xs text-muted-foreground/70 space-y-2 leading-relaxed">
          <p>
            <strong className="text-muted-foreground">Catarsis Drinks & Food</strong> es un restaurante en <strong>Lechería, Anzoátegui</strong>, 
            reconocido por sus <Link to="/categoria/hamburguesas" className="text-primary/70 hover:text-primary hover:underline">hamburguesas</Link> — desde la Clásica Americana 
            hasta la Honeyholic Burger, BBQ Champions y la Smash. Cada una preparada con ingredientes frescos y recetas propias.
          </p>
          <p>
            Además de hamburguesas, el menú incluye{' '}
            <Link to="/categoria/pizzas" className="text-primary/70 hover:text-primary hover:underline">pizzas</Link>,{' '}
            <Link to="/categoria/emparedados" className="text-primary/70 hover:text-primary hover:underline">emparedados</Link>,{' '}
            opciones de <Link to="/categoria/parrilla" className="text-primary/70 hover:text-primary hover:underline">parrilla</Link> y{' '}
            <Link to="/categoria/ensaladas" className="text-primary/70 hover:text-primary hover:underline">ensaladas frescas</Link>.
          </p>
          <p>
            Por las noches, disfruta de una variedad de{' '}
            <Link to="/categoria/cocteleria" className="text-primary/70 hover:text-primary hover:underline">cócteles</Link> — desde 
            el Catarsis Punch hasta clásicos como la Margarita. Abrimos de lunes a domingo, con horario extendido hasta la 1:00 AM los fines de semana.
            Aceptamos pagos en dólares, bolívares, Pago Móvil, Zelle y tarjetas. CC Aventura Plaza, Lechería, Anzoátegui.
          </p>
        </div>
      </div>
      
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
                {/* UBICACIÓN ACTUALIZADA: CC Aventura Plaza, Lechería.
                    Mantener sincronizado con:
                    - meta name="description" en index.html
                    - og:description en index.html
                    - Schema.org streetAddress (LocalBusinessSchema, RestaurantSchema)
                    - llms.txt location
                    - FAQ Schema */}
                CC Aventura Plaza, Lechería, Anzoátegui
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
