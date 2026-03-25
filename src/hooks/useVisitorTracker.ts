import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { setSupabaseSessionHeader } from '@/lib/supabaseHeaders';

const EXCLUDED_PATHS = ['/admin', '/auth'];

// SEGURIDAD [C9]: session_id para analytics debe ser UUID v4 válido.
// Se configura también el header x-session-id para consistencia con RLS.
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  setSupabaseSessionHeader(sessionId);
  return sessionId;
};

export const useVisitorTracker = () => {
  const location = useLocation();
  const lastTrackedPath = useRef<string>('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const path = location.pathname;

    // Skip excluded paths
    if (EXCLUDED_PATHS.some(excluded => path.startsWith(excluded))) return;

    // Skip if same path (avoid duplicate on re-renders)
    if (path === lastTrackedPath.current) return;

    // Debounce to avoid rapid duplicate inserts
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      lastTrackedPath.current = path;

      try {
        await supabase.from('page_views' as any).insert({
          session_id: getSessionId(),
          path,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
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
