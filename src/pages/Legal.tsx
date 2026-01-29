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
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-black text-foreground">
              Términos y Condiciones
            </h1>
            <p className="text-lg text-muted-foreground mt-2">Menú Catarsis</p>
          </div>
          
          <p className="text-muted-foreground leading-relaxed">
            Al usar el sitio web de Catarsis, aceptas estos Términos y Condiciones. Si no estás de acuerdo, por favor, no lo uses.
          </p>
          
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              1) ¿Qué hace este sitio?
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Este sitio funciona como menú + carrito para solicitar comida (delivery o retiro, según aplique). 
              No se paga dentro de la web. Al finalizar, el sistema genera un mensaje/enlace a WhatsApp con tu 
              pedido completo para que lo confirmes con nuestro equipo.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              2) Pedidos y disponibilidad
            </h2>
            <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
              <li>Los productos, descripciones y precios mostrados pueden cambiar.</li>
              <li>La disponibilidad puede variar (puede haber items agotados).</li>
              <li>Enviar el pedido por WhatsApp es una solicitud, y el pedido queda confirmado únicamente cuando Catarsis lo valida por WhatsApp (incluyendo tiempos, costos de envío y método de pago si aplica).</li>
            </ul>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              3) Datos personales
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Para poder procesar tu solicitud, necesitaremos algunos datos como nombre, teléfono y dirección/referencias. 
              Te comprometes a que la información sea real y correcta.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              4) Uso permitido
            </h2>
            <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
              <li>No uses el sitio para fines ilegales, fraude o abuso del servicio.</li>
              <li>El contenido del sitio (textos, fotos, logo, diseño) es de Catarsis y no puede copiarse sin permiso.</li>
            </ul>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              5) WhatsApp (servicio de tercero)
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              WhatsApp es una plataforma externa. Al usar el enlace, aceptas sus términos y políticas. 
              Catarsis no controla su funcionamiento.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              6) Responsabilidad
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Catarsis no se hace responsable por fallas técnicas del sitio, caídas del servicio o problemas de conexión. 
              Tampoco por daños derivados del uso del sitio o de WhatsApp.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              7) Cambios a estos términos
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Podemos actualizar estos términos en cualquier momento. Te recomendamos revisarlos ocasionalmente.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              8) Legislación
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Estos términos se rigen por las leyes de Venezuela y cualquier disputa se atenderá en Lechería, Anzoátegui.
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold text-foreground">
              9) Contacto
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dudas o soporte, contáctanos por el WhatsApp disponible en el sitio.
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Legal;
