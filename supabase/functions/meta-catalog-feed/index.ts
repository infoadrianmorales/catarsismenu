import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SITE_URL = 'https://www.catarsiszone.com';
const BRAND = 'Catarsis Drinks &amp; Food';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: products, error } = await supabase
      .from('products')
      .select('id, nombre, slug, descripcion_corta, precio_usd, categoria, imagen_url, activo, is_orderable')
      .eq('activo', true)
      .order('orden', { ascending: true });

    if (error) throw error;

    const entries = (products || []).map((p: any) => {
      const title = escapeXml(p.nombre || '');
      const description = escapeXml(p.descripcion_corta || `${p.nombre} en Catarsis Drinks & Food`);
      const link = `${SITE_URL}/producto/${p.slug}`;
      const imageLink = p.imagen_url || `${SITE_URL}/og-image.jpg`;
      const price = `${Number(p.precio_usd).toFixed(2)} USD`;
      const availability = p.is_orderable !== false ? 'in stock' : 'out of stock';
      const productType = capitalize(p.categoria || 'General');

      return `  <entry>
    <g:id>${p.id}</g:id>
    <g:title>${title}</g:title>
    <g:description>${description}</g:description>
    <g:link>${link}</g:link>
    <g:image_link>${escapeXml(imageLink)}</g:image_link>
    <g:price>${price}</g:price>
    <g:availability>${availability}</g:availability>
    <g:brand>${BRAND}</g:brand>
    <g:condition>new</g:condition>
    <g:product_type>${escapeXml(productType)}</g:product_type>
  </entry>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom" xmlns:g="http://base.google.com/ns/1.0">
  <title>Catarsis Drinks &amp; Food - Product Feed</title>
  <link href="${SITE_URL}" rel="alternate" />
  <updated>${new Date().toISOString()}</updated>
${entries}
</feed>`;

    return new Response(xml, {
      headers: { ...corsHeaders, 'Content-Type': 'application/xml; charset=utf-8' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(`<error>${msg}</error>`, {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/xml' },
    });
  }
});
