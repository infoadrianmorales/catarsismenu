{/* ================================================
    SECCIÓN SEMÁNTICA PARA SEO E IA — CATARSIS
    ================================================
    REGLA: No eliminar ni ocultar con CSS display:none.
    Google y los modelos de IA leen este texto directamente
    desde el HTML. Es la base del posicionamiento local.

    ACTUALIZAR SI CAMBIA:
    - Horario del restaurante
    - Dirección o ubicación
    - Métodos de pago aceptados
    - Platos destacados del menú

    Mantener sincronizado con:
    - src/components/RestaurantSchema.tsx
    - src/components/FAQSchema.tsx
    - public/llms.txt
    ================================================ */}

import { MapPin, Clock, CreditCard } from 'lucide-react';

const badges = [
  { icon: MapPin, text: 'CC Aventura Plaza, Lechería' },
  { icon: Clock, text: 'Lunes a Domingo — hasta 1:00 AM viernes y sábados' },
  { icon: CreditCard, text: 'USD · VES · Pago Móvil · Zelle · Tarjetas' },
] as const;

export const SemanticSEOSection = () => {
  return (
    <section
      aria-label="Sobre Catarsis Lechería"
      style={{ backgroundColor: '#010C23', borderTop: '1px solid rgba(219, 31, 81, 0.2)' }}
      className="py-16 px-6"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* H2: Pregunta directa que responde consultas frecuentes
            en Google y en modelos de IA como ChatGPT y Perplexity.
            "restaurante favorito de Lechería" es una keyword
            de intención local de alto valor. */}
        <h2
          className="font-display text-xl md:text-2xl font-semibold"
          style={{ color: '#F2B60F' }}
        >
          ¿Por qué Catarsis es el restaurante favorito de Lechería?
        </h2>

        <div className="space-y-4 text-sm md:text-base text-gray-300 leading-relaxed">
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

          {/* DATOS ESTRUCTURADOS EN TEXTO: Horario y métodos de pago
              escritos en HTML puro — Google los indexa directamente
              y las IAs los citan en respuestas sobre Catarsis. */}
          <p>
            Abrimos de lunes a jueves de 12:00 PM a 11:00 PM, viernes y
            sábados de 12:00 PM a 1:00 AM, y domingos de 12:00 PM a 10:00 PM.
            Aceptamos pagos en dólares (USD), bolívares (VES), Pago Móvil,
            Zelle y tarjetas de débito y crédito.
          </p>

          <p>
            Nos encontramos en el Centro Comercial y Residencial Aventura
            Plaza, Lechería, Anzoátegui, Venezuela. Si buscas el mejor
            restaurante de hamburguesas en Lechería o en todo Anzoátegui,
            ya lo encontraste.
          </p>
        </div>

        {/* TIPOGRAFÍA: Tamaños reducidos intencionalmente.
            Esta sección es semántica para SEO e IA — debe
            ser legible pero no dominar visualmente la página.
            El contenido importa para Google, el diseño
            no debe competir con el menú principal. */}

        {/* BADGES: Datos clave visibles de un vistazo.
            Refuerzan la información semántica del texto
            y mejoran la experiencia del usuario móvil. */}
        <div className="flex flex-wrap gap-3 pt-4">
          {badges.map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs md:text-sm text-foreground"
              style={{ backgroundColor: 'rgba(219, 31, 81, 0.1)' }}
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color: '#DB1F51' }} />
              {text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};
