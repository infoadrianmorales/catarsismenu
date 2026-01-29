import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useConfig } from '@/hooks/useConfig';
import { initMetaPixel, trackPageView, isPixelInitialized } from '@/lib/metaPixel';
import { useViewMode } from '@/contexts/ViewModeContext';

interface MetaPixelProviderProps {
  children: React.ReactNode;
}

export const MetaPixelProvider = ({ children }: MetaPixelProviderProps) => {
  const { config, loading } = useConfig();
  const location = useLocation();
  const { mode } = useViewMode();
  const lastPathRef = useRef<string | null>(null);

  // Initialize Meta Pixel when config is loaded
  useEffect(() => {
    if (loading) return;
    
    const pixelId = config.meta_pixel_id;
    const isEnabled = config.meta_pixel_enabled;
    
    if (pixelId && isEnabled && !isPixelInitialized()) {
      initMetaPixel(pixelId);
      // Track initial PageView with mode
      trackPageView(mode);
      lastPathRef.current = location.pathname;
    }
  }, [loading, config.meta_pixel_id, config.meta_pixel_enabled, location.pathname, mode]);

  // Track PageView on route changes
  useEffect(() => {
    if (!isPixelInitialized()) return;
    
    // Only track if path actually changed
    if (lastPathRef.current !== location.pathname) {
      trackPageView(mode);
      lastPathRef.current = location.pathname;
    }
  }, [location.pathname, mode]);

  return <>{children}</>;
};
