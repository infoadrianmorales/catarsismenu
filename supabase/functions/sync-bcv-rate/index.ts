import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BcvResponse {
  fuente: string;
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting BCV rate sync...');
    
    // Fetch the BCV rate from the public API
    const apiResponse = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
    
    if (!apiResponse.ok) {
      console.error('API response not OK:', apiResponse.status, apiResponse.statusText);
      throw new Error(`API responded with status ${apiResponse.status}`);
    }
    
    const bcvData: BcvResponse = await apiResponse.json();
    console.log('BCV API response:', JSON.stringify(bcvData));
    
    // Get the rate (use promedio or venta)
    const rate = bcvData.promedio || bcvData.venta;
    
    if (!rate || rate <= 0) {
      console.error('Invalid rate received:', rate);
      throw new Error('Invalid rate received from BCV API');
    }
    
    console.log('BCV rate obtained:', rate);
    console.log('Last updated:', bcvData.fechaActualizacion);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Update the config with the new rate
    const { data, error } = await supabase
      .from('config')
      .upsert({
        key: 'tasa_ves',
        value: rate.toString(),
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
    
    // Also update bcv_last_sync timestamp
    await supabase
      .from('config')
      .upsert({
        key: 'bcv_last_sync',
        value: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'key',
      });
    
    return new Response(
      JSON.stringify({
        success: true,
        rate: rate,
        source: bcvData.fuente,
        lastUpdated: bcvData.fechaActualizacion,
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
