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

// Parse a date string into a timestamp, handling various formats
function parseDate(dateStr: string): Date | null {
  try {
    // Try ISO format first
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d;
    return null;
  } catch {
    return null;
  }
}

// API 1: ve.dolarapi.com
async function fetchFromDolarApi(): Promise<RateResult | null> {
  try {
    console.log('Trying ve.dolarapi.com...');
    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) { await response.text(); return null; }
    
    const data = await response.json();
    console.log('ve.dolarapi.com response:', JSON.stringify(data));
    
    const rate = data.promedio || data.venta;
    if (!rate || rate <= 0) return null;
    
    const lastUpdated = data.fechaActualizacion || new Date().toISOString();
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
    if (!response.ok) { await response.text(); return null; }
    
    const data = await response.json();
    console.log('pydolarve.org response:', JSON.stringify(data));
    
    const price = data?.price || data?.monitors?.bcv?.price;
    if (!price || price <= 0) return null;

    const lastUpdated = data?.last_update || data?.monitors?.bcv?.last_update || new Date().toISOString();
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
    if (!response.ok) { await response.text(); return null; }
    
    const data = await response.json();
    console.log('exchangedyn.com response:', JSON.stringify(data));
    
    const rate = data?.sources?.BCV?.quote || data?.quote || data?.rate || data?.price;
    if (!rate || rate <= 0) return null;
    
    const lastUpdated = data?.sources?.BCV?.last_retrieved || data?.last_update || new Date().toISOString();
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
    if (!response.ok) { await response.text(); return null; }
    
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

// Select best rate from all results: prefer highest rate (most recent BCV update = higher value)
function selectBestRate(results: RateResult[]): RateResult {
  if (results.length === 0) throw new Error('No valid rates from any source');
  if (results.length === 1) return results[0];

  console.log(`Comparing ${results.length} results:`);
  results.forEach(r => console.log(`  ${r.source}: ${r.rate} (${r.lastUpdated})`));

  // Try to pick by most recent date first
  const withDates = results.map(r => ({ ...r, parsedDate: parseDate(r.lastUpdated) }));
  const dated = withDates.filter(r => r.parsedDate !== null);

  if (dated.length > 0) {
    // Sort by date descending
    dated.sort((a, b) => b.parsedDate!.getTime() - a.parsedDate!.getTime());
    const newest = dated[0];
    
    // If there are multiple with the same date (within 1 hour), pick highest rate
    const sameDay = dated.filter(r => 
      Math.abs(r.parsedDate!.getTime() - newest.parsedDate!.getTime()) < 3600000
    );
    
    if (sameDay.length > 1) {
      sameDay.sort((a, b) => b.rate - a.rate);
      console.log(`Multiple same-date results, picking highest: ${sameDay[0].rate} from ${sameDay[0].source}`);
      return sameDay[0];
    }
    
    console.log(`Picking newest: ${newest.rate} from ${newest.source}`);
    return newest;
  }

  // Fallback: pick highest rate (newer BCV rates are typically higher due to devaluation)
  results.sort((a, b) => b.rate - a.rate);
  console.log(`No parseable dates, picking highest rate: ${results[0].rate} from ${results[0].source}`);
  return results[0];
}

// Main: fetch ALL sources in parallel and pick best
async function fetchBcvRate(): Promise<RateResult> {
  const fetchers = [
    fetchFromDolarApi(),
    fetchFromPyDolarVe(),
    fetchFromExchangeDyn(),
    fetchFromBcvDirect(),
  ];
  
  const settled = await Promise.allSettled(fetchers);
  const results: RateResult[] = [];
  
  for (const result of settled) {
    if (result.status === 'fulfilled' && result.value && result.value.rate > 0) {
      results.push(result.value);
    }
  }
  
  console.log(`Got ${results.length} valid results out of ${fetchers.length} sources`);
  
  if (results.length === 0) {
    throw new Error('All API sources failed to provide a valid rate');
  }
  
  return selectBestRate(results);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting BCV rate sync (parallel mode)...');
    
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
    
    console.log(`✓ Best rate: ${rateResult.rate} from ${rateResult.source} (date: ${rateResult.lastUpdated})`);
    
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
