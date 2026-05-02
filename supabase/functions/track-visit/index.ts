// [2026-05-02] CATARSIS — track-visit
// Propósito: Registrar una visita en page_views resolviendo país/ciudad
// del lado servidor a partir de la IP real del request. Esto reemplaza la
// resolución de geo en el navegador (bloqueada por CORS/adblockers/timeouts)
// y garantiza que el panel "Visitantes" muestre países reales.
//
// Estrategia:
// 1. Obtener la IP del visitante de los headers x-forwarded-for / cf-connecting-ip.
// 2. Resolver país/ciudad consultando ipwho.is (principal) y ipapi.co (fallback).
// 3. Insertar en page_views con SERVICE_ROLE para evitar dependencia de RLS
//    de sesión anónima — la validación de inputs se hace aquí mismo.
//
// Notas:
// - verify_jwt = false por defecto (analytics público para visitantes anónimos).
// - Sin secrets adicionales: ambos proveedores de geo son gratuitos y sin API key.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SESSION_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function getClientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]?.trim() || null;
  const cf = req.headers.get('cf-connecting-ip');
  if (cf) return cf.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return null;
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

// Resuelve geo con dos proveedores. Devuelve { country, city } o nulls.
async function resolveGeo(
  ip: string | null,
): Promise<{ country: string | null; city: string | null }> {
  // 1) ipwho.is — campo `country` ya es el nombre legible.
  try {
    const url = ip ? `https://ipwho.is/${ip}` : 'https://ipwho.is/';
    const res = await fetchWithTimeout(url, 2500);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false && (data.country || data.city)) {
        return {
          country: data.country ?? null,
          city: data.city ?? null,
        };
      }
    }
  } catch {
    // continúa al fallback
  }

  // 2) ipapi.co — `country_name` es el nombre legible (`country` es ISO).
  try {
    const url = ip
      ? `https://ipapi.co/${ip}/json/`
      : 'https://ipapi.co/json/';
    const res = await fetchWithTimeout(url, 2500);
    if (res.ok) {
      const data = await res.json();
      if (data && (data.country_name || data.city)) {
        return {
          country: data.country_name ?? null,
          city: data.city ?? null,
        };
      }
    }
  } catch {
    // se inserta sin geo
  }

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
