export const RestaurantSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Catarsis Drinks & Food",
    "description": "Sabores que liberan, momentos que conectan",
    "url": "https://www.catarsiszone.com",
    "telephone": "+58 424-905-6438",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Lechería",
      "addressRegion": "Anzoátegui",
      "addressCountry": "VE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 10.1833,
      "longitude": -64.6833
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday", 
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "12:00",
      "closes": "01:00"
    },
    "servesCuisine": ["Hamburguesas", "Pizzas", "Parrilla", "Coctelería"],
    "priceRange": "Desde $3.99",
    "hasMenu": "https://www.catarsiszone.com"
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
