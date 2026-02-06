import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product';
}

const BASE_URL = 'https://www.catarsiszone.com';
const SITE_NAME = 'Catarsis Drinks & Food';
const DEFAULT_DESCRIPTION = 'Restaurante en Lechería, Anzoátegui. Hamburguesas gourmet, pizzas artesanales, parrilla y coctelería de autor. Menú digital con delivery.';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

export const SEO = ({ 
  title = 'Menú Digital',
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  type = 'website'
}: SEOProps) => {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = url ? `${BASE_URL}${url}` : undefined;
  const ogImage = image || DEFAULT_IMAGE;
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={type} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter Card */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
};
