

## Plan de corrección de seguridad — 9 correcciones

### FASE 1 — Resultados de auditoría

1. **¿`orders` tiene columna `session_id`?** — NO. Las columnas actuales son: `id`, `created_at`, `exchange_rate`, `subtotal`, `total`, `updated_at`, `customer_id`, `payment_confirmed_at`, `first_name`, `last_name`, `phone`, `email`, `currency_mode`, `payment_method`, `status`, `whatsapp_message`, `payment_currency`, `payment_instructions_snapshot`, `payment_reference`, `notes`, `delivery_address`, `delivery_maps_url`, `delivery_type`, `order_number`.

2. **¿Dónde se actualiza `whatsapp_message`?** — `src/pages/Checkout.tsx`, líneas 451-454, usando `.update()` directo:
   ```ts
   await supabase.from('orders').update({ whatsapp_message: whatsappMessage }).eq('id', newOrderId);
   ```

3. **¿Dónde se llama `create_order_and_return_number`?** — `src/pages/Checkout.tsx`, líneas 413-433. Recibe 18 parámetros incluyendo `p_session_id: getSessionId()` y `p_whatsapp_message`. Sin embargo, la función NO guarda el `session_id` en la tabla (no existe la columna).

4. **`validate_order_exists`** — Valida existencia + ventana de 5 minutos. NO valida `session_id`.

5. **`get_client_session_id`** — Extrae `x-session-id` del header HTTP. Devuelve `''` si no existe.

6. **¿`pending_checkouts` tiene `expires_at`?** — NO.

7. **Políticas RLS** — Todas listadas en el contexto proporcionado (ver arriba). La política problemática es `"Anyone can update whatsapp_message on recent orders"` en `orders`.

---

### FASE 2 — Correcciones en orden

#### Corrección 1 — Agregar `session_id` a `orders`
- **Tipo**: Migración SQL
- **Acción**: `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS session_id TEXT;`

#### Corrección 2 — Actualizar `create_order_and_return_number`
- **Tipo**: Migración SQL (CREATE OR REPLACE FUNCTION)
- **Acción**: Modificar las 3 sobrecargas de la función para insertar `session_id` en la columna nueva. La versión con `p_session_id` ya recibe el parámetro, solo falta incluirlo en el INSERT. Las versiones sin `p_session_id` insertarán `NULL`.

#### Corrección 3 — Frontend ya pasa `session_id`
- **Tipo**: Cambio en `src/pages/Checkout.tsx`
- **Acción**: El frontend YA pasa `p_session_id: getSessionId()` (línea 431). Solo se agrega el comentario de seguridad. No hay cambio funcional.

#### Corrección 4 — Crear `update_order_whatsapp_message`
- **Tipo**: Migración SQL
- **Acción**: Crear función `SECURITY DEFINER` que valida `session_id` + ventana de 5 minutos + solo modifica `whatsapp_message`. Con `REVOKE/GRANT` para `anon, authenticated`.

#### Corrección 5 — Eliminar política UPDATE anónima
- **Tipo**: Migración SQL
- **Acción**: `DROP POLICY "Anyone can update whatsapp_message on recent orders" ON public.orders;`

#### Corrección 6 — Frontend usa nueva RPC
- **Tipo**: Cambio en `src/pages/Checkout.tsx`
- **Acción**: Reemplazar líneas 451-454 (`.update()`) por `supabase.rpc('update_order_whatsapp_message', {...})`. Se pasa `p_order_id`, `p_message`, `p_session_id`.

#### Corrección 7 — Fortalecer `validate_order_exists`
- **Tipo**: Migración SQL
- **Acción**: Agregar condición `AND (session_id IS NULL OR session_id = get_client_session_id())` a la función.

#### Corrección 8 — Fortalecer `pending_checkouts`
- **Tipo**: Migración SQL
- **Acción**:
  - Agregar columna `expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes')`
  - Actualizar política SELECT para incluir validación UUID regex + `expires_at`
  - Actualizar política INSERT para validar formato UUID del `session_id`

#### Corrección 9 — Validaciones en `page_views`
- **Tipo**: Migración SQL
- **Acción**: Reemplazar `WITH CHECK (true)` por validaciones de `path` y `session_id` con regex UUID.

---

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/pages/Checkout.tsx` | Comentarios C3, reemplazar `.update()` por RPC (C6) |
| Migraciones SQL (×5-6) | C1, C2, C4+C5, C7, C8, C9 |

### Impacto en el flujo de pedidos

- El flujo de checkout sigue idéntico para el usuario final
- Pedidos existentes (`session_id = NULL`) siguen funcionando por la condición `OR session_id IS NULL`
- El panel admin no se ve afectado (usa políticas de admin separadas)

