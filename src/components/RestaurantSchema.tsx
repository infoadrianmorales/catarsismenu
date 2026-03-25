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
        // MENUSECTIONS ACTUALIZADAS — platos y precios reales marzo 2026
        {
          "@type": "MenuSection",
          "name": "Entradas",
          "description": "10 entradas desde $3.99 USD: Aros de Cebolla, Ración de Papas, Tequeños, Alitas de Pollo, Tenders de Pollo, Animal Fries y más",
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Hamburguesas",
          "description": "13 hamburguesas desde $7.99 USD: Double Cheesy, Chicken Mayo, Thousand Cheesy, Chicken Crunch, Chicken Spicy, Shrimp Crunch, Clásica Americana, Honeyholic Burger, Texmex, Onion Queen, BBQ Champions, Smash y Thousand Smash",
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Emparedados",
          "description": "4 emparedados desde $8.99 USD: Chicken Crunch Americano, Perla Negra, Chicken Cesar y Fondue de Lomito",
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Pizzas",
          "description": "6 pizzas desde $7.99 USD: Margarita, Pepperoni, Paradise, Hot Honey, Veggie y Tasty",
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Parrilla",
          "description": "5 opciones de parrilla desde $10.99 USD: Mixta, Pollo, Lomito, Mar y Tierra, Mariscos",
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Ensaladas",
          "description": "3 ensaladas César desde $7.49 USD: Clásica, con Pollo y con Langostinos",
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Coctelería",
          "description": "12 cócteles de autor desde $4.99 USD: Catarsis Punch, Spicy Tamarindo, Passion Fruit Mule, Long Island Tea, Margarita On the Rocks, Sangría y más",
          "url": "https://www.catarsiszone.com/menu"
        },
        {
          "@type": "MenuSection",
          "name": "Postres",
          "description": "2 postres desde $5.99 USD: Sweet Bites y Brownie con Helado",
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
    // MENTIONS ACTUALIZADOS — CARTA COMPLETA VERIFICADA MARZO 2026
    // Entidades nombradas para que ChatGPT, Perplexity y Gemini
    // puedan citar platos específicos de Catarsis con precios reales.
    // Actualizar cuando cambie la carta.
    "mentions": [
      { "@type": "MenuItem", "name": "Double Cheesy",
        "description": "Dos carnes smash 80g con doble queso y cebolla grillada caramelizada, $7.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Chicken Mayo",
        "description": "Pollo frito dorado con mayonesa artesanal, queso facilista y tocineta, $7.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Thousand Cheesy",
        "description": "Doble smash 80g con queso facilista, pepinillos y salsa Thousand Island, $8.50 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Chicken Crunch",
        "description": "Pollo ultra crujiente con cheddar, tocineta, pepinillos y tártara artesanal, $8.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Chicken Spicy",
        "description": "Pollo frito picante de la casa con cheddar, tocineta y vegetales frescos, $8.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Shrimp Crunch",
        "description": "Langostinos con rebozado crocante, reducción de balsámico y tártara, $8.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Clásica Americana",
        "description": "150g solomo con cheddar, tocineta, pepinillos, ketchup y mayonesa artesanal, $9.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Honeyholic Burger",
        "description": "Pollo crispy en miel con Cholula, cheddar y manchego fundidos, tocineta crujiente, $9.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Texmex Burger",
        "description": "150g solomo con jalapeños, cheddar, cebolla caramelizada y pimentón ahumado, $9.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Onion Queen",
        "description": "150g solomo con cebolla crunch, cheddar, tocineta y tártara artesanal, $9.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "BBQ Champions",
        "description": "150g solomo en BBQ de la casa con queso azul, champiñones y tocineta, $10.50 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Smash Burger",
        "description": "Doble smash 300g con doble cheddar, tocineta, pepinillos y vegetales frescos, $13.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Thousand Smash",
        "description": "Triple smash 300g con tres capas de cheddar, tocineta, pepinillos y Thousand Island, $13.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Chicken Crunch Americano",
        "description": "Emparedado de pollo empanizado con cheddar, tocineta, pepinillos y tártara, $8.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Perla Negra",
        "description": "Emparedado de calamares rebozados con tártara, pepinillos y vegetales frescos, $8.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Chicken Cesar",
        "description": "Emparedado de pollo crispy con aderezo césar, manchego y tocineta, $9.50 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Fondue de Lomito",
        "description": "Emparedado de lomito en fondue de queso azul con champiñones, el más gourmet, $11.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Hot Honey Pizza",
        "description": "Pizza con mozzarella, pepperoni y miel picante, $9.50 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Catarsis Punch",
        "description": "Cóctel de ron añejo con parchita y naranja, $4.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Long Island Tea",
        "description": "Cinco licores blancos con limón y Coca-Cola, $4.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Margarita On the Rocks",
        "description": "Tequila con Triple Sec y limón, $4.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Sangría",
        "description": "Vino cabernet con ponsigué y frutas cítricas, $4.99 USD. Catarsis Lechería" },
      { "@type": "MenuItem", "name": "Spicy Tamarindo",
        "description": "Vodka tamarindo con limón y ají dulce, $4.99 USD. Catarsis Lechería" },
      { "@type": "Thing", "name": "Delivery Lechería",
        "description": "Catarsis ofrece delivery en Lechería, Anzoátegui" },
      { "@type": "Thing", "name": "Vida nocturna Lechería",
        "description": "Catarsis abre hasta 1 AM viernes y sábados en CC Aventura Plaza" }
    ]
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
