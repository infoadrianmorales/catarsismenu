// SEGURIDAD: Configura el header x-session-id en el cliente Supabase.
// Este header es leído por get_client_session_id() en la base de datos
// (via current_setting('request.headers')) para validar que las operaciones
// sobre orders, order_items y pending_checkouts pertenecen al mismo cliente.

import { supabase } from '@/integrations/supabase/client';

/**
 * Configura el header x-session-id en las peticiones globales del cliente Supabase.
 * Supabase JS v2 expone headers a través del objeto REST interno.
 * PostgREST los lee via current_setting('request.headers', true).
 */
export const setSupabaseSessionHeader = (sessionId: string) => {
  // supabase-js v2: set global headers that PostgREST will receive
  const client = supabase as any;
  
  // Method 1: Set on the REST client headers (used by .from() queries)
  if (client.rest?.headers) {
    client.rest.headers['x-session-id'] = sessionId;
  }
  
  // Method 2: Set on the internal headers (used by all requests including RPCs)
  if (client.headers) {
    client.headers['x-session-id'] = sessionId;
  }
  
  // Method 3: Set via the realtime/functions headers
  if (client.restUrl || client.supabaseUrl) {
    // Access the underlying fetch options
    try {
      client.rest.headers = {
        ...client.rest.headers,
        'x-session-id': sessionId,
      };
    } catch {
      // Fallback silently
    }
  }
};
