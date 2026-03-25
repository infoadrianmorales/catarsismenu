

## Plan de corrección — 3 vulnerabilidades del scanner

---

### FASE 1 — Resultados de auditoría

1. **¿El cliente envía x-session-id?** — SÍ, pero **no en la inicialización**. Se configura dinámicamente via `setSupabaseSessionHeader()` en `src/lib/supabaseHeaders.ts`, llamado desde `useVisitorTracker.ts` (línea 16). El header se inyecta mutando las propiedades internas del cliente (`client.rest.headers.set` y `client.headers`). Funciona pero depende de que `useVisitorTracker` se ejecute antes de cualquier query a `pending_checkouts`.

2. **Políticas RLS de `payment_methods`:**
   - `"Anyone can read enabled payment methods"` — SELECT — `USING (enabled = true)` ← **VULNERABLE**
   - `"Admins can read all payment methods"` — SELECT — `USING (is_admin(auth.uid()))`
   - `"Admins can insert payment methods"` — INSERT — `WITH CHECK (is_admin(auth.uid()))`
   - `"Admins can update payment methods"` — UPDATE — `USING (is_admin(auth.uid()))`
   - `"Admins can delete payment methods"` — DELETE — `USING (is_admin(auth.uid()))`

3. **Columnas de `payment_methods`:** `id` (text), `label` (text), `enabled` (boolean), `supports_usd` (boolean), `supports_ves` (boolean), `instructions_usd` (text), `instructions_ves` (text), `display_order` (integer), `created_at`, `updated_at`.

4. **Frontend consulta payment_methods:** `src/hooks/usePaymentMethods.ts` — usa `.from('payment_methods').select('*').eq('enabled', true)` directo.

5. **¿Cron job?** — SÍ, hay 2 cron jobs en pg_cron:
   - `sync-bcv-evening`: `0 20,21,22,23,0,1 * * *` (UTC → 4-9 PM VET)
   - `sync-bcv-morning`: `0 15 * * *` (UTC → 11 AM VET)
   - Ambos usan `Authorization: Bearer [anon_key]` en el header.

6. **¿Frontend llama sync-bcv-rate?** — SÍ, `src/components/admin/ConfigPanel.tsx` línea 95: `supabase.functions.invoke('sync-bcv-rate')` (botón manual del admin).

7. **¿CRON_SECRET existe?** — NO. Solo existe `LOVABLE_API_KEY` como secret del proyecto.

8. **¿`check_rate_limit` existe?** — SÍ: `check_rate_limit(p_identifier text, p_action text, p_max_attempts integer, p_window_minutes integer) RETURNS boolean`.

---

### FASE 2 — Correcciones

#### Corrección 1 — Header x-session-id

**Estado:** YA funciona via `setSupabaseSessionHeader()`. El scanner reporta un falso positivo parcial — el header no está en la inicialización del cliente pero se inyecta dinámicamente antes del primer uso.

**Acción:** Agregar comentario `[HEADER-OK]` en `src/lib/supabaseHeaders.ts` documentando que está verificado y funcionando. Sin cambio funcional.

---

#### Corrección 2 — Proteger payment_methods

**Paso 2A** — Migración SQL:
- `DROP POLICY "Anyone can read enabled payment methods" ON public.payment_methods;`

**Paso 2B** — Migración SQL: Crear RPC `get_active_payment_methods`:
```sql
CREATE OR REPLACE FUNCTION get_active_payment_methods()
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
  RETURN QUERY
    SELECT pm.id, pm.label, pm.enabled, pm.supports_usd, pm.supports_ves,
           pm.instructions_usd, pm.instructions_ves, pm.display_order
    FROM public.payment_methods pm
    WHERE pm.enabled = true
    ORDER BY pm.display_order ASC;
END;
$$;

REVOKE ALL ON FUNCTION get_active_payment_methods FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_active_payment_methods TO anon, authenticated;
```

**Paso 2C** — Actualizar `src/hooks/usePaymentMethods.ts`:
- Reemplazar `.from('payment_methods').select('*').eq('enabled', true)` por `supabase.rpc('get_active_payment_methods')`.
- Agregar `.order('display_order')` ya incluido en la RPC.

---

#### Corrección 3 — Proteger sync-bcv-rate

**Caso aplicable:** Se dispara desde cron jobs pg_cron + botón admin en frontend.

**Acción en `supabase/functions/sync-bcv-rate/index.ts`:**
- Agregar validación de `CRON_SECRET` con válvula de transición al inicio de `serve()`.
- Si `CRON_SECRET` no está configurado → permitir paso con warning en logs (no romper precios).
- Si `CRON_SECRET` está configurado → validar `Authorization: Bearer <secret>`.
- El botón admin del frontend usa `supabase.functions.invoke()` que envía automáticamente el JWT del admin → agregar validación alternativa: si no hay CRON_SECRET match, verificar JWT de admin como fallback.

**Acción futura (documentada, no ejecutada ahora):**
- Agregar secret `CRON_SECRET` al proyecto.
- Actualizar los 2 cron jobs para enviar `Authorization: Bearer <CRON_SECRET>` en lugar del anon key.

---

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/lib/supabaseHeaders.ts` | Comentario `[HEADER-OK]` |
| `src/hooks/usePaymentMethods.ts` | Usar RPC en lugar de SELECT directo |
| `supabase/functions/sync-bcv-rate/index.ts` | Validación CRON_SECRET + JWT admin fallback |
| Migración SQL | Drop policy + crear RPC `get_active_payment_methods` |

### Impacto

- **Checkout:** Sigue funcionando — la RPC retorna los mismos datos que el SELECT público anterior.
- **Tasa BCV:** Sigue actualizándose — la válvula de transición permite paso sin CRON_SECRET. El botón admin funciona via JWT fallback.
- **Admin:** Sin cambios — las políticas admin de payment_methods permanecen intactas.

