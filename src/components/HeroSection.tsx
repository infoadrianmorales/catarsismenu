import { appConfig } from '@/data/config';
import { Button } from '@/components/ui/button';
import { MessageCircle, Instagram, MapPin } from 'lucide-react';
import heroImage from '@/assets/hero-burger.jpg';
import logoWhite from '@/assets/logo-catarsis-white.png';

export const HeroSection = () => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola, vengo del menú web de Catarsis. Quiero hacer un pedido.');
    window.open(`https://wa.me/${appConfig.whatsapp}?text=${message}`, '_blank');
    
    window.dispatchEvent(new CustomEvent('analytics', {
      detail: { event: 'click_whatsapp', source: 'hero' }
    }));
  };

  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Catarsis Hero"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50" />
        <div className="absolute inset-0 halftone-pattern opacity-20" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container px-4 py-16 text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <img 
            src={logoWhite} 
            alt="Catarsis" 
            className="h-24 md:h-36 lg:h-44 w-auto"
          />
        </div>
        
        {/* Slogans with prominence */}
        <div className="space-y-6">
          <p className="text-lg md:text-xl lg:text-2xl font-body uppercase tracking-[0.4em] text-accent font-medium">
            Tu spot para desconectar
          </p>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-display font-black text-foreground leading-tight max-w-3xl mx-auto">
            Sabores que liberan, momentos que conectan
          </h1>
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
