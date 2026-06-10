# Mejoras al Meta Pixel

## Diagnóstico (por qué hoy "no recoge bien" y aparecen eventos fantasma)

Al revisar el código encontré 3 problemas que explican lo que ves en Events Manager:

1. **Atributos `data-meta-event` que no disparan nada.** En el código hay decenas de marcadores como `data-meta-event="ViewCart"`, `"Share"`, `"Purchase"`, `"InitiateCheckout"` en botones y tarjetas — pero **no existe ningún listener** que los lea. Solo sirven de etiqueta visual. Si en Events Manager tienes configurados eventos como *ViewCart* o *Share*, nunca se van a disparar porque ni siquiera son eventos estándar de Meta y nada en el front los envía.
2. **ViewContent solo en `/producto/:slug`.** Las tarjetas del listado tienen `data-meta-event="ViewContent"` pero nunca llaman a `trackViewContent`. Resultado: Meta cree que casi nadie ve productos.
3. **PageView duplicado/perdido.** `initMetaPixel` dispara un PageView inmediato y `MetaPixelProvider` envía otro al cambiar de ruta — pero la primera navegación interna se omite por el `lastPathRef`. Mezcla de duplicados y huecos.
4. **Sin deduplicación ni `eventID`.** Si más adelante activas Conversions API (CAPI) por servidor, los eventos se contarán doble.
5. **Eventos no-estándar mezclados con estándar.** `RemoveFromCart` se envía como `trackCustom`, pero el botón de compartir o el de "ver carrito" no envían nada. Inconsistente.

---

## Plan de mejora

### 1. Limpiar el inventario de eventos
Dejar **solo eventos estándar de Meta** (los que Meta optimiza para anuncios) más 1–2 custom útiles:

| Evento | Cuándo se dispara | Datos enviados |
|---|---|---|
| `PageView` | Carga inicial + cada cambio de ruta (sin duplicar) | `content_category` = delivery/local |
| `ViewContent` | Entrar a `/producto/:slug` **y** al hacer hover/tap sostenido en una card del listado (con throttle de 1s por producto) | id, nombre, categoría, precio, currency |
| `Search` | Al escribir en el buscador (debounce 800ms, mínimo 3 chars) | `search_string` |
| `AddToCart` | Click en "Agregar al carrito" en cualquier surface | id, nombre, value, currency, quantity |
| `InitiateCheckout` | Entrar al `/checkout` con items | content_ids, num_items, value |
| `AddPaymentInfo` | Seleccionar método de pago | método, value, currency |
| `Purchase` | Confirmación de orden | order_id, value, content_ids, num_items |
| `Contact` | Click en WhatsApp (hero, header, sticky, floating, checkout) | `content_category` = origen |
| `Lead` *(nuevo)* | Primer click en WhatsApp de la sesión | source |
| `ViewCart` *(custom)* | Abrir el drawer del carrito | num_items, value |

Eventos **a eliminar** de la configuración en Events Manager si los tienes ahí: `Share`, `ViewCart` (como estándar), `RemoveFromCart`, cualquier custom que no esté en la tabla.

### 2. Reescribir `src/lib/metaPixel.ts`
- Añadir helper `generateEventId()` (UUID v4 corto) y enviarlo en cada `fbq('track', ...)` como tercer argumento `{ eventID }`. Prepara para CAPI sin doble conteo.
- Añadir `trackViewCart(items, value)` como custom único.
- Añadir `trackLead(source)` estándar.
- Eliminar `trackRemoveFromCart` (no aporta a optimización de anuncios y ensucia los datos).
- Guard de inicialización ya existe — añadir además una cola: si se llama un track antes de `initMetaPixel`, encolar y reproducir al inicializar (hoy se pierden los eventos de los primeros ~200ms de la sesión).

### 3. Arreglar disparos reales
- **`MetaPixelProvider`**: quitar el doble PageView. Que `initMetaPixel` NO envíe PageView; que el provider lo envíe siempre en cada cambio de ruta **incluida la primera**.
- **`MenuCard` y `CompactProductCard`**: añadir `trackViewContent` en `onMouseEnter`/`onTouchStart` con throttle por id (Set en `useRef`) — así el listado sí genera ViewContent.
- **`CartDrawer`**: en el `onOpenChange(true)` llamar `trackViewCart`.
- **`CartDrawer` botón checkout**: ya navega a `/checkout`, donde `InitiateCheckout` dispara — quitar el `data-meta-event="InitiateCheckout"` redundante.
- **WhatsApp (FloatingWhatsApp, Hero, MenuHeader, StickyActionBar, Checkout)**: además de `Contact`, disparar `Lead` la primera vez de la sesión (flag en `sessionStorage`).
- **Eliminar todos los atributos `data-meta-event` del JSX** — son ruido que confunde y hace pensar que disparan algo. Si quieres conservarlos por GTM, lo dejamos pero documentado.

### 4. Throttling y calidad de datos
- `Search`: subir debounce a 800ms y mínimo 3 caracteres (hoy dispara con cada tecla).
- `ViewContent` en listado: throttle 1 evento por producto por sesión.
- Verificar que `precio_usd` nunca llegue `undefined` (validar antes de enviar).

### 5. Verificación
- Después del cambio, validar con la extensión **Meta Pixel Helper** en Chrome recorriendo el flujo: home → click card → producto → add to cart → abrir carrito → checkout → seleccionar pago → confirmar → WhatsApp.
- En Events Manager > Test Events, confirmar que solo aparecen los 10 eventos de la tabla y que cada uno trae `value`, `currency`, `content_ids`.

---

## Archivos a modificar

- `src/lib/metaPixel.ts` — reescritura (cola, eventID, trackViewCart, trackLead, quitar trackRemoveFromCart, quitar PageView inicial).
- `src/components/MetaPixelProvider.tsx` — PageView en primera ruta.
- `src/components/MenuCard.tsx` y `src/components/CompactProductCard.tsx` — ViewContent on hover/tap con throttle.
- `src/components/cart/CartDrawer.tsx` — trackViewCart al abrir; limpiar markers.
- `src/components/cart/AddToCartButton.tsx` — quitar trackRemoveFromCart.
- `src/hooks/useSearch.ts` y `src/components/SearchBar.tsx` — debounce 800ms / min 3 chars.
- `src/components/FloatingWhatsApp.tsx`, `HeroSection.tsx`, `MenuHeader.tsx`, `StickyActionBar.tsx`, `pages/Checkout.tsx` — añadir `trackLead` 1ª vez por sesión.
- (Opcional) limpiar atributos `data-meta-event` del JSX si confirmas que no los usas en GTM.

## Preguntas antes de implementar

1. ¿Quieres que **elimine los atributos `data-meta-event`** del JSX, o los usas desde GTM como triggers?
2. ¿Activamos también **Conversions API (CAPI)** vía edge function para Purchase/Lead? (mejora atribución iOS pero requiere token de Meta).
3. ¿El evento `ViewCart` lo mantenemos como custom, o lo descartamos por completo?
