export const RestaurantSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Catarsis Drinks & Food",
    "description": "Restaurante en Lechería, Anzoátegui. Hamburguesas gourmet, pizzas artesanales, parrilla y coctelería de autor.",
    "url": "https://www.catarsiszone.com",
    "telephone": "+58 424-905-6438",
    "image": "https://www.catarsiszone.com/og-image.jpg",
    "logo": "https://www.catarsiszone.com/og-image.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "CC Costa Mar, Local 7",
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
    "servesCuisine": ["Hamburguesas", "Pizzas", "Parrilla", "Coctelería", "Comida Americana"],
    "priceRange": "$$ (Desde $3.99)",
    "currenciesAccepted": "USD, VES",
    "paymentAccepted": "Efectivo, Pago Móvil, Zelle, Tarjeta de Débito/Crédito",
    "hasMenu": {
      "@type": "Menu",
      "url": "https://www.catarsiszone.com",
      "hasMenuSection": [
        {
          "@type": "MenuSection",
          "name": "Hamburguesas",
          "url": "https://www.catarsiszone.com/categoria/hamburguesas"
        },
        {
          "@type": "MenuSection",
          "name": "Pizzas",
          "url": "https://www.catarsiszone.com/categoria/pizzas"
        },
        {
          "@type": "MenuSection",
          "name": "Parrilla",
          "url": "https://www.catarsiszone.com/categoria/parrilla"
        },
        {
          "@type": "MenuSection",
          "name": "Coctelería",
          "url": "https://www.catarsiszone.com/categoria/cocteleria"
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
    "serviceType": ["Delivery", "Dine-in", "Takeaway"]
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
