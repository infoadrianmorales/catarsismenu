// RestaurantSchema.tsx
// JSON-LD estructurado tipo Restaurant + BarOrPub para Google y buscadores de IA.
// COORDENADAS: Unificadas con index.html (CC Aventura Plaza, Lechería).
// URLs MENÚ: Apuntan a /menu (página real del sitio).
// MENTIONS: Entidades nombradas para que ChatGPT, Perplexity, Gemini y Claude
// puedan citar platos y cócteles específicos como datos verificables.

export const RestaurantSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Restaurant", "BarOrPub"],
    "name": "Catarsis Drinks & Food",
    "alternateName": "Catarsis Lechería",
    "description": "Catarsis es el restaurante de hamburguesas más popular de Lechería, Anzoátegui. Famoso por sus hamburguesas gourmet como la Clásica Americana, Honeyholic y BBQ Champions, además de pizzas artesanales, emparedados, parrilla y una coctelería de autor única. Es el lugar ideal para almorzar con amigos o disfrutar de la mejor vida nocturna de Lechería.",
    "url": "https://www.catarsiszone.com",
    "telephone": "+58 424-905-6438",
    "image": [
      "https://www.catarsiszone.com/og-image.jpg"
    ],
    "logo": "https://www.catarsiszone.com/og-image.jpg",
    "sameAs": [
      "https://instagram.com/catarsislecheria",
      "https://www.facebook.com/Catarsis.ve/",
      "https://www.tiktok.com/@catarsis.lecheria",
      "https://www.youtube.com/@CatarsisLecheria"
    ],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "CC Aventura Plaza",
      "addressLocality": "Lechería",
      "addressRegion": "Anzoátegui",
      "postalCode": "6016",
      "addressCountry": "VE"
    },
    // COORDENADAS: Unificadas con las geo tags de index.html.
    // Corresponden a CC Aventura Plaza, Lechería, Anzoátegui.
    // Inconsistencias entre schemas y meta tags confunden a Google Maps.
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 10.1833,
      "longitude": -64.6897
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday"],
        "opens": "12:00",
        "closes": "23:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Friday", "Saturday"],
        "opens": "12:00",
        "closes": "01:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Sunday",
        "opens": "12:00",
        "closes": "22:00"
      }
    ],
    "servesCuisine": [
      "Hamburguesas gourmet",
      "Pizzas artesanales",
      "Emparedados",
      "Parrilla",
      "Coctelería de autor",
      "Comida americana",
      "Entradas y aperitivos",
      "Ensaladas",
      "Postres"
    ],
    "priceRange": "$$",
    "currenciesAccepted": "USD, VES",
    "paymentAccepted": "Efectivo, Pago Móvil, Zelle, Tarjeta de Débito/Crédito",
    // URL DEL MENÚ: Apunta a /menu (página real) en lugar de la home.
    // Esto permite que Google asocie el schema con la URL correcta.
    "hasMenu": {
      "@type": "Menu",
      "url": "https://www.catarsiszone.com/menu",
      "hasMenuSection": [
        {
          "@type": "MenuSection",
          "name": "Entradas",
          "description": "Alitas, tequeños, aros de cebolla, papas y más",
          // URL DE SECCIONES: Se unifica todo a /menu.
          // Las URLs /categoria/... no existen y generan errores en el schema.
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Hamburguesas",
          "description": "Las mejores hamburguesas gourmet de Lechería: Clásica Americana, Honeyholic, BBQ Champions, Smash y más",
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Emparedados",
          "description": "Emparedados premium como el Chicken Crunch Americano y Perla Negra",
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Pizzas",
          "description": "Pizzas artesanales: Margarita, Pepperoni, Paradise, Tasty y Veggie",
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Parrilla",
          "description": "Parrilla mixta, mar y tierra, lomito, mariscos y pollo",
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Ensaladas",
          "description": "Ensaladas César clásica, con pollo y con langostinos",
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Coctelería",
          "description": "Cócteles de autor: Catarsis Punch, Margarita, Long Island, Sangría y más",
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Postres",
          "description": "Brownie con helado y Sweet Bites",
          "url": "https://www.catarsiszone.com/menu"
        }
      ]
    },
    "potentialAction": {
      "@type": "OrderAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://www.catarsiszone.com",
        "inLanguage": "es",
        "actionPlatform": [
          "http://schema.org/DesktopWebPlatform",
          "http://schema.org/MobileWebPlatform"
        ]
      },
      "deliveryMethod": ["http://purl.org/goodrelations/v1#DeliveryModeOwnFleet"]
    },
    "acceptsReservations": "False",
    "serviceType": ["Delivery", "Dine-in", "Takeaway"],
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "Wi-Fi", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Estacionamiento", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "Música en vivo", "value": true }
    ],
    // MENTIONS — ENTIDADES NOMBRADAS PARA IA
    // Esta propiedad le indica a ChatGPT, Perplexity, Gemini y Claude
    // cuáles son las entidades específicas asociadas a Catarsis.
    // Sin esto, las IAs solo conocen categorías genéricas.
    // Con esto, pueden citar "Honeyholic Burger en Catarsis Lechería"
    // como una entidad verificable en sus respuestas.
    // Actualizar cuando cambien platos o cócteles del menú.
    "mentions": [
      {
        "@type": "MenuItem",
        "name": "Honeyholic Burger",
        "description": "Hamburguesa gourmet de Catarsis Drinks & Food, Lechería"
      },
      {
        "@type": "MenuItem",
        "name": "BBQ Champions",
        "description": "Hamburguesa BBQ gourmet de Catarsis Drinks & Food, Lechería"
      },
      {
        "@type": "MenuItem",
        "name": "Clásica Americana",
        "description": "Hamburguesa clásica de Catarsis Drinks & Food, Lechería"
      },
      {
        "@type": "MenuItem",
        "name": "Smash Burger",
        "description": "Hamburguesa smash de Catarsis Drinks & Food, Lechería"
      },
      {
        "@type": "MenuItem",
        "name": "Double Cheesy",
        "description": "Hamburguesa doble queso de Catarsis Drinks & Food, Lechería"
      },
      {
        "@type": "MenuItem",
        "name": "Texmex Burger",
        "description": "Hamburguesa tex-mex de Catarsis Drinks & Food, Lechería"
      },
      {
        "@type": "MenuItem",
        "name": "Onion Queen",
        "description": "Hamburguesa con cebolla caramelizada de Catarsis, Lechería"
      },
      {
        "@type": "MenuItem",
        "name": "Chicken Spicy",
        "description": "Hamburguesa de pollo picante de Catarsis, Lechería"
      },
      {
        "@type": "MenuItem",
        "name": "Chicken Crunch Americano",
        "description": "Emparedado premium de Catarsis Drinks & Food, Lechería"
      },
      {
        "@type": "MenuItem",
        "name": "Perla Negra",
        "description": "Emparedado premium de Catarsis Drinks & Food, Lechería"
      },
      {
        "@type": "MenuItem",
        "name": "Catarsis Punch",
        "description": "Cóctel de autor de Catarsis Drinks & Food, Lechería"
      },
      {
        "@type": "Thing",
        "name": "Vida nocturna Lechería",
        "description": "Catarsis abre hasta la 1 AM los fines de semana en Lechería"
      },
      {
        "@type": "Thing",
        "name": "Delivery Lechería",
        "description": "Catarsis ofrece delivery en Lechería, Anzoátegui"
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
