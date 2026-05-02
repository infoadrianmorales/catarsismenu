// [2026-05-02] CATARSIS — track-visit
// Propósito: Registrar una visita en page_views resolviendo país/ciudad
// del lado servidor a partir de la IP real del request.
//
// [2026-05-02] FIX: geo resuelta desde IP real del visitante via
// x-forwarded-for / cf-connecting-ip / x-real-ip + logging por paso para
// diagnosticar nulls. Antes la mayoría de visitantes quedaban con
// country = null porque los proveedores fallaban silenciosamente
// (rate limit, timeout corto o respuestas vacías).
//
// Estrategia:
// 1. Detectar IP del visitante. Si es privada/loopback, saltar geo.
// 2. Resolver con cascada: ipwho.is → ipapi.co → api.country.is.
//    Cada intento con timeout de 4s y User-Agent explícito.
// 3. Loggear el resultado de cada proveedor a edge logs para diagnóstico.
// 4. Insertar en page_views con SERVICE_ROLE para evitar dependencia de RLS.
//
// Notas:
// - verify_jwt = false por defecto (analytics público para visitantes anónimos).
// - Sin secrets adicionales: los 3 proveedores son gratuitos y sin API key.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

// [2026-05-02] FIX CRÍTICO CORS: el cliente Supabase global inyecta el header
// `x-session-id` (ver src/lib/supabaseHeaders.ts). Si no lo declaramos como
// permitido, el navegador completa OPTIONS pero BLOQUEA el POST real, dejando
// page_views sin filas nuevas y por tanto sin geo. Reflejamos también
// dinámicamente cualquier header solicitado por el preflight para no volver a
// caer en este bug si en el futuro se agrega algún otro header personalizado.
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

const corsHeaders = buildCorsHeaders();

const SESSION_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const GEO_TIMEOUT_MS = 4000;
const GEO_UA = 'CatarsisVisitorTracker/1.0 (+https://catarsiszone.com)';

// [2026-05-02] FIX: extraer IP real del visitante desde headers.
// El gateway de Supabase Edge antepone la IP del cliente a x-forwarded-for.
// Ampliado con cf-pseudo-ipv4, true-client-ip y fastly-client-ip para cubrir
// más CDNs. Si no se detecta IP, loggeamos los headers para diagnóstico.
function getClientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || null;
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  const trueClient = req.headers.get('true-client-ip');
  if (trueClient) return trueClient.trim();
  const fastly = req.headers.get('fastly-client-ip');
  if (fastly) return fastly.trim();
  const cfPseudo = req.headers.get('cf-pseudo-ipv4');
  if (cfPseudo) return cfPseudo.trim();
  return null;
}

// IPs privadas / loopback / link-local — geo siempre fallaría.
function isPrivateIp(ip: string): boolean {
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('::ffff:127.')) return true;
  if (ip.startsWith('10.')) return true;
  if (ip.startsWith('192.168.')) return true;
  if (ip.startsWith('169.254.')) return true;
  if (ip.startsWith('fc') || ip.startsWith('fd')) return true;
  // 172.16.0.0 – 172.31.255.255
  const m = ip.match(/^172\.(\d+)\./);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      headers: { 'User-Agent': GEO_UA, Accept: 'application/json' },
    });
  } finally {
    clearTimeout(t);
  }
}

