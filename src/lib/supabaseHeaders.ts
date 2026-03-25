// SEGURIDAD: Configura el header x-session-id en el cliente Supabase.
// Este header es leído por get_client_session_id() en la base de datos
// para validar que las operaciones sobre orders, order_items y
// pending_checkouts pertenecen al mismo cliente que las creó.

import { supabase } from '@/integrations/supabase/client';

/**
 * Configura el header x-session-id en las peticiones globales del cliente Supabase.
 * Esto permite que get_client_session_id() en la DB lea el session_id del request.
 */
export const setSupabaseSessionHeader = (sessionId: string) => {
  // Use the global headers option via the internal fetch interceptor
  (supabase as any).rest.headers['x-session-id'] = sessionId;
};
