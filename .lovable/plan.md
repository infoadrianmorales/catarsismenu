

## Solución: Hacer Botones Detectables por Meta Pixel Event Setup Tool

### Problema
La herramienta de configuración de eventos manuales de Meta (Event Setup Tool) no puede seleccionar los botones importantes de la página porque:
1. Los botones usan `e.stopPropagation()` que bloquea la detección de clics por parte de la herramienta de Meta
2. Los botones no tienen atributos `id` ni `data-*` que Meta pueda usar para identificarlos

### Solución
Agregar atributos `data-meta-event` e `id` descriptivos a todos los botones clave para que la herramienta de Meta pueda identificarlos y seleccionarlos.

---

### Botones Afectados y Cambios

#### 1. Botón "Agregar al carrito" (`src/components/cart/AddToCartButton.tsx`)
- Agregar `data-meta-event="AddToCart"` y `id="add-to-cart-btn"` a los botones de agregar
- Estos son los botones mas importantes para rastrear conversiones

#### 2. Botón "Pedir" en barra inferior (`src/components/StickyActionBar.tsx`)
- Agregar `data-meta-event="Contact"` e `id="sticky-whatsapp-btn"` al boton de WhatsApp
- Agregar `data-meta-event="Share"` e `id="sticky-share-btn"` al boton de compartir

#### 3. Botón flotante de WhatsApp (`src/components/FloatingWhatsApp.tsx`)
- Agregar `data-meta-event="Contact"` e `id="floating-whatsapp-btn"`

#### 4. Botón "Enviar Pedido" en checkout (`src/pages/Checkout.tsx`)
- Agregar `data-meta-event="Purchase"` e `id="checkout-submit-btn"` al boton de enviar pedido

#### 5. Botón del carrito (`src/components/cart/CartButton.tsx`)
- Agregar `data-meta-event="ViewCart"` e `id="cart-btn"`

#### 6. Botón flotante del carrito (`src/components/cart/FloatingCartButton.tsx`)
- Agregar `data-meta-event="ViewCart"` e `id="floating-cart-btn"`

---

### Detalles Tecnicos

Los cambios son simples: agregar atributos HTML a los elementos `<Button>` y `<button>` existentes.

**Ejemplo del cambio en AddToCartButton.tsx:**

Antes:
```typescript
<Button
  size="icon"
  onClick={handleAdd}
  className="h-8 w-8 bg-primary hover:bg-primary/90 shrink-0"
>
```

Despues:
```typescript
<Button
  size="icon"
  onClick={handleAdd}
  className="h-8 w-8 bg-primary hover:bg-primary/90 shrink-0"
  data-meta-event="AddToCart"
  id={`add-to-cart-${product.id}`}
>
```

**Archivos a modificar:**

| Archivo | Cambio |
|---------|--------|
| `src/components/cart/AddToCartButton.tsx` | Agregar `data-meta-event` e `id` a 2 botones de agregar |
| `src/components/StickyActionBar.tsx` | Agregar atributos a botones Pedir y Compartir |
| `src/components/FloatingWhatsApp.tsx` | Agregar atributos al boton flotante |
| `src/pages/Checkout.tsx` | Agregar atributos al boton de enviar pedido |
| `src/components/cart/CartButton.tsx` | Agregar atributos al boton del carrito |
| `src/components/cart/FloatingCartButton.tsx` | Agregar atributos al boton flotante del carrito |

---

### Como Usarlo en Meta

Despues de aplicar estos cambios:
1. Ir a Meta Events Manager
2. Abrir la herramienta de configuracion de eventos (Event Setup Tool)
3. Los botones ahora seran seleccionables gracias a los atributos `data-meta-event`
4. Meta podra vincular cada boton con su evento correspondiente (AddToCart, Contact, Purchase, etc.)

### Beneficio
No se modifica ningun comportamiento funcional. Solo se agregan atributos HTML que permiten a Meta identificar los elementos interactivos.
