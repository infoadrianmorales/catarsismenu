import { useState, useEffect, useCallback, useRef } from 'react';
import { appConfig } from '@/data/config';
import { Button } from '@/components/ui/button';
import { MessageCircle, Instagram, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { useHeroSlides } from '@/hooks/useHeroSlides';
import heroImageFallback from '@/assets/banner-hero.png';
import { trackContact, trackLead } from '@/lib/metaPixel';
import { ViewMode } from '@/contexts/ViewModeContext';

interface HeroSectionProps {
  mode?: ViewMode;
}

export const HeroSection = ({ mode = 'delivery' }: HeroSectionProps) => {
  const { activeSlides, loading } = useHeroSlides();
  const isLocalMode = mode === 'local';
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
      setIsAutoPlaying(false);
      setTimeout(() => setIsAutoPlaying(true), 5000);
    }
  };

  // Use slides from DB or fallback to static image
  const allSlides = activeSlides.length > 0 
    ? activeSlides.map(s => s.image_url) 
    : [heroImageFallback];
  
  // In local mode, only show the first slide (static)
  const slides = isLocalMode ? [allSlides[0]] : allSlides;
  const showCarousel = !isLocalMode && slides.length > 1;

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 5 seconds
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  // Auto-play effect
  useEffect(() => {
    if (!isAutoPlaying || slides.length <= 1) return;

    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length, goToNext]);

  // Reset index when slides change
  useEffect(() => {
    setCurrentIndex(0);
  }, [slides.length]);

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Hola, vengo del menú web de Catarsis. Quiero hacer un pedido.');
    window.open(`https://wa.me/${appConfig.whatsapp}?text=${message}`, '_blank');
    
    trackContact('hero');
    trackLead('hero');
    window.dispatchEvent(new CustomEvent('analytics', {
      detail: { event: 'click_whatsapp', source: 'hero' }
    }));
  };

  if (loading) {
    return (
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-end justify-center overflow-hidden bg-background">
        <div className="absolute inset-0 animate-pulse bg-muted/30" />
        <div className="relative z-10 container px-4 pb-16 pt-8 text-center">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="h-11 w-48 rounded-md bg-muted/40 animate-pulse" />
            <div className="h-11 w-40 rounded-md bg-muted/40 animate-pulse" />
          </div>
        </div>
      </section>
    );
  }

  {/* OPTIMIZACIÓN DE PERFORMANCE — HeroSection
      Cambios aplicados:
      - loading="eager" en slide 0 (ya existía), lazy en el resto
      - width y height para evitar saltos de layout (CLS)
      - alt descriptivo mejorado para SEO
      CLS (Cumulative Layout Shift): cuando una imagen carga
      tarde y empuja el contenido hacia abajo — afecta la
      experiencia del usuario y el score de Google PageSpeed. */}
  {/* PERFORMANCE [CLS]: min-h-[45vh] y md:min-h-[70vh] reservan
      el espacio del hero antes de que cargue la imagen.
      Sin esto el contenido de abajo salta cuando aparece
      el hero — genera CLS alto. No duplicar ni eliminar. */}
  return (
    <section className="relative flex flex-col md:block md:min-h-[70vh] overflow-hidden">
      {/* Image Zone */}
      <div
        className="relative min-h-[45vh] md:min-h-[70vh] flex items-end justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Images Carousel */}
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {/* PERFORMANCE [LCP]: fetchpriority="high" en slide 0
                  le indica al navegador que esta imagen es la más
                  importante de la página. La descarga antes que
                  cualquier otro recurso no crítico.
                  Solo el primer slide — el resto lazy load. */}
              <img 
                src={slide} 
                alt={index === 0 ? 'Catarsis Drinks & Food — Restaurante en CC Aventura Plaza, Lechería' : `Catarsis Drinks & Food Banner ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
                {...(index === 0 ? { fetchpriority: 'high' } : {})}
                width="1200"
                height="600"
              />
              {/* WIDTH/HEIGHT: Reservan el espacio en el layout antes
                  de que la imagen cargue. Sin esto el contenido salta
                  cuando la imagen aparece (CLS). */}
            </div>
          ))}
          {/* Mobile: short gradient fade. Desktop: full gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent md:from-background md:via-background/20 md:to-transparent" />
        </div>

        {/* Desktop Navigation Arrows (only if carousel mode) */}
        {showCarousel && (
          <>
            <button
              onClick={() => { goToPrev(); setIsAutoPlaying(false); }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => { goToNext(); setIsAutoPlaying(false); }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
              aria-label="Siguiente slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Desktop Dot indicators (only if carousel mode) */}
        {showCarousel && (
          <div className="hidden md:flex absolute bottom-32 left-1/2 -translate-x-1/2 z-20 gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-primary w-6' 
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Desktop CTA Buttons */}
        <div className="hidden md:block relative z-10 container px-4 pb-16 pt-8 text-center">
          <div className="flex flex-row flex-wrap items-center justify-center gap-3">
            {!isLocalMode && (
              <Button 
                size="lg" 
                onClick={handleWhatsAppClick}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold gap-2"
              >
                <MessageCircle className="h-5 w-5" />
                Pedir por WhatsApp
              </Button>
            )}
            <Button 
              variant={isLocalMode ? "default" : "outline"}
              size="lg"
              asChild
              className={isLocalMode 
                ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold gap-2"
                : "border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary gap-2"
              }
            >
              <a href={appConfig.instagram_url} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5" />
                {isLocalMode ? 'Síguenos en Instagram' : 'Ver en Instagram'}
              </a>
            </Button>
            {!isLocalMode && (
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
            )}
          </div>
        </div>

      {/* Mobile Navigation Arrows + Dots - overlaid on bottom of image */}
        {showCarousel && (
          <div className="flex md:hidden absolute bottom-4 left-4 right-4 z-20 justify-between items-center">
            <button
              onClick={() => { goToPrev(); setIsAutoPlaying(false); }}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Dot indicators */}
            <div className="flex items-center gap-2">
            {/* ACCESIBILIDAD [TOUCH]: min-w/min-h 44px para cumplir
                touch target mínimo recomendado por Apple/Google. */}
            {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={`Ir al slide ${index + 1}`}
                >
                  <span className={`block h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-white w-5'
                      : 'bg-white/40 w-2'
                  }`} />
                </button>
              ))}
            </div>

            <button
              onClick={() => { goToNext(); setIsAutoPlaying(false); }}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
              aria-label="Siguiente slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Desktop Tape Divider */}
        <div className="hidden md:block absolute bottom-0 left-0 right-0">
          <div className="tape-divider overflow-hidden">
            <div className="tape-text whitespace-nowrap">
              CATARSIS • SABORES QUE LIBERAN, MOMENTOS QUE CONECTAN • CATARSIS • SABORES QUE LIBERAN, MOMENTOS QUE CONECTAN • CATARSIS • SABORES QUE LIBERAN, MOMENTOS QUE CONECTAN •
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Controls Zone - solid background, below image */}
      <div className="md:hidden bg-background">
        {/* Mobile Tape Divider */}
        <div className="w-full">
          <div className="tape-divider overflow-hidden">
            <div className="tape-text whitespace-nowrap">
              CATARSIS • SABORES QUE LIBERAN, MOMENTOS QUE CONECTAN • CATARSIS • SABORES QUE LIBERAN, MOMENTOS QUE CONECTAN • CATARSIS • SABORES QUE LIBERAN, MOMENTOS QUE CONECTAN •
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
