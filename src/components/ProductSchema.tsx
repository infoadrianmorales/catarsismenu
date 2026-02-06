interface ProductSchemaProps {
  name: string;
  description?: string;
  image?: string;
  priceUSD: number;
  slug: string;
  category: string;
  isAvailable?: boolean;
}

export const ProductSchema = ({ 
  name, 
  description, 
  image, 
  priceUSD, 
  slug, 
  category,
  isAvailable = true 
}: ProductSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description || `${name} en Catarsis Drinks & Food`,
    "image": image || "https://www.catarsiszone.com/og-image.jpg",
    "url": `https://www.catarsiszone.com/producto/${slug}`,
    "brand": {
      "@type": "Brand",
      "name": "Catarsis Drinks & Food"
    },
    "category": category,
    "offers": {
      "@type": "Offer",
      "price": priceUSD.toFixed(2),
      "priceCurrency": "USD",
      "availability": isAvailable 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Restaurant",
        "name": "Catarsis Drinks & Food",
        "url": "https://www.catarsiszone.com"
      }
    }
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
