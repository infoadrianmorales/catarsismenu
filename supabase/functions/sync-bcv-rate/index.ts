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

// Get current date in Venezuela timezone (UTC-4)
function getVenezuelaDate(): Date {
  const now = new Date();
  return new Date(now.getTime() - 4 * 60 * 60 * 1000);
}

// Check if rate date is from today (Venezuela time). After 4 PM VET, yesterday's rate is stale.
function isStale(dateStr: string): boolean {
  try {
    const rateDate = new Date(dateStr);
    const vetNow = getVenezuelaDate();
    
    const rateDateStr = rateDate.toISOString().slice(0, 10);
    const todayStr = vetNow.toISOString().slice(0, 10);
    
    console.log(`Rate date: ${rateDateStr}, VET today: ${todayStr}, VET hour: ${vetNow.getUTCHours()}`);
    
    if (rateDateStr === todayStr) return false; // Same day = fresh
    
    // If it's after 4 PM VET and rate is from yesterday or older, it's stale
    if (vetNow.getUTCHours() >= 16) {
      console.log('Rate is from a previous day and it is past 4 PM VET — marking as stale');
      return true;
    }
    
    // Before 4 PM VET, yesterday's rate is still acceptable
    const diffMs = vetNow.getTime() - rateDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    if (diffHours > 24) {
      console.log(`Rate is ${diffHours.toFixed(1)}h old — stale`);
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

// API 1: ve.dolarapi.com (primary)
async function fetchFromDolarApi(): Promise<RateResult | null> {
  try {
    console.log('Trying ve.dolarapi.com...');
    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) return null;
    
    const data = await response.json();
    console.log('ve.dolarapi.com response:', JSON.stringify(data));
    
    const rate = data.promedio || data.venta;
    if (!rate || rate <= 0) return null;
    
    const lastUpdated = data.fechaActualizacion || new Date().toISOString();
    
    if (isStale(lastUpdated)) {
      console.log('ve.dolarapi.com rate is stale, skipping');
      return null;
    }
    
    return { rate, source: 've.dolarapi.com (BCV oficial)', lastUpdated };
  } catch (error) {
    console.error('Error from ve.dolarapi.com:', error);
    return null;
  }
}

// API 2: pydolarve.org
async function fetchFromPyDolarVe(): Promise<RateResult | null> {
  try {
    console.log('Trying pydolarve.org...');
    const response = await fetch('https://pydolarve.org/api/v2/dollar?monitor=bcv', {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) return null;
    
    const data = await response.json();
    console.log('pydolarve.org response:', JSON.stringify(data));
    
    const price = data?.price || data?.monitors?.bcv?.price;
    if (!price || price <= 0) return null;

    const lastUpdated = data?.last_update || data?.monitors?.bcv?.last_update || new Date().toISOString();

    if (typeof lastUpdated === 'string' && isStale(lastUpdated)) {
      console.log('pydolarve.org rate is stale, skipping');
      return null;
    }
    
    return { rate: price, source: 'pydolarve.org (BCV)', lastUpdated };
  } catch (error) {
    console.error('Error from pydolarve.org:', error);
    return null;
  }
}

// API 3: exchangedyn.com
async function fetchFromExchangeDyn(): Promise<RateResult | null> {
  try {
    console.log('Trying exchangedyn.com...');
    const response = await fetch('https://api.exchangedyn.com/markets/quotes/usdves/bcv', {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) {
      console.error('exchangedyn.com responded with:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('exchangedyn.com response:', JSON.stringify(data));
    
    // Try common response shapes
    const rate = data?.sources?.BCV?.quote || data?.quote || data?.rate || data?.price;
    if (!rate || rate <= 0) return null;
    
    const lastUpdated = data?.sources?.BCV?.last_retrieved || data?.last_update || new Date().toISOString();
    
    if (typeof lastUpdated === 'string' && isStale(lastUpdated)) {
      console.log('exchangedyn.com rate is stale, skipping');
      return null;
    }
    
    return { rate, source: 'exchangedyn.com (BCV)', lastUpdated };
  } catch (error) {
    console.error('Error from exchangedyn.com:', error);
    return null;
  }
}

// API 4: BCV direct scraping
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
    if (!response.ok) return null;
    
    const html = await response.text();
    
    const patterns = [
      /id="dolar"[^>]*>[\s\S]*?<strong[^>]*>([\d,\.]+)/i,
      /USD[\s\S]*?<strong[^>]*>([\d]+[,][\d]{2,10})/i,
      /Dólar[\s\S]*?<strong[^>]*>([\d,\.]+)/i,
      /dolar[^>]*>[\s\S]*?([\d]+[,.][\d]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match) {
        // Venezuelan format: 425,67410000 → 425.6741
        const rateStr = match[1].replace(/\./g, '').replace(',', '.');
        const rate = parseFloat(rateStr);
        
        if (!isNaN(rate) && rate > 0) {
          console.log(`BCV scraping matched, raw: "${match[1]}", parsed: ${rate}`);
          return { rate, source: 'bcv.org.ve (directo)', lastUpdated: new Date().toISOString() };
        }
      }
    }
    
    console.error('Could not find USD rate in BCV HTML');
    return null;
  } catch (error) {
    console.error('Error from bcv.org.ve:', error);
    return null;
  }
}

// Last resort: ve.dolarapi.com without freshness check
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

// Main rate fetcher with fallback chain
async function fetchBcvRate(): Promise<RateResult> {
  const sources = [
    fetchFromDolarApi,
    fetchFromPyDolarVe,
    fetchFromExchangeDyn,
    fetchFromBcvDirect,
    fetchFromDolarApiNoFreshness,
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
      console.log('Rate source is set to manual, skipping');
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
    
    if (error) throw error;
    
    console.log('Config updated:', data);
    
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
