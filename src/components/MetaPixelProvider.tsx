import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/lib/metaPixel';
import { useViewMode } from '@/contexts/ViewModeContext';

interface MetaPixelProviderProps {
  children: React.ReactNode;
}

export const MetaPixelProvider = ({ children }: MetaPixelProviderProps) => {
  const location = useLocation();
  const { mode } = useViewMode();
  const lastPathRef = useRef<string | null>(null);

  // Track PageView on route changes (initial PageView is fired in index.html)
  useEffect(() => {
    if (lastPathRef.current !== null && lastPathRef.current !== location.pathname) {
      trackPageView(mode);
    }
    lastPathRef.current = location.pathname;
  }, [location.pathname, mode]);

  return <>{children}</>;
};
