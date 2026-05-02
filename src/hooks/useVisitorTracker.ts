// [2026-05-02] CATARSIS — useVisitorTracker
// Propósito: Hook cliente que registra cada navegación SPA en page_views.
// Modificaciones: Migrado a invocar la edge function `track-visit`, que resuelve
// país/ciudad desde la IP real del visitante (lado servidor). El INSERT directo
// en cliente quedó obsoleto porque la geo client-side fallaba (CORS / adblockers /
// timeout) y todas las visitas entraban con country = null.
// El hook sigue detectando source y UTM en cliente y los persiste en sessionStorage.
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { setSupabaseSessionHeader } from '@/lib/supabaseHeaders';

const EXCLUDED_PATHS = ['/admin', '/auth'];

// SEGURIDAD [C9]: session_id para analytics debe ser UUID v4 válido.
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  // Header global para que otros flujos (checkout, RPC) puedan validar la sesión.
  setSupabaseSessionHeader(sessionId);
  return sessionId;
};

// [2026-05-02] Persistir UTM en sessionStorage para que cualquier vista posterior
// dentro de la sesión conserve la atribución original aunque la URL ya no los tenga.
const captureUtm = () => {
  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get('utm_source');
  const utm_medium = params.get('utm_medium');
  const utm_campaign = params.get('utm_campaign');
  if (utm_source || utm_medium || utm_campaign) {
    sessionStorage.setItem('visitor_utm', JSON.stringify({ utm_source, utm_medium, utm_campaign }));
  }
  const stored = sessionStorage.getItem('visitor_utm');
  return stored
    ? JSON.parse(stored)
    : { utm_source: null, utm_medium: null, utm_campaign: null };
};

// [2026-05-02] Detecta la fuente de tráfico de forma síncrona.
// Prioridad: UTM > referrer > 'Directo'.
function detectSource(): string {
  const params = new URLSearchParams(window.location.search);
  const utmSource = params.get('utm_source')?.toLowerCase() ?? '';
  const referrer = (document.referrer ?? '').toLowerCase();

  if (utmSource) {
    if (
      utmSource.includes('facebook') ||
      utmSource.includes('instagram') ||
      utmSource.includes('meta')
    ) {
      return 'Meta Ads';
    }
    if (utmSource.includes('google')) return 'Google';
    return utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
  }

  if (!referrer) return 'Directo';
  if (referrer.includes('google')) return 'Google';
  if (referrer.includes('facebook') || referrer.includes('instagram')) return 'Meta';
  if (referrer.includes('bing')) return 'Bing';
  return 'Otros';
}

export const useVisitorTracker = () => {
  const location = useLocation();
  const lastTrackedPath = useRef<string>('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const path = location.pathname;

    if (EXCLUDED_PATHS.some(excluded => path.startsWith(excluded))) return;
    if (path === lastTrackedPath.current) return;

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      // [2026-05-02] FIX: tracking ahora va por edge function `track-visit`.
      // Razón: la geo client-side (ipwho.is desde el navegador) fallaba en
      // ~100% de los casos por CORS / adblockers / timeout y las visitas
      // entraban con country = null. Resolver la IP del lado servidor es
      // confiable y no depende del navegador del visitante.
      lastTrackedPath.current = path;

      try {
        const session_id = getSessionId();
        const utm = captureUtm();
        const source = detectSource();

        await supabase.functions.invoke('track-visit', {
          body: {
            session_id,
            path,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent || null,
            source,
            utm_source: utm.utm_source || null,
            utm_medium: utm.utm_medium || null,
            utm_campaign: utm.utm_campaign || null,
          },
        });
      } catch {
        // Silent fail — analytics nunca debe romper la app.
      }
    }, 1000);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [location.pathname]);
};
