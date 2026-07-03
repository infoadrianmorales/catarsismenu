/**
 * Meta CAPI — cliente ligero que duplica cada evento del Pixel a la
 * Edge Function `meta-capi`. Nunca envía el access token: ese vive solo
 * en el servidor. El hashing de PII también ocurre en el servidor.
 *
 * NOTA testing: mientras validamos con "Probar eventos" en Events Manager,
 * CAPI_TEST_EVENT_CODE se adjunta a cada request. QUITAR ANTES DE PUBLICAR
 * EN PRODUCCIÓN DEFINITIVA (poner a null).
 */
import { supabase } from '@/integrations/supabase/client';

const CAPI_TEST_EVENT_CODE: string | null = 'TEST71445';

type CapiEventName = 'PageView' | 'ViewContent' | 'Lead' | 'AddToCart' | 'InitiateCheckout' | 'Search' | 'Purchase';

interface CapiUserData {
  email?: string;
  phone?: string;
  fn?: string;
  ln?: string;
  ct?: string;
  st?: string;
  country?: string;
  external_id?: string;
  fbc?: string;
  fbp?: string;
}

interface SendCapiArgs {
  event_name: CapiEventName;
  event_id: string;
  custom_data?: Record<string, unknown>;
  user_data?: CapiUserData;
}

const readCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined;
  const m = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return m ? decodeURIComponent(m[1]) : undefined;
};

const getFbCookies = () => ({
  fbc: readCookie('_fbc'),
  fbp: readCookie('_fbp'),
});

const getUserDataFromSession = (): CapiUserData => {
  try {
    const raw = sessionStorage.getItem('pendingCheckoutData');
    if (!raw) return {};
    const d = JSON.parse(raw);
    return {
      email: d.email,
      phone: d.phone,
      fn: d.firstName,
      ln: d.lastName,
      ct: d.city,
      st: d.state,
      country: d.country || 'VE',
    };
  } catch {
    return {};
  }
};

export const sendCapiEvent = ({ event_name, event_id, custom_data, user_data }: SendCapiArgs): void => {
  if (typeof window === 'undefined') return;

  const { fbc, fbp } = getFbCookies();
  const sessionUd = getUserDataFromSession();
  const merged: CapiUserData = { ...sessionUd, ...user_data, fbc, fbp };

  const payload: Record<string, unknown> = {
    event_name,
    event_id,
    event_source_url: window.location.href,
    event_time: Math.floor(Date.now() / 1000),
    user_data: merged,
    custom_data: custom_data || {},
  };
  if (CAPI_TEST_EVENT_CODE) payload.test_event_code = CAPI_TEST_EVENT_CODE;

  // Fire-and-forget. Nunca bloquea UI ni loguea PII.
  supabase.functions.invoke('meta-capi', { body: payload }).catch(() => {
    /* silent: CAPI es best-effort */
  });
};
