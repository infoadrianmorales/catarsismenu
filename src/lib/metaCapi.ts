/**
 * Meta CAPI — cliente ligero que duplica cada evento del Pixel a la
 * Edge Function `meta-capi`. Nunca envía el access token: ese vive solo
 * en el servidor. El hashing de PII también ocurre en el servidor.
 *
 * PRODUCCIÓN: CAPI_TEST_EVENT_CODE = null → no se adjunta test_event_code
 * al payload y los eventos llegan a "Información general" (no a "Probar
 * eventos") de Events Manager. Para re-testear en el futuro, poner aquí
 * un código temporal tipo 'TESTxxxxx' y volver a null antes de publicar.
 */
// [2026-07-05] CATARSIS — fbc/fbp vía librería oficial de Meta +
// external_id persistente (ya hasheado client-side) en todos los eventos.
import { getFbc, getFbp, getOrCreateExternalId } from '@/lib/metaClickIds';
import { CAPI_FAIL_LOG_KEY, type CapiFailLog } from '@/lib/metaPixelManifest';

const CAPI_TEST_EVENT_CODE: string | null = null;

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

// [2026-07-05] CATARSIS — fbc/fbp ahora provienen de metaClickIds.ts
// (librería oficial de Meta). Se eliminó la lectura manual de cookies.


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

// [2026-07-05] CATARSIS — Registra un fallo de CAPI en localStorage.
// SOLO event_name + timestamp + count. Nunca payload ni PII.
const recordCapiFail = (event_name: string): void => {
  try {
    const raw = localStorage.getItem(CAPI_FAIL_LOG_KEY);
    const log: CapiFailLog = raw ? JSON.parse(raw) : {};
    const prev = log[event_name];
    log[event_name] = {
      lastFiredAt: Date.now(),
      count: (prev?.count ?? 0) + 1,
    };
    localStorage.setItem(CAPI_FAIL_LOG_KEY, JSON.stringify(log));
  } catch {
    /* noop */
  }
};

// [2026-07-05] CATARSIS — fetch keepalive + 1 retry a los 800ms;
// registra fallos en __capi_fail_log tras agotar el reintento.
const postCapi = async (payload: Record<string, unknown>, event_name: string): Promise<void> => {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-capi`;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: key,
    Authorization: `Bearer ${key}`,
  };
  const body = JSON.stringify(payload);

  const attempt = async (): Promise<boolean> => {
    try {
      const res = await fetch(url, { method: 'POST', headers, body, keepalive: true });
      return res.ok;
    } catch {
      return false;
    }
  };

  if (await attempt()) return;
  await new Promise((r) => setTimeout(r, 800));
  if (await attempt()) return;
  recordCapiFail(event_name);
};

export const sendCapiEvent = ({ event_name, event_id, custom_data, user_data }: SendCapiArgs): void => {
  if (typeof window === 'undefined') return;

  const fbc = getFbc();
  const fbp = getFbp();
  const external_id = getOrCreateExternalId() || undefined;
  const sessionUd = getUserDataFromSession();
  const merged: CapiUserData = { ...sessionUd, ...user_data, fbc, fbp, external_id };

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
  void postCapi(payload, event_name);
};
