import { useState, useRef, useEffect, memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { IMAGE_SIZES, ImageVariant } from '@/lib/imageProcessor';

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
const parseProductUrl = (url: string): { basePath: string; isWebP: boolean; hasVariants: boolean } | null => {
  if (!isProductStorageUrl(url)) return null;
  
  // Match patterns like: slug.webp, slug_400.webp, slug.jpg, slug_400.jpg
  const match = url.match(/\/products\/([^/?]+?)(_\d+)?\.(webp|jpg|jpeg)(\?.*)?$/i);
  if (!match) return null;
  
  const [, slug, , format] = match;
  const isWebP = format.toLowerCase() === 'webp';
  
  // Extract base URL (everything before /products/)
  const baseUrlMatch = url.match(/^(.+\/products\/)/);
  if (!baseUrlMatch) return null;
  
  return {
    basePath: `${baseUrlMatch[1]}${slug}`,
    isWebP,
    hasVariants: true,
  };
};

// Generate srcset for responsive images
const generateSrcSet = (basePath: string, format: 'webp' | 'jpg'): string => {
  const ext = format;
  return `${basePath}_200.${ext} 200w, ${basePath}_400.${ext} 400w, ${basePath}.${ext} 800w`;
};

// Intersection Observer for lazy loading
const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.disconnect();
      }
    }, { rootMargin: '100px', threshold: 0.01, ...options });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isIntersecting };
};

export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className,
  containerClassName,
  loading = 'lazy',
  onLoad,
  variant = 'card',
  sizes,
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver();

  const shouldLoad = loading === 'eager' || isIntersecting;

  // Calculate responsive image data
  const imageData = useMemo(() => {
    const parsed = parseProductUrl(src);
    
    if (!parsed) {
      // Not a product image or can't parse - use original src
      return { 
        src, 
        srcSet: undefined, 
        sizes: undefined,
        usesPicture: false,
      };
    }

    const format = parsed.isWebP ? 'webp' : 'jpg';
    const srcSet = generateSrcSet(parsed.basePath, format);
    
    // Default sizes based on variant
    const defaultSizes = variant === 'thumb' 
      ? '100px' 
      : variant === 'card' 
        ? '(max-width: 640px) 150px, 185px' 
        : '400px';

    // Get the appropriate variant URL
    const variantSize = IMAGE_SIZES[variant];
    const variantSrc = variantSize === 800 
      ? `${parsed.basePath}.${format}`
      : `${parsed.basePath}_${variantSize}.${format}`;

    return {
      src: variantSrc,
      srcSet,
      sizes: sizes || defaultSizes,
      usesPicture: true,
      format,
      basePath: parsed.basePath,
    };
  }, [src, variant, sizes]);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  // Fallback to original src on error
  const displaySrc = error ? '/placeholder.svg' : imageData.src;

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-muted/20", containerClassName)}>
      {/* Placeholder skeleton */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted/30" />
      )}
      
      {/* Actual image - only renders when in viewport */}
      {shouldLoad && (
        imageData.usesPicture && !error ? (
          <picture>
            {/* WebP source with srcset */}
            {imageData.format === 'webp' && imageData.srcSet && (
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
              onLoad={handleLoad}
              onError={handleError}
              className={cn(
                "transition-opacity duration-300",
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
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
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
