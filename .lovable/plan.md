

## Optimizar integración con Meta Pixel

### Mejoras a implementar

**1. Disparar `trackSearch` con debounce**
- Archivo: `src/hooks/useSearch.ts`
- Agregar un `useEffect` con debounce de 500ms que llame a `trackSearch(query)` cuando el usuario deje de escribir
- Esto activa el evento estandar `Search` de Meta que actualmente solo existe como funcion pero nunca se ejecuta

**2. Agregar evento `AddPaymentInfo`**
- Archivo: `src/lib/metaPixel.ts` — agregar funcion `trackAddPaymentInfo(method, value)`
- Archivo: `src/pages/Checkout.tsx` — disparar cuando el usuario selecciona un metodo de pago
- Este es un evento estandar de Meta que mejora la atribucion de conversiones

**3. Agregar evento custom `ViewCategory`**
- Archivo: `src/pages/CategoryPage.tsx` — agregar un `useEffect` que dispare `trackCustomEvent('ViewCategory', { category: slug })` al cargar la pagina de categoria
- Permite construir audiencias segmentadas por interes en categorias especificas

**4. Agregar evento custom `RemoveFromCart`**
- Archivo: `src/lib/metaPixel.ts` — agregar funcion `trackRemoveFromCart(product)`
- Archivo: `src/components/cart/AddToCartButton.tsx` — disparar en `handleDecrease` cuando se elimina del carrito
- Util para remarketing y entender patrones de abandono

**5. Agregar `data-meta-event` e IDs a tarjetas de producto**
- Archivo: `src/components/CompactProductCard.tsx` — agregar `data-meta-event="ViewContent"` e `id={product-card-${item.id}}` al Link/Card principal
- Archivo: `src/components/MenuCard.tsx` — igual
- Permite mapear clicks en productos desde el Event Setup Tool

### Resumen de cambios por archivo

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useSearch.ts` | Agregar debounce para disparar `trackSearch` |
| `src/lib/metaPixel.ts` | Agregar `trackAddPaymentInfo` y `trackRemoveFromCart` |
| `src/pages/Checkout.tsx` | Disparar `trackAddPaymentInfo` al seleccionar metodo de pago |
| `src/pages/CategoryPage.tsx` | Disparar `trackCustomEvent('ViewCategory')` al cargar |
| `src/components/CompactProductCard.tsx` | Agregar atributos `data-meta-event` e `id` |
| `src/components/MenuCard.tsx` | Agregar atributos `data-meta-event` e `id` |
| `src/components/cart/AddToCartButton.tsx` | Disparar `trackRemoveFromCart` al eliminar producto |

### Eventos resultantes (despues de los cambios)

```text
Embudo completo:
PageView -> Search -> ViewCategory -> ViewContent -> AddToCart -> RemoveFromCart (si aplica)
-> InitiateCheckout -> AddPaymentInfo -> Purchase -> Contact
```

Todos estos son eventos estandar o custom reconocidos por Meta, lo que mejora la optimizacion de campanas, la creacion de audiencias y la atribucion de conversiones.
