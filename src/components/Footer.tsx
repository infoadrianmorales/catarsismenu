import { Instagram } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-border/40 bg-card/50 backdrop-blur-sm mt-16">
      <div className="container px-4 py-8">
        {/* Tape divider */}
        <div className="tape-divider mb-8">
          <p className="tape-text">
            CATARSIS DRINKS & FOOD • CATARSIS DRINKS & FOOD • CATARSIS DRINKS & FOOD
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-display font-bold mb-2">
              <span className="text-primary">CATARSIS</span>
              <span className="text-foreground text-lg ml-2">Drinks & Food</span>
            </h3>
            <p className="text-sm text-muted-foreground">
              Un verdadero festín para tus sentidos
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://instagram.com/catarsislecheria" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors group"
            >
              <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </div>
              <span className="font-medium">@catarsislecheria</span>
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>© 2024 Catarsis Drinks & Food. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
