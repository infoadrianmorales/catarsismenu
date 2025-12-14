import { appConfig } from '@/data/config';
import { Button } from '@/components/ui/button';
import { MessageCircle, Instagram, MapPin } from 'lucide-react';
import heroImage from '@/assets/hero-burger.jpg';

export const HeroSection = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola, vengo del menú web de Catarsis. Quiero hacer un pedido.');
    window.open(`https://wa.me/${appConfig.whatsapp}?text=${message}`, '_blank');
    
    window.dispatchEvent(new CustomEvent('analytics', {
      detail: { event: 'click_whatsapp', source: 'hero' }
    }));
  };

  return (
    <section className="relative min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Catarsis Drinks & Food Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 halftone-pattern opacity-30" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container px-4 py-12 text-center space-y-6">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-black text-foreground leading-tight">
            Catarsis — Drinks & Food
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora el menú, mira precios en USD o VES y pide por WhatsApp en segundos.
          </p>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button 
            size="lg" 
            onClick={handleWhatsAppClick}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            Pedir por WhatsApp
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            asChild
            className="border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary gap-2"
          >
            <a href={appConfig.instagram_url} target="_blank" rel="noopener noreferrer">
              <Instagram className="h-5 w-5" />
              Ver en Instagram
            </a>
          </Button>
          
          <Button 
            variant="ghost" 
            size="lg"
            asChild
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <a href={appConfig.maps_url} target="_blank" rel="noopener noreferrer">
              <MapPin className="h-5 w-5" />
              Cómo llegar
            </a>
          </Button>
        </div>
      </div>
      
      {/* Tape Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="tape-divider overflow-hidden">
          <div className="tape-text whitespace-nowrap">
            CATARSIS DRINKS & FOOD • CATARSIS DRINKS & FOOD • CATARSIS DRINKS & FOOD • CATARSIS DRINKS & FOOD •
          </div>
        </div>
      </div>
    </section>
  );
};
