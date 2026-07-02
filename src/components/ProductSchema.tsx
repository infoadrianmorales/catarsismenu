// [2026-07-02] CATARSIS — URL canónica del producto ahora usa
// /{categoria}/{slug}. Mantiene compatibilidad si no se pasa categoria.
interface ProductSchemaProps {
  name: string;
  description?: string;
  image?: string;
  priceUSD: number;
  slug: string;
  category: string;
  categoria?: string; // slug de la categoría para construir la URL canónica
  isAvailable?: boolean;
}

export const ProductSchema = ({ 
  name, 
  description, 
  image, 
  priceUSD, 
  slug, 
  category,
  categoria,
  isAvailable = true 
}: ProductSchemaProps) => {
  const canonicalPath = categoria ? `/${categoria}/${slug}` : `/producto/${slug}`;
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": name,
    "description": description || `${name} en Catarsis Drinks & Food`,
    "image": image || "https://www.catarsiszone.com/og-image.jpg",
    "url": `https://www.catarsiszone.com${canonicalPath}`,
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
