// SEGURIDAD [HEADER-OK]: El header x-session-id se envía en
// cada request a Supabase mediante la configuración global
// del cliente. Esto permite que get_client_session_id()
// funcione en las políticas RLS de pending_checkouts, orders
// y order_items.
// Sin este header las políticas RLS fallarían silenciosamente,
// permitiendo acceso no autorizado a checkouts ajenos.
// Verificado y funcionando — no modificar esta configuración.
//
// IMPLEMENTACIÓN: Se inyecta dinámicamente via setSupabaseSessionHeader()
// llamado desde useVisitorTracker (analytics) y Checkout (pedidos).
// El header se configura en dos lugares del cliente Supabase:
// - rest.headers (Headers object) para queries .from()
// - headers (plain object) para llamadas .rpc() y otras
// PostgREST lee el header via current_setting('request.headers').

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
