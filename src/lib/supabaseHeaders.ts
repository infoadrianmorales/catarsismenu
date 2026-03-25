// SEGURIDAD: Configura el header x-session-id en el cliente Supabase.
// Este header es leído por get_client_session_id() en la base de datos
// (via current_setting('request.headers')) para validar que las operaciones
// sobre orders, order_items y pending_checkouts pertenecen al mismo cliente.

import { supabase } from '@/integrations/supabase/client';

/**
 * Configura el header x-session-id en las peticiones globales del cliente Supabase.
 * PostgREST los lee via current_setting('request.headers', true).
 * 
 * Se configuran en dos lugares:
 * - rest.headers (Headers object) para queries .from() 
 * - headers (plain object) para llamadas .rpc() y otras
 */
export const setSupabaseSessionHeader = (sessionId: string) => {
  const client = supabase as any;
  
  // Para queries .from() — usa la clase Headers con .set()
  if (client.rest?.headers?.set) {
    client.rest.headers.set('x-session-id', sessionId);
  }
  
  // Para .rpc() y otras llamadas — plain object
  if (client.headers) {
    client.headers['x-session-id'] = sessionId;
  }
};
