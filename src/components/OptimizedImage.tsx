import { useState, useRef, useEffect, memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ImageVariant } from '@/lib/imageProcessor';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  /** Preferred variant size: 'thumb' (200px), 'card' (400px), 'full' (800px) */
  variant?: ImageVariant;
  /** Custom sizes attribute for srcset */
  sizes?: string;
}

// Check if URL is from our product storage
const isProductStorageUrl = (url: string): boolean => {
  return url.includes('/product-images/products/') || url.includes('product-images/products');
};

// Parse product image URL to get base path and detect format
const parseProductUrl = (url: string): { basePath: string; isWebP: boolean; queryString: string } | null => {
  if (!isProductStorageUrl(url)) return null;
  
  // Extract query string if present (for cache busting)
  const queryMatch = url.match(/(\?.*)?$/);
  const queryString = queryMatch?.[1] || '';
  
  // Remove query string for parsing
  const cleanUrl = url.replace(/\?.*$/, '');
  
  // Match patterns like: slug.webp, slug_400.webp, slug.jpg, slug_400.jpg
  const match = cleanUrl.match(/\/products\/([^/]+?)(_\d+)?\.(webp|jpg|jpeg)$/i);
  if (!match) return null;
  
  const [, slug, , format] = match;
  const isWebP = format.toLowerCase() === 'webp';
  
  // Extract base URL (everything before /products/)
  const baseUrlMatch = cleanUrl.match(/^(.+\/products\/)/);
  if (!baseUrlMatch) return null;
  
  return {
    basePath: `${baseUrlMatch[1]}${slug}`,
    isWebP,
    queryString,
  };
};

// Mobile-friendly Intersection Observer with fallbacks
const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Fallback 1: If IntersectionObserver not supported, load immediately
    if (typeof IntersectionObserver === 'undefined') {
      setIsIntersecting(true);
      return;
    }

    // Fallback 2: Safety timer for mobile browsers that may not fire observer
    const safetyTimer = setTimeout(() => {
      setIsIntersecting(true);
    }, 1200);

    // Fallback 3: Check if already in viewport on mount
    const rect = element.getBoundingClientRect();
    const inViewport = rect.top < window.innerHeight + 200 && rect.bottom > -200;
    if (inViewport) {
      setIsIntersecting(true);
      clearTimeout(safetyTimer);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        clearTimeout(safetyTimer);
        observer.disconnect();
      }
    }, { rootMargin: '200px', threshold: 0.01, ...options });

    observer.observe(element);
    return () => {
      clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, []);

  return { ref, isIntersecting };
};

{/* OPTIMIZACIÓN DE PERFORMANCE — OptimizedImage
    Cambios aplicados:
    - width y height en todas las etiquetas <img> para evitar CLS
    - Atributos loading y decoding ya existían
    CLS (Cumulative Layout Shift): cuando una imagen carga
    tarde y empuja el contenido hacia abajo — afecta la
    experiencia del usuario y el score de Google PageSpeed. */}
export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className,
  containerClassName,
  loading = 'lazy',
  onLoad,
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [fallbackToOriginal, setFallbackToOriginal] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver();
  const safeSrc = src?.trim() || '/placeholder.svg';

  const shouldLoad = loading === 'eager' || isIntersecting;

  // [2026-07-22] RESILIENCIA IMÁGENES: si cambia el src (carruseles/fallbacks),
  // reiniciar estado para no dejar una imagen nueva marcada como error previo.
  useEffect(() => {
    setLoaded(false);
    setError(false);
    setFallbackToOriginal(false);
  }, [safeSrc]);

  // Calculate responsive image data
  const imageData = useMemo(() => {
    const parsed = parseProductUrl(safeSrc);
    
    if (!parsed) {
      // Not a product image or can't parse - use original src
      return { 
        src: safeSrc, 
        srcSet: undefined, 
        sizes: undefined,
        usesPicture: false,
      };
    }

    // For JPEG (legacy images), use original URL directly without variants
    if (!parsed.isWebP) {
      return { 
        src: safeSrc, 
        srcSet: undefined, 
        sizes: undefined,
        usesPicture: false,
      };
    }

    // [2026-07-22] Muchas imágenes recientes se guardan como WebP único
    // optimizado, sin variantes _200/_400. Usar la URL original evita requests
    // 404 y placeholders intermitentes en móvil/carrito.
    return {
      src: safeSrc,
      srcSet: undefined,
      sizes: undefined,
      usesPicture: false,
    };
  }, [safeSrc]);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    // [2026-07-22] Si falla una variante generada (_200/_400), intentar primero
    // con la URL original guardada en Cloud antes de mostrar placeholder.
    if (imageData.usesPicture && !fallbackToOriginal && imageData.src !== safeSrc) {
      setFallbackToOriginal(true);
      setLoaded(false);
      return;
    }
    setError(true);
    setLoaded(true);
  };

  // Fallback: variante optimizada → original → placeholder.
  const displaySrc = error ? '/placeholder.svg' : fallbackToOriginal ? safeSrc : imageData.src;
  const shouldUsePicture = imageData.usesPicture && !error && !fallbackToOriginal;

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-muted/20", containerClassName)}>
      {/* Placeholder skeleton */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted/30" />
      )}
      
      {/* Actual image - only renders when in viewport */}
      {shouldLoad && (
        shouldUsePicture ? (
          <picture>
            {/* WebP source with srcset */}
            {imageData.srcSet && (
              <source
                type="image/webp"
                srcSet={imageData.srcSet}
                sizes={imageData.sizes}
              />
            )}
            {/* Fallback img */}
            <img
              src={displaySrc}
              alt={alt}
              loading={loading}
              decoding="async"
              width="400"
              height="400"
              onLoad={handleLoad}
              onError={handleError}
              className={cn(
                "transition-opacity duration-150",
                loaded ? "opacity-100" : "opacity-0",
                className
              )}
            />
          </picture>
        ) : (
          <img
            src={displaySrc}
            alt={alt}
            loading={loading}
            decoding="async"
            width="400"
            height="400"
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-150",
              loaded ? "opacity-100" : "opacity-0",
              className
            )}
          />
        )
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
