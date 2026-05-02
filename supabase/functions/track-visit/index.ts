// Edge function: track-visit
// Inserta un page_view enriquecido con país/ciudad (vía ip-api.com) y fuente.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

function classifySource(referrer: string | null, utmSource: string | null): string {
  if (utmSource && utmSource.trim()) return capitalize(utmSource.trim());
  if (!referrer) return 'Directo';
  let host = '';
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return 'Directo';
  }
  if (!host) return 'Directo';
  if (/(^|\.)google\./.test(host)) return 'Google';
  if (/(^|\.)(facebook|fb)\./.test(host)) return 'Facebook';
  if (/(^|\.)instagram\./.test(host)) return 'Instagram';
  if (/(^|\.)(t\.co|twitter\.com|x\.com)$/.test(host)) return 'Twitter/X';
  if (/(wa\.me|whatsapp)/.test(host)) return 'WhatsApp';
  if (/(^|\.)tiktok\./.test(host)) return 'TikTok';
  if (/(^|\.)bing\./.test(host)) return 'Bing';
  if (/(^|\.)youtube\./.test(host)) return 'YouTube';
  return `Referido (${host.replace(/^www\./, '')})`;
}

async function geolocate(ip: string): Promise<{ country: string | null; city: string | null }> {
  if (!ip || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: null, city: null };
  }
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,city`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return { country: null, city: null };
    const data = await res.json();
    if (data?.status !== 'success') return { country: null, city: null };
    return { country: data.country ?? null, city: data.city ?? null };
  } catch {
    return { country: null, city: null };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const {
      session_id,
      path,
      referrer,
      user_agent,
      utm_source,
      utm_medium,
      utm_campaign,
    } = body ?? {};

    if (!session_id || typeof session_id !== 'string' || !UUID_V4.test(session_id)) {
      return new Response(JSON.stringify({ error: 'invalid_session_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!path || typeof path !== 'string' || path.length === 0 || path.length > 500) {
      return new Response(JSON.stringify({ error: 'invalid_path' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // IP detection
    const fwd = req.headers.get('x-forwarded-for') ?? '';
    const ip = (fwd.split(',')[0] ?? '').trim() || req.headers.get('cf-connecting-ip') || '';

    const [{ country, city }] = await Promise.all([geolocate(ip)]);
    const source = classifySource(referrer ?? null, utm_source ?? null);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { error } = await supabase.from('page_views').insert({
      session_id,
      path,
      referrer: referrer || null,
      user_agent: user_agent || null,
      country,
      city,
      source,
      utm_source: utm_source || null,
      utm_medium: utm_medium || null,
      utm_campaign: utm_campaign || null,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true, source, country, city }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
