export const LocalBusinessSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    "name": "Catarsis Drinks & Food",
    "alternateName": ["Catarsis Lechería", "Catarsis Restaurant"],
    "description": "Restaurante de hamburguesas gourmet y bar de coctelería en Lechería, Anzoátegui. Especialidad en hamburguesas, pizzas artesanales, emparedados y coctelería de autor. El mejor spot para almorzar y disfrutar la noche.",
    "url": "https://www.catarsiszone.com",
    "telephone": "+58 424-905-6438",
    "email": "info@catarsiszone.com",
    "image": "https://www.catarsiszone.com/og-image.jpg",
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
    "areaServed": {
      "@type": "City",
      "name": "Lechería",
      "containedInPlace": {
        "@type": "State",
        "name": "Anzoátegui",
        "containedInPlace": {
          "@type": "Country",
          "name": "Venezuela"
        }
      }
    },
    "slogan": "Sabores que liberan, momentos que conectan",
    "knowsAbout": [
      "Hamburguesas gourmet",
      "Pizzas artesanales",
      "Coctelería de autor",
      "Gastronomía en Lechería",
      "Vida nocturna Lechería",
      "Restaurantes en Anzoátegui"
    ],
    "keywords": "hamburguesas lechería, restaurante lechería, pizzas lechería, coctelería lechería, bar lechería, donde comer lechería, delivery lechería, restaurante nocturno lechería, emparedados lechería, parrilla lechería",
    "sameAs": [
      "https://instagram.com/catarsislecheria",
      "https://www.facebook.com/Catarsis.ve/",
      "https://www.tiktok.com/@catarsis.lecheria",
      "https://www.youtube.com/@CatarsisLecheria"
    ]
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
