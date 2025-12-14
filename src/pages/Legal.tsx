import { MenuHeader } from '@/components/MenuHeader';
import { Footer } from '@/components/Footer';
import { useCurrency } from '@/hooks/useCurrency';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Legal = () => {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <div className="min-h-screen bg-background">
      <MenuHeader 
        currency={currency} 
        onCurrencyToggle={toggleCurrency}
      />
      
      <main className="container px-4 py-12">
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Volver al menú
          </Link>
        </Button>
        
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-3xl md:text-4xl font-display font-black text-foreground">
            Aviso Legal
          </h1>
          
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              Precios
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Los precios en VES (Bolívares) pueden variar según la tasa diaria definida por administración. 
              Los precios mostrados son referenciales y pueden estar sujetos a cambios sin previo aviso.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              Imágenes
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Las imágenes mostradas son de referencia. La presentación final del producto puede variar. 
              Disponibilidad de productos sujeta a inventario.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              Contacto
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Para consultas, pedidos especiales o información adicional, contáctanos a través de 
              nuestras redes sociales o WhatsApp.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Legal;
