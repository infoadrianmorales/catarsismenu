-- SEGURIDAD [PM-1]: Se elimina acceso SELECT público en payment_methods.
-- Esta tabla contiene datos bancarios del restaurante (Zelle, Pago Móvil,
-- RIF, cuentas bancarias). Acceso irrestricto permite fraude: un atacante
-- puede obtener estos datos y enviar instrucciones de pago falsas a clientes.
-- Reemplazado por la RPC get_active_payment_methods que controla el acceso
-- desde el servidor.
-- Fecha: 2026-03-25

DROP POLICY IF EXISTS "Anyone can read enabled payment methods" ON public.payment_methods;

-- SEGURIDAD [PM-2]: Función controlada para leer payment_methods.
-- Reemplaza el SELECT directo público eliminado en PM-1.
-- SECURITY DEFINER: la función corre con permisos del owner,
-- no del usuario que la llama — el acceso queda en el servidor.
-- SET search_path = '': previene ataques de schema injection.
-- Solo retorna métodos activos, nunca datos de métodos inactivos.
CREATE OR REPLACE FUNCTION public.get_active_payment_methods()
RETURNS TABLE (
  id text,
  label text,
  enabled boolean,
  supports_usd boolean,
  supports_ves boolean,
  instructions_usd text,
  instructions_ves text,
  display_order integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Solo retorna métodos de pago activos y ordenados.
  -- El control de acceso queda en esta función, no en RLS.
  RETURN QUERY
    SELECT pm.id, pm.label, pm.enabled, pm.supports_usd, pm.supports_ves,
           pm.instructions_usd, pm.instructions_ves, pm.display_order
    FROM public.payment_methods pm
    WHERE pm.enabled = true
    ORDER BY pm.display_order ASC;
END;
$$;

-- SEGURIDAD [PM-3]: Revocar ejecución pública por defecto.
-- Solo anon y authenticated pueden llamar esta función.
-- Esto previene que roles no esperados accedan a los datos bancarios.
REVOKE ALL ON FUNCTION public.get_active_payment_methods FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_active_payment_methods TO anon, authenticated;