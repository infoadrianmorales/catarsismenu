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
    
    return {
      rate,
      source: 've.dolarapi.com (BCV oficial)',
      lastUpdated: data.fechaActualizacion
    };
  } catch (error) {
    console.error('Error fetching from ve.dolarapi.com:', error);
    return null;
  }
}

// API 2: exchangemonitor.net API
async function fetchFromExchangeMonitor(): Promise<RateResult | null> {
  try {
    console.log('Trying exchangemonitor.net...');
    const response = await fetch('https://exchangemonitor.net/api/v1/dolar', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('exchangemonitor.net responded with:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('exchangemonitor.net response:', JSON.stringify(data));
    
    // Find BCV rate in the response
    const bcvEntry = data?.find?.((item: { key: string }) => item.key === 'bcv');
    if (!bcvEntry || !bcvEntry.price || bcvEntry.price <= 0) return null;
    
    return {
      rate: bcvEntry.price,
      source: 'exchangemonitor.net (BCV)',
      lastUpdated: bcvEntry.last_update || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching from exchangemonitor.net:', error);
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
    
    // Parse the USD rate from the BCV page
    // The rate is typically in a div with id "dolar" or class containing "recuadroMoneda"
    const usdMatch = html.match(/id="dolar"[^>]*>[\s\S]*?<strong[^>]*>([\d,\.]+)/i);
    
    if (!usdMatch) {
      // Try alternative pattern
      const altMatch = html.match(/Dólar[\s\S]*?<strong[^>]*>([\d,\.]+)/i);
      if (!altMatch) {
        console.error('Could not find USD rate in BCV HTML');
        return null;
      }
      
      const rateStr = altMatch[1].replace('.', '').replace(',', '.');
      const rate = parseFloat(rateStr);
      
      if (isNaN(rate) || rate <= 0) return null;
      
      return {
        rate,
        source: 'bcv.org.ve (directo)',
        lastUpdated: new Date().toISOString()
      };
    }
    
    const rateStr = usdMatch[1].replace('.', '').replace(',', '.');
    const rate = parseFloat(rateStr);
    
    if (isNaN(rate) || rate <= 0) return null;
    
    return {
      rate,
      source: 'bcv.org.ve (directo)',
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching from bcv.org.ve:', error);
    return null;
  }
}

// Main rate fetcher with fallbacks
async function fetchBcvRate(): Promise<RateResult> {
  // Try each source in order until one works
  const sources = [
    fetchFromDolarApi,
    fetchFromExchangeMonitor,
    fetchFromBcvDirect,
  ];
  
  for (const fetchSource of sources) {
    const result = await fetchSource();
    if (result && result.rate > 0) {
      console.log(`Successfully got rate from ${result.source}: ${result.rate}`);
      return result;
    }
  }
  
  throw new Error('All API sources failed to provide a valid rate');
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting BCV rate sync...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if rate_source is set to 'manual' - if so, skip automatic update
    const { data: rateSourceConfig } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'rate_source')
      .single();
    
    if (rateSourceConfig?.value === 'manual') {
      console.log('Rate source is set to manual, skipping automatic update');
      return new Response(
        JSON.stringify({
          success: true,
          skipped: true,
          message: 'Rate source is set to manual, automatic update skipped',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
    
    // Fetch the BCV rate from available sources
    const rateResult = await fetchBcvRate();
    
    console.log('BCV rate obtained:', rateResult.rate);
    console.log('Source:', rateResult.source);
    console.log('Last updated:', rateResult.lastUpdated);
    
    // Update the config with the new rate
    const { data, error } = await supabase
      .from('config')
      .upsert({
        key: 'tasa_ves',
        value: rateResult.rate.toString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'key',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error updating config:', error);
      throw error;
    }
    
    console.log('Config updated successfully:', data);
    
    // Also update bcv_last_sync timestamp and source info
    await supabase
      .from('config')
      .upsert([
        {
          key: 'bcv_last_sync',
          value: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          key: 'bcv_source',
          value: rateResult.source,
          updated_at: new Date().toISOString(),
        }
      ], {
        onConflict: 'key',
      });
    
    return new Response(
      JSON.stringify({
        success: true,
        rate: rateResult.rate,
        source: rateResult.source,
        lastUpdated: rateResult.lastUpdated,
        syncedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error: unknown) {
    console.error('Error syncing BCV rate:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
