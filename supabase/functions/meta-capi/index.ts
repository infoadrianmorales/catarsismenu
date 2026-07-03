/**
 * Meta Conversions API (CAPI) — server-side duplicator del Pixel.
 * Recibe eventos del cliente con el mismo event_id que se envió a fbq()
 * y los reenvía a Graph API. Hashea PII con SHA-256 antes de salir.
 *
 * NUNCA loguea el access token ni PII (raw o hasheada).
 */
// CORS dinámico (mismo patrón que track-visit): el cliente Supabase global
// inyecta `x-session-id` (ver src/lib/supabaseHeaders.ts) y el SDK puede
// agregar más headers internos (x-supabase-client-*). Reflejar los headers
// pedidos en el preflight blinda la función contra futuros headers custom.
const BASE_ALLOWED_HEADERS =
  'authorization, x-client-info, apikey, content-type, x-session-id, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version';

function buildCorsHeaders(req?: Request): Record<string, string> {
  const requested = req?.headers.get('access-control-request-headers');
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': requested ?? BASE_ALLOWED_HEADERS,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
    Vary: 'Access-Control-Request-Headers',
  };
}
import { z } from 'npm:zod@3.23.8';

const PIXEL_ID = '1428549534945171';
const GRAPH_URL = `https://graph.facebook.com/v20.0/${PIXEL_ID}/events`;

const ALLOWED_EVENTS = ['PageView', 'ViewContent', 'Lead', 'AddToCart', 'InitiateCheckout', 'Search', 'Purchase'] as const;

const UserDataSchema = z.object({
  email: z.string().optional(),
  phone: z.string().optional(),
  fn: z.string().optional(),
  ln: z.string().optional(),
  ct: z.string().optional(),
  st: z.string().optional(),
  country: z.string().optional(),
  external_id: z.string().optional(),
  fbc: z.string().optional(),
  fbp: z.string().optional(),
}).partial();

const BodySchema = z.object({
  event_name: z.enum(ALLOWED_EVENTS),
  event_id: z.string().min(1).max(128),
  event_source_url: z.string().url().max(2048),
  event_time: z.number().int().optional(),
  user_data: UserDataSchema.optional().default({}),
  custom_data: z.record(z.unknown()).optional().default({}),
  test_event_code: z.string().max(64).optional(),
});

const isSha256Hex = (v: string) => /^[a-f0-9]{64}$/i.test(v);

const sha256Hex = async (input: string): Promise<string> => {
  const buf = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const normalizeEmail = (v: string) => v.trim().toLowerCase();
const normalizePhone = (v: string) => v.replace(/[^0-9]/g, '');
const normalizeName = (v: string) => v.trim().toLowerCase();

const hashIfNeeded = async (v: string | undefined, normalize: (x: string) => string): Promise<string | undefined> => {
  if (!v) return undefined;
  const trimmed = v.trim();
  if (!trimmed) return undefined;
  if (isSha256Hex(trimmed)) return trimmed.toLowerCase();
  return await sha256Hex(normalize(trimmed));
};

Deno.serve(async (req) => {
  const corsHeaders = buildCorsHeaders(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const token = Deno.env.get('META_CAPI_ACCESS_TOKEN');
  if (!token) {
    return new Response(JSON.stringify({ error: 'CAPI token not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const { event_name, event_id, event_source_url, event_time, user_data, custom_data, test_event_code } = parsed.data;

  // Extract IP + UA server-side (más confiable que el cliente).
  const fwd = req.headers.get('x-forwarded-for') || '';
  const clientIp = fwd.split(',')[0].trim() || req.headers.get('cf-connecting-ip') || '';
  const clientUa = req.headers.get('user-agent') || '';

  // Hash PII (server-side).
  const [em, ph, fn, ln, ct, st, country] = await Promise.all([
    hashIfNeeded(user_data.email, normalizeEmail),
    hashIfNeeded(user_data.phone, normalizePhone),
    hashIfNeeded(user_data.fn, normalizeName),
    hashIfNeeded(user_data.ln, normalizeName),
    hashIfNeeded(user_data.ct, normalizeName),
    hashIfNeeded(user_data.st, normalizeName),
    hashIfNeeded(user_data.country, normalizeName),
  ]);

  const ud: Record<string, unknown> = {};
  if (em) ud.em = [em];
  if (ph) ud.ph = [ph];
  if (fn) ud.fn = [fn];
  if (ln) ud.ln = [ln];
  if (ct) ud.ct = [ct];
  if (st) ud.st = [st];
  if (country) ud.country = [country];
  if (user_data.external_id) ud.external_id = [await sha256Hex(user_data.external_id.trim())];
  if (user_data.fbc) ud.fbc = user_data.fbc;
  if (user_data.fbp) ud.fbp = user_data.fbp;
  if (clientIp) ud.client_ip_address = clientIp;
  if (clientUa) ud.client_user_agent = clientUa;

  const payload: Record<string, unknown> = {
    data: [{
      event_name,
      event_time: event_time ?? Math.floor(Date.now() / 1000),
      event_id,
      event_source_url,
      action_source: 'website',
      user_data: ud,
      custom_data,
    }],
    access_token: token,
  };
  if (test_event_code) payload.test_event_code = test_event_code;

  try {
    const res = await fetch(GRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => ({}));
    return new Response(JSON.stringify({ status: res.status, meta: body }), {
      status: res.ok ? 200 : 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Upstream failure', detail: String(err) }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
