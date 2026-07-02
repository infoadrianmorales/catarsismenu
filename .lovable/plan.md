## Acción manual en Meta Events Manager

No requiere cambios de código. Solo debes borrar en Meta Events Manager los siguientes eventos configurados que la app **no dispara**:

1. **ViewCategory** — huérfano, la app no lo emite.
2. **RemoveFromCart** — huérfano, sin uso en el código (última recepción hace 5 días = residual histórico).

### Eventos que sí debes conservar (coinciden con el manifest de la app)

| Meta | Código |
|---|---|
| PageView | `PageView` |
| Ver contenido | `ViewContent` |
| Cliente potencial | `Lead` |
| Agregar al carrito | `AddToCart` |
| Buscar | `Search` |
| Contactar | `Contact` |
| Iniciar pago | `InitiateCheckout` |
| Agregar información de pago | `AddPaymentInfo` |
| Comprar | `Purchase` |

### Nota sobre ViewCart

La app dispara `ViewCart` como evento **custom** (`trackCustom`) al abrir el drawer del carrito. Meta no lo muestra en la lista de eventos estándar — aparece bajo "Eventos personalizados". No es necesario configurarlo ni borrarlo.

### Cómo borrarlos

1. Meta Events Manager → tu Pixel → pestaña **Overview / Eventos**.
2. Click en el evento (**ViewCategory** / **RemoveFromCart**) → menú `⋯` → **Eliminar evento**.
3. Repite para el segundo.

Después puedes usar el **Validador de Eventos del Pixel** en el panel Admin → Marketing → Meta para confirmar que la lista quedó alineada con el manifest.
