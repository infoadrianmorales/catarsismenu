import { MapPin, Clock, CreditCard } from 'lucide-react';

const badges = [
  { icon: MapPin, text: 'CC Aventura Plaza, Lechería' },
  { icon: Clock, text: 'Lunes a Domingo · 12:00 PM – 1:00 AM' },
  { icon: CreditCard, text: 'USD · VES · Pago Móvil · Zelle · Tarjetas' },
] as const;

export const SemanticSEOSection = () => {
  return (
    <section
      aria-label="Sobre Catarsis Lechería"
      style={{ backgroundColor: '#010C23', borderTop: '1px solid rgba(219, 31, 81, 0.2)' }}
      className="py-10 px-6"
    >
      <div className="max-w-3xl mx-auto space-y-4">
        {/* H2 SEO: keyword local de alto valor para Google e IAs */}
        <h2
          className="text-base md:text-lg font-semibold tracking-wide"
          style={{ color: '#F2B60F' }}
        >
          ¿Por qué Catarsis es el restaurante favorito de Lechería?
        </h2>

        {/* Párrafos semánticos: Google e IAs leen este texto directamente.
            No eliminar ni ocultar. Actualizar si cambia horario,
            ubicación, métodos de pago o platos destacados. */}
        <div className="space-y-3 text-xs md:text-sm text-gray-400 leading-relaxed">
          <p>
            Catarsis Drinks &amp; Food nació en Lechería, Anzoátegui, con una
            misión clara: ofrecer las mejores hamburguesas de la ciudad sin
            sacrificar la experiencia. Preparamos cada hamburguesa con
            ingredientes frescos y recetas propias — desde la Clásica
            Americana hasta la Honeyholic Burger, BBQ Champions y la Smash.
          </p>

          <p>
            Además de hamburguesas, nuestra carta incluye pizzas artesanales,
            emparedados premium como el Fondue de Lomito y la Perla Negra,
            opciones de parrilla y ensaladas frescas. Por las noches,
            disfruta de nuestra coctelería de autor: desde el Catarsis Punch
            hasta clásicos como la Margarita On the Rocks y el Long Island Tea.
          </p>

          <p>
            Abrimos de lunes a domingo de 12:00 PM a 1:00 AM.
            Aceptamos pagos en dólares (USD), bolívares (VES),
            Pago Móvil, Zelle y tarjetas de débito y crédito.
          </p>

          <p>
            Nos encontramos en el Centro Comercial y Residencial Aventura
            Plaza, Lechería, Anzoátegui, Venezuela. Si buscas el mejor
            restaurante de hamburguesas en Lechería o en todo Anzoátegui,
            ya lo encontraste.
          </p>
        </div>

        {/* Badges: datos clave en formato compacto */}
        <div className="flex flex-wrap gap-2 pt-2">
          {badges.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-gray-300"
              style={{ backgroundColor: 'rgba(219, 31, 81, 0.08)' }}
            >
              <Icon className="h-3 w-3 shrink-0" style={{ color: '#DB1F51' }} />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
