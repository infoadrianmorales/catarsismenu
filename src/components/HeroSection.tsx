import heroImage from '@/assets/hero-burger.jpg';

export const HeroSection = () => {
  return (
    <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroImage} 
          alt="Catarsis Gourmet Burger" 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 halftone-pattern opacity-20" />
      </div>
      
      {/* Content */}
      <div className="relative container h-full flex flex-col justify-end px-4 pb-12">
        <div className="max-w-3xl space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-black tracking-tight">
            Un verdadero festín{' '}
            <span className="text-primary">para tus sentidos</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground/90 font-medium max-w-2xl">
            Comida simplemente deliciosa y tragos que son una obra maestra.
          </p>
        </div>
      </div>
      
      {/* Decorative tape divider */}
      <div className="absolute bottom-0 left-0 right-0 tape-divider">
        <p className="tape-text">
          CATARSIS DRINKS & FOOD • CATARSIS DRINKS & FOOD • CATARSIS DRINKS & FOOD
        </p>
      </div>
    </section>
  );
};