// Resuelve geo con cascada de proveedores. Devuelve { country, city } o nulls.
async function resolveGeo(
  ip: string | null,
): Promise<{ country: string | null; city: string | null }> {
  if (!ip) {
    console.log('[geo] no client ip in headers — skipping geo resolution');
    return { country: null, city: null };
  }
  if (isPrivateIp(ip)) {
    console.log(`[geo] private/loopback ip ${ip} — skipping`);
    return { country: null, city: null };
  }

  // 1) ipwho.is — `country` ya es nombre legible.
  try {
    const res = await fetchWithTimeout(`https://ipwho.is/${ip}`, GEO_TIMEOUT_MS);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && (data.country || data.city)) {
        console.log(`[geo] ipwho.is OK ip=${ip} country=${data.country} city=${data.city}`);
        return { country: data.country ?? null, city: data.city ?? null };
      }
      console.log(`[geo] ipwho.is empty/false for ip=${ip}: ${JSON.stringify(data).slice(0, 200)}`);
    } else {
      console.log(`[geo] ipwho.is http ${res.status} for ip=${ip}`);
    }
  } catch (e) {
    console.log(`[geo] ipwho.is error for ip=${ip}: ${(e as Error).message}`);
  }

  // 2) ipapi.co — `country_name` es nombre legible.
  try {
    const res = await fetchWithTimeout(`https://ipapi.co/${ip}/json/`, GEO_TIMEOUT_MS);
    if (res.ok) {
      const data = await res.json();
      if (data && !data.error && (data.country_name || data.city)) {
        console.log(`[geo] ipapi.co OK ip=${ip} country=${data.country_name} city=${data.city}`);
        return { country: data.country_name ?? null, city: data.city ?? null };
      }
      console.log(`[geo] ipapi.co empty/error for ip=${ip}: ${JSON.stringify(data).slice(0, 200)}`);
    } else {
      console.log(`[geo] ipapi.co http ${res.status} for ip=${ip}`);
    }
  } catch (e) {
    console.log(`[geo] ipapi.co error for ip=${ip}: ${(e as Error).message}`);
  }

  // 3) api.country.is — solo país, sin rate limit conocido. Devuelve ISO; lo conservamos.
  try {
    const res = await fetchWithTimeout(`https://api.country.is/${ip}`, GEO_TIMEOUT_MS);
    if (res.ok) {
      const data = await res.json();
      if (data && data.country) {
        console.log(`[geo] api.country.is OK ip=${ip} country=${data.country}`);
        return { country: data.country, city: null };
      }
      console.log(`[geo] api.country.is empty for ip=${ip}`);
    } else {
      console.log(`[geo] api.country.is http ${res.status} for ip=${ip}`);
    }
  } catch (e) {
    console.log(`[geo] api.country.is error for ip=${ip}: ${(e as Error).message}`);
  }

  console.log(`[geo] all providers failed for ip=${ip}`);
  return { country: null, city: null };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const session_id = String(body?.session_id ?? '');
  const path = String(body?.path ?? '');

  if (!SESSION_RE.test(session_id)) {
    return new Response(JSON.stringify({ error: 'Invalid session_id' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  if (!path || path.length > 500) {
    return new Response(JSON.stringify({ error: 'Invalid path' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const source = body?.source ? String(body.source).slice(0, 80) : 'Directo';
  const referrer = body?.referrer ? String(body.referrer).slice(0, 500) : null;
  const user_agent = body?.user_agent
    ? String(body.user_agent).slice(0, 500)
    : null;
  const utm_source = body?.utm_source
    ? String(body.utm_source).slice(0, 120)
    : null;
  const utm_medium = body?.utm_medium
    ? String(body.utm_medium).slice(0, 120)
    : null;
  const utm_campaign = body?.utm_campaign
    ? String(body.utm_campaign).slice(0, 120)
    : null;

  const ip = getClientIp(req);
  if (!ip) {
    // Diagnóstico: si nunca detectamos IP, loggear todos los headers para
    // identificar qué CDN/proxy intermediario está pasando la conexión.
    const allHeaders: Record<string, string> = {};
    req.headers.forEach((v, k) => { allHeaders[k] = v; });
    console.log(`[track-visit] NO IP DETECTED. headers=${JSON.stringify(allHeaders)}`);
  }
  console.log(`[track-visit] path=${path} ip=${ip ?? 'null'}`);
  const geo = await resolveGeo(ip);

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  );

  const { error } = await supabase.from('page_views').insert({
    session_id,
    path,
    referrer,
    user_agent,
    source,
    utm_source,
    utm_medium,
    utm_campaign,
    country: geo.country,
    city: geo.city,
  });

  if (error) {
    console.log(`[track-visit] insert error: ${error.message}`);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({ ok: true, country: geo.country, city: geo.city }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
});
