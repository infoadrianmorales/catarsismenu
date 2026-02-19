import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product';
  noindex?: boolean;
}

const BASE_URL = 'https://www.catarsiszone.com';
const SITE_NAME = 'Catarsis Drinks & Food';
const DEFAULT_DESCRIPTION = 'Catarsis es el restaurante de hamburguesas más popular de Lechería, Anzoátegui. Hamburguesas gourmet, pizzas artesanales, emparedados, parrilla y coctelería de autor. Ideal para almorzar o disfrutar la noche. ¡Pide delivery!';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

export const SEO = ({ 
  title = 'Menú Digital',
  description = DEFAULT_DESCRIPTION,
  image,
  url,
  type = 'website',
  noindex = false
}: SEOProps) => {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const canonicalUrl = url ? `${BASE_URL}${url}` : undefined;
  const ogImage = image || DEFAULT_IMAGE;
  const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1';
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robotsContent} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="es_VE" />
      <meta property="og:site_name" content={SITE_NAME} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@catarsislecheria" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
};
