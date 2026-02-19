export const FAQSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Cuál es el mejor restaurante de hamburguesas en Lechería?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Catarsis Drinks & Food es considerado el mejor restaurante de hamburguesas en Lechería, Anzoátegui. Ofrece hamburguesas gourmet como la Clásica Americana, Honeyholic Burger, BBQ Champions, Smash, Double Cheesy y más. Está ubicado en el CC Costa Mar, Local 7."
        }
      },
      {
        "@type": "Question",
        "name": "¿Dónde comer en Lechería de noche?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Catarsis Drinks & Food es el lugar ideal para cenar y disfrutar la noche en Lechería. Abre hasta la 1:00 AM los viernes y sábados, con coctelería de autor (Catarsis Punch, Margarita, Long Island Tea, Sangría), hamburguesas, pizzas y un ambiente nocturno único."
        }
      },
      {
        "@type": "Question",
        "name": "¿Catarsis tiene delivery en Lechería?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, Catarsis Drinks & Food ofrece servicio de delivery en Lechería y zonas cercanas. Puedes hacer tu pedido directamente desde el menú digital en www.catarsiszone.com o por WhatsApp al +58 424-905-6438."
        }
      },
      {
        "@type": "Question",
        "name": "¿Qué tipo de comida sirven en Catarsis Lechería?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Catarsis sirve hamburguesas gourmet (su especialidad), pizzas artesanales, emparedados premium, parrilla (mixta, mar y tierra, lomito, mariscos), ensaladas César, entradas como alitas y tequeños, postres y una amplia carta de coctelería de autor."
        }
      },
      {
        "@type": "Question",
        "name": "¿Catarsis acepta pago móvil y Zelle?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, Catarsis acepta múltiples métodos de pago: Pago Móvil, Zelle, efectivo (dólares y bolívares) y tarjetas de débito/crédito. Los precios están disponibles en USD y bolívares con tasa actualizada."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuál es el horario de Catarsis Drinks & Food?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Catarsis abre de lunes a jueves de 12:00 PM a 11:00 PM, viernes y sábados de 12:00 PM a 1:00 AM, y domingos de 12:00 PM a 10:00 PM. Es ideal tanto para almuerzo como para salida nocturna."
        }
      },
      {
        "@type": "Question",
        "name": "¿Cuánto cuestan las hamburguesas en Catarsis?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Las hamburguesas en Catarsis tienen precios desde $3.99 USD. La carta incluye opciones como la Clásica Americana, Honeyholic, BBQ Champions, Smash, Texmex, Chicken Spicy, Onion Queen y Double Cheesy, todas preparadas con ingredientes premium."
        }
      }
    ]
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
