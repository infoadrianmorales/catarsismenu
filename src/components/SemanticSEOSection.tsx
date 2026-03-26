export const SemanticSEOSection = () => {
  return (
    <section
      aria-label="Sobre Catarsis Lechería"
      style={{ backgroundColor: '#010C23' }}
      className="py-8 px-6"
    >
      {/* SECCIÓN SEMÁNTICA PARA SEO E IA — CATARSIS
          REGLA: No eliminar ni ocultar con CSS display:none.
          Google y los modelos de IA leen este texto directamente
          desde el HTML. Es la base del posicionamiento local.
          ACTUALIZAR SI CAMBIA horario, ubicación, carta o pagos.
          Mantener sincronizado con RestaurantSchema.tsx,
          FAQSchema.tsx y public/llms.txt */}
      <div className="max-w-3xl mx-auto space-y-3">
        {/* H2 SEO: keyword local de alto valor para Google e IAs */}
        <h2
          className="text-sm md:text-base font-semibold tracking-wide"
          style={{ color: '#F2B60F' }}
        >
          ¿Por qué Catarsis es el restaurante favorito de Lechería?
        </h2>
        {/* Párrafos semánticos: Google e IAs leen este texto.
            No eliminar. Actualizar si cambia la carta o el horario. */}
        {/* ACCESIBILIDAD [CONTRASTE]: text-gray-400 → text-gray-300
            para cumplir WCAG AA (ratio 4.5:1) sobre fondo #010C23.
            Color del brandbook mantenido, solo mayor luminosidad. */}
        <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed">
          <p>
            Catarsis Drinks &amp; Food es un restaurante en CC Aventura 
            Plaza, Lechería, Anzoátegui, reconocido por la calidad de 
            cada uno de sus productos. Hamburguesas gourmet, pizzas, 
            emparedados, parrilla, ensaladas y coctelería de autor — 
            todos preparados con ingredientes frescos y recetas propias.
          </p>
          <p>
            Por las noches, disfruta de cócteles únicos como el Catarsis 
            Punch, la Margarita y más. Abrimos de lunes a domingo de 
            12:00 PM a 1:00 AM. Aceptamos dólares, bolívares, 
            Pago Móvil, Zelle y tarjetas.
          </p>
        </div>
      </div>
    </section>
  );
};
