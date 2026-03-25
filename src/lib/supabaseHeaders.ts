// SEGURIDAD: Configura el header x-session-id en el cliente Supabase.
// Este header es leído por get_client_session_id() en la base de datos
// para validar que las operaciones sobre orders, order_items y
// pending_checkouts pertenecen al mismo cliente que las creó.
// Se debe llamar antes de cualquier operación que dependa de session_id.

import { supabase } from '@/integrations/supabase/client';

/**
 * Configura el header x-session-id en las peticiones globales del cliente Supabase.
 * Esto permite que get_client_session_id() en la DB lea el session_id del request.
 */
export const setSupabaseSessionHeader = (sessionId: string) => {
  supabase.rest.headers['x-session-id'] = sessionId;
};
