import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initMetaPixel, trackPageView } from '@/lib/metaPixel';
import { useViewMode } from '@/contexts/ViewModeContext';
import { useConfig } from '@/hooks/useConfig';

interface MetaPixelProviderProps {
  children: React.ReactNode;
}

/**
 * [2026-06-10] Pixel inicialización + PageView por ruta.
 * Antes: initMetaPixel disparaba un PageView y este provider disparaba otro
 * en cada cambio de ruta (excepto el primero) → duplicados/huecos.
 * Ahora: init NO dispara PageView; el provider lo dispara SIEMPRE en cada
 * pathname, incluyendo el primer render.
 */
export const MetaPixelProvider = ({ children }: MetaPixelProviderProps) => {
  const location = useLocation();
  const { mode } = useViewMode();
  const { config } = useConfig();
  const lastPathRef = useRef<string | null>(null);

  // Inicializar pixel cuando llega la config
  useEffect(() => {
    if (config.meta_pixel_enabled && config.meta_pixel_id) {
      initMetaPixel(config.meta_pixel_id);
    }
  }, [config.meta_pixel_enabled, config.meta_pixel_id]);

  // PageView en cada cambio de ruta (incluida la primera vez)
  useEffect(() => {
    if (lastPathRef.current === location.pathname) return;
    trackPageView(mode);
    lastPathRef.current = location.pathname;
  }, [location.pathname, mode]);

  return <>{children}</>;
};
