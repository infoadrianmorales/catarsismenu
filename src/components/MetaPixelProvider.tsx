import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initMetaPixel, trackPageView } from '@/lib/metaPixel';
import { useViewMode } from '@/contexts/ViewModeContext';
import { useConfig } from '@/hooks/useConfig';

interface MetaPixelProviderProps {
  children: React.ReactNode;
}

export const MetaPixelProvider = ({ children }: MetaPixelProviderProps) => {
  const location = useLocation();
  const { mode } = useViewMode();
  const { config } = useConfig();
  const lastPathRef = useRef<string | null>(null);

  // Initialize pixel when config is available
  useEffect(() => {
    if (config.meta_pixel_enabled && config.meta_pixel_id) {
      initMetaPixel(config.meta_pixel_id);
    }
  }, [config.meta_pixel_enabled, config.meta_pixel_id]);

  // Track PageView on route changes
  useEffect(() => {
    if (lastPathRef.current !== null && lastPathRef.current !== location.pathname) {
      trackPageView(mode);
    }
    lastPathRef.current = location.pathname;
  }, [location.pathname, mode]);

  return <>{children}</>;
};
