// [2026-05-02] CATARSIS — useVisitorTracker
// Propósito: Hook cliente que registra cada navegación SPA en page_views (INSERT directo)
// y enriquece con país/ciudad de forma asíncrona vía ipwho.is.
// Modificaciones: Migrado de invocar la edge function track-visit a un flujo client-side puro.
// Añadidas detectSource() (UTM > referrer) y getGeoData() (ipwho.is, sin API key).
// Tras INSERT se hace UPDATE en background con country/city; los UTM siguen
// persistiéndose en sessionStorage para conservar atribución durante la sesión.
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
  // Necesario para que la policy "Owner can patch geo within 5 minutes"
  // pueda hacer match con get_client_session_id() en el UPDATE de geo.
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

// [2026-05-02] Geolocalización por IP usando ipwho.is (gratuita, sin API key, HTTPS).
// Si falla, la visita ya quedó registrada — solo se omite country/city.
async function getGeoData(): Promise<{ country: string | null; city: string | null }> {
  try {
    const res = await fetch('https://ipwho.is/');
    const data = await res.json();
    if (data.success === false) return { country: null, city: null };
    return {
      country: data.country ?? null,
      city: data.city ?? null,
    };
  } catch {
    return { country: null, city: null };
  }
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
      lastTrackedPath.current = path;

      try {
        const session_id = getSessionId();
        const utm = captureUtm();
        const source = detectSource();

        // [2026-05-02] a) INSERT inmediato a page_views — no bloqueamos por la geo.
        // Se persiste source y UTM ya resueltos para no perder atribución si la geo falla.
        const { data, error } = await supabase
          .from('page_views')
          .insert({
            session_id,
            path,
            referrer: document.referrer || null,
            user_agent: navigator.userAgent || null,
            source,
            utm_source: utm.utm_source || null,
            utm_medium: utm.utm_medium || null,
            utm_campaign: utm.utm_campaign || null,
          })
          .select('id')
          .single();

        if (error || !data?.id) return;

        // [2026-05-02] b) Enriquecimiento asíncrono con país/ciudad vía ipwho.is.
        // El UPDATE solo prospera si la policy "Owner can patch geo within 5 minutes"
        // y el trigger guard_page_views_update() lo permiten (sólo country/city).
        getGeoData().then(({ country, city }) => {
          if (!country) return;
          supabase
            .from('page_views')
            .update({ country, city })
            .eq('id', data.id)
            .then(() => {
              // silent — fallar aquí solo significa perder geo de esta visita
            });
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
