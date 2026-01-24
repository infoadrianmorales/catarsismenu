import { useState, useRef, useEffect, memo } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
}

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
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver();

  const shouldLoad = loading === 'eager' || isIntersecting;

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  return (
    <div ref={ref} className={cn("relative overflow-hidden bg-muted/20", containerClassName)}>
      {/* Placeholder skeleton */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted/30" />
      )}
      
      {/* Actual image - only renders when in viewport */}
      {shouldLoad && (
        <img
          src={error ? '/placeholder.svg' : src}
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
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';
