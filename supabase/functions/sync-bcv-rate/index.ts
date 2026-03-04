import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RateResult {
  rate: number;
  source: string;
  lastUpdated: string;
}

// Check if a date is stale (more than 26 hours old)
function isStale(dateStr: string): boolean {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    console.log(`Rate date: ${dateStr}, age: ${diffHours.toFixed(1)} hours`);
    return diffHours > 26;
  } catch {
    return false; // If we can't parse, don't skip
  }
}

// API 1: ve.dolarapi.com (primary)
async function fetchFromDolarApi(): Promise<RateResult | null> {
  try {
    console.log('Trying ve.dolarapi.com...');
    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('ve.dolarapi.com responded with:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('ve.dolarapi.com response:', JSON.stringify(data));
    
    const rate = data.promedio || data.venta;
    if (!rate || rate <= 0) return null;
    
    const lastUpdated = data.fechaActualizacion || new Date().toISOString();
    
    // Freshness check: skip if data is too old
    if (isStale(lastUpdated)) {
      console.log('ve.dolarapi.com rate is stale, trying next source...');
      return null;
    }
    
    return {
      rate,
      source: 've.dolarapi.com (BCV oficial)',
      lastUpdated,
    };
  } catch (error) {
    console.error('Error fetching from ve.dolarapi.com:', error);
    return null;
  }
}

// API 2: pydolarve.org API
async function fetchFromPyDolarVe(): Promise<RateResult | null> {
  try {
    console.log('Trying pydolarve.org...');
    const response = await fetch('https://pydolarve.org/api/v2/dollar?monitor=bcv', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('pydolarve.org responded with:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('pydolarve.org response:', JSON.stringify(data));
    
    // Extract BCV rate from response
    const price = data?.price || data?.monitors?.bcv?.price;
    if (!price || price <= 0) return null;

    const lastUpdated = data?.last_update || data?.monitors?.bcv?.last_update || new Date().toISOString();

    if (typeof lastUpdated === 'string' && isStale(lastUpdated)) {
      console.log('pydolarve.org rate is stale, trying next source...');
      return null;
    }
    
    return {
      rate: price,
      source: 'pydolarve.org (BCV)',
      lastUpdated,
    };
  } catch (error) {
    console.error('Error fetching from pydolarve.org:', error);
    return null;
  }
}

// API 3: BCV Official Website Scraping (fallback)
async function fetchFromBcvDirect(): Promise<RateResult | null> {
  try {
    console.log('Trying direct BCV scraping...');
    const response = await fetch('https://www.bcv.org.ve/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-VE,es;q=0.9',
      }
    });
    
    if (!response.ok) {
      console.error('bcv.org.ve responded with:', response.status);
      return null;
    }
    
    const html = await response.text();
    
    // Multiple regex patterns for robustness
    const patterns = [
      /id="dolar"[^>]*>[\s\S]*?<strong[^>]*>([\d,\.]+)/i,
      /Dólar[\s\S]*?<strong[^>]*>([\d,\.]+)/i,
      /USD[\s\S]*?<strong[^>]*>([\d,\.]+)/i,
      /dolar[^>]*>[\s\S]*?([\d]+[,.][\d]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        // Venezuelan format: 1.234,56 → need to convert to 1234.56
        const rateStr = match[1].replace(/\./g, '').replace(',', '.');
        const rate = parseFloat(rateStr);
        
        if (!isNaN(rate) && rate > 0) {
          console.log(`BCV scraping matched with pattern, raw: "${match[1]}", parsed: ${rate}`);
          return {
            rate,
            source: 'bcv.org.ve (directo)',
            lastUpdated: new Date().toISOString(),
          };
        }
      }
    }
    
    console.error('Could not find USD rate in BCV HTML');
    return null;
  } catch (error) {
    console.error('Error fetching from bcv.org.ve:', error);
    return null;
  }
}

// API 4: ve.dolarapi.com WITHOUT freshness check (last resort before scraping fails)
async function fetchFromDolarApiNoFreshness(): Promise<RateResult | null> {
  try {
    console.log('Trying ve.dolarapi.com (accepting stale)...');
    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const rate = data.promedio || data.venta;
    if (!rate || rate <= 0) return null;
    
    return {
      rate,
      source: 've.dolarapi.com (BCV oficial - última disponible)',
      lastUpdated: data.fechaActualizacion || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// Main rate fetcher with fallbacks
async function fetchBcvRate(): Promise<RateResult> {
  const sources = [
    fetchFromDolarApi,         // Primary with freshness check
    fetchFromPyDolarVe,        // New fallback with freshness check
    fetchFromBcvDirect,        // Direct scraping
    fetchFromDolarApiNoFreshness, // Accept stale as last resort
  ];
  
  for (const fetchSource of sources) {
    const result = await fetchSource();
    if (result && result.rate > 0) {
      console.log(`✓ Rate from ${result.source}: ${result.rate} (date: ${result.lastUpdated})`);
      return result;
    }
  }
  
  throw new Error('All API sources failed to provide a valid rate');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting BCV rate sync...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if rate_source is set to 'manual'
    const { data: rateSourceConfig } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'rate_source')
      .single();
    
    if (rateSourceConfig?.value === 'manual') {
      console.log('Rate source is set to manual, skipping automatic update');
      return new Response(
        JSON.stringify({ success: true, skipped: true, message: 'Rate source is manual' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }
    
    const rateResult = await fetchBcvRate();
    
    console.log(`Syncing rate: ${rateResult.rate} from ${rateResult.source} (date: ${rateResult.lastUpdated})`);
    
    const { data, error } = await supabase
      .from('config')
      .upsert({
        key: 'tasa_ves',
        value: rateResult.rate.toString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating config:', error);
      throw error;
    }
    
    console.log('Config updated successfully:', data);
    
    await supabase
      .from('config')
      .upsert([
        { key: 'bcv_last_sync', value: new Date().toISOString(), updated_at: new Date().toISOString() },
        { key: 'bcv_source', value: rateResult.source, updated_at: new Date().toISOString() },
        { key: 'bcv_rate_date', value: rateResult.lastUpdated, updated_at: new Date().toISOString() },
      ], { onConflict: 'key' });
    
    return new Response(
      JSON.stringify({
        success: true,
        rate: rateResult.rate,
        source: rateResult.source,
        lastUpdated: rateResult.lastUpdated,
        syncedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
    
  } catch (error: unknown) {
    console.error('Error syncing BCV rate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
