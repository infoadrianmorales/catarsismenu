// [2026-05-02] CATARSIS — useVisitorTracker
// Propósito: Hook cliente que registra cada navegación SPA invocando la edge function track-visit.
// Modificaciones: Se reemplazó el insert directo a page_views por supabase.functions.invoke('track-visit'); se añadió captureUtm() para persistir utm_source/medium/campaign en sessionStorage y reenviarlos en cada vista.
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
  setSupabaseSessionHeader(sessionId);
  return sessionId;
};

// [2026-05-02] Persistir UTM en sessionStorage para que cualquier vista posterior
// dentro de la sesión conserve la atribución original.
const captureUtm = () => {
  const params = new URLSearchParams(window.location.search);
  const utm_source = params.get('utm_source');
  const utm_medium = params.get('utm_medium');
  const utm_campaign = params.get('utm_campaign');
  if (utm_source || utm_medium || utm_campaign) {
    sessionStorage.setItem('visitor_utm', JSON.stringify({ utm_source, utm_medium, utm_campaign }));
  }
  const stored = sessionStorage.getItem('visitor_utm');
  return stored ? JSON.parse(stored) : { utm_source: null, utm_medium: null, utm_campaign: null };
};

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
      lastTrackedPath.current = path;

      try {
        const utm = captureUtm();
        await supabase.functions.invoke('track-visit', {
          body: {
            session_id: getSessionId(),
            path,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent || null,
            ...utm,
          },
        });
      } catch {
        // Silent fail - don't break the app for analytics
      }
    }, 1000);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [location.pathname]);
};
