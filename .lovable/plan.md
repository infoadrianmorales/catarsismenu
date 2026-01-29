# Plan de Implementación: Mejoras de Seguridad

## Estado: ✅ COMPLETADO

Todas las fases de seguridad han sido implementadas exitosamente.

---

## Resumen de Cambios Implementados

### ✅ Fase 1: RLS para pending_checkouts
- Función `get_client_session_id()` creada para validar sesiones
- Políticas actualizadas: solo el dueño de la sesión puede leer/actualizar/eliminar su checkout
- Admins mantienen acceso completo

### ✅ Fase 2: Validación en RLS de orders/order_items
- Política `Anyone can insert valid orders` con validaciones:
  - `total > 0`, `subtotal >= 0`
  - Nombre, apellido, teléfono (min 7 chars), email (regex)
  - Método de pago requerido
- Política `Anyone can insert valid order_items` con validaciones:
  - `quantity > 0`, `unit_price_snapshot >= 0`, `line_total >= 0`
  - `product_name_snapshot` no vacío

### ✅ Fase 3: Separación de Config Público/Privado
- Columna `is_public` agregada a tabla `config`
- Configuraciones privadas: `tasa_manual`, `rate_source`, `bcv_last_sync`, `bcv_source`
- Política actualizada: usuarios anónimos solo ven config público

### ✅ Fase 4: Rate Limiting
- Tabla `rate_limits` creada con RLS (sin acceso directo)
- Función `check_rate_limit()` implementada
- Función `create_order_and_return_number()` actualizada con parámetro `p_session_id`
- Límite: 5 pedidos por hora por sesión
- Frontend actualizado para manejar error de rate limit

### ⚠️ Fase 5: Leaked Password Protection
- **Requiere acción manual**: Habilitar en Lovable Cloud > Authentication > Settings

---

## Advertencias del Linter (Aceptables)

Las siguientes políticas permisivas son **intencionales**:

| Tabla | Política | Razón |
|-------|----------|-------|
| `customers` | INSERT con `true` | Checkout anónimo necesita crear clientes |
| `pending_checkouts` | INSERT con `true` | Tracking de carritos abandonados |

La extensión en `public` schema es un warning existente no relacionado con esta migración.

---

## Archivos Modificados

- `src/pages/Checkout.tsx`: Agregado `p_session_id` al RPC y manejo de error rate limit
- Base de datos: 4 nuevas funciones, 1 nueva tabla, políticas RLS actualizadas
