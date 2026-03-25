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
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 10.1833,
      "longitude": -64.6833
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
    "hasMenu": {
      "@type": "Menu",
      "url": "https://www.catarsiszone.com",
      "hasMenuSection": [
        {
          "@type": "MenuSection",
          "name": "Entradas",
          "description": "Alitas, tequeños, aros de cebolla, papas y más",
          "url": "https://www.catarsiszone.com/categoria/entradas"
        },
        {
          "@type": "MenuSection",
          "name": "Hamburguesas",
          "description": "Las mejores hamburguesas gourmet de Lechería: Clásica Americana, Honeyholic, BBQ Champions, Smash y más",
          "url": "https://www.catarsiszone.com/categoria/hamburguesas"
        },
        {
          "@type": "MenuSection",
          "name": "Emparedados",
          "description": "Emparedados premium como el Chicken Crunch Americano y Perla Negra",
          "url": "https://www.catarsiszone.com/categoria/emparedados"
        },
        {
          "@type": "MenuSection",
          "name": "Pizzas",
          "description": "Pizzas artesanales: Margarita, Pepperoni, Paradise, Tasty y Veggie",
          "url": "https://www.catarsiszone.com/categoria/pizzas"
        },
        {
          "@type": "MenuSection",
          "name": "Parrilla",
          "description": "Parrilla mixta, mar y tierra, lomito, mariscos y pollo",
          "url": "https://www.catarsiszone.com/categoria/parrilla"
        },
        {
          "@type": "MenuSection",
          "name": "Ensaladas",
          "description": "Ensaladas César clásica, con pollo y con langostinos",
          "url": "https://www.catarsiszone.com/categoria/ensaladas"
        },
        {
          "@type": "MenuSection",
          "name": "Coctelería",
          "description": "Cócteles de autor: Catarsis Punch, Margarita, Long Island, Sangría y más",
          "url": "https://www.catarsiszone.com/categoria/cocteleria"
        },
        {
          "@type": "MenuSection",
          "name": "Postres",
          "description": "Brownie con helado y Sweet Bites",
          "url": "https://www.catarsiszone.com/categoria/postres"
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
    ]
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
