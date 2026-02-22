

## Reemplazar boton flotante de WhatsApp por carrito orientado a compra

### Problema actual

El boton flotante de WhatsApp en desktop (`FloatingWhatsApp`) y el boton "Pedir" en la barra movil (`StickyActionBar`) desvian al usuario del flujo de compra. El objetivo principal es que los usuarios completen el proceso de compra a traves del carrito, no que escriban por WhatsApp.

### Cambios propuestos

**1. Desktop: Reemplazar FloatingWhatsApp por FloatingCart**

Eliminar el componente `FloatingWhatsApp` y crear un nuevo boton flotante de carrito para desktop que:
- Se muestre solo cuando hay productos en el carrito (igual que el movil actual)
- Tenga animacion de "bounce" al agregar un producto nuevo
- Muestre el numero de items y el subtotal
- Al hacer clic, abra el CartDrawer (drawer lateral)
- Posicion: esquina inferior derecha, mismo lugar donde estaba el WhatsApp
- Estilo: color `secondary` (amarillo de marca) con sombra y efecto hover

**2. Movil: StickyActionBar orientada a compra**

Modificar la barra inferior movil para priorizar la compra:
- Mantener el toggle de moneda (USD/VES) a la izquierda
- Mantener el boton de compartir
- Reemplazar el boton "Pedir" (WhatsApp) por un boton de "Carrito" que muestre el conteo de items
- Cuando hay items en el carrito, el boton cambia a mostrar el total y lleva a `/carrito`
- WhatsApp se mueve a un icono secundario mas pequeno (ghost) para no perder el canal de contacto completamente

**3. FloatingCartButton (movil)**

Mantener el `FloatingCartButton` existente que aparece sobre la `StickyActionBar` cuando hay productos. Ya funciona correctamente.

**4. App.tsx: Limpiar referencia a FloatingWhatsApp**

- Eliminar la importacion y el renderizado de `FloatingWhatsApp` del componente `AppContent`
- Eliminar la logica de `hideFloatingWhatsApp`

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/FloatingWhatsApp.tsx` | Reescribir como `FloatingCart` para desktop: boton flotante de carrito con badge, animacion bounce al agregar items, abre CartDrawer |
| `src/components/StickyActionBar.tsx` | Reemplazar boton WhatsApp "Pedir" por boton de carrito con badge de items. Mover WhatsApp a icono ghost secundario |
| `src/App.tsx` | Reemplazar `FloatingWhatsApp` por el nuevo `FloatingCart`, sin logica de ocultar en admin/auth |
| `src/pages/Index.tsx` | Sin cambios necesarios (FloatingCartButton movil ya esta incluido) |

### Detalle tecnico

**FloatingCart (desktop) - reemplaza FloatingWhatsApp:**
- Solo visible en `hidden md:flex` (desktop)
- Solo se renderiza si `totalItems > 0`
- Animacion de entrada `animate-in fade-in scale-in` cuando aparece
- Animacion de "bounce" (`animate-bounce`) brevemente al cambiar `totalItems`
- Usa `CartDrawer` internamente como Sheet trigger
- Muestra badge con numero de items y subtotal formateado

**StickyActionBar (movil) - cambios:**
- Boton principal cambia de WhatsApp a carrito
- Cuando `totalItems > 0`: muestra "Carrito (N)" con badge y navega a `/carrito`
- Cuando `totalItems === 0`: muestra "Ver menu" o el boton de compartir toma mas espacio
- WhatsApp se convierte en un icono ghost pequeno al lado del share, para mantener el canal de contacto sin protagonismo

**Flujo resultante:**
```text
Usuario en el menu
    |
    v
Agrega producto al carrito
    |
    +--> Desktop: aparece boton flotante de carrito (esquina inferior derecha)
    |      Click -> abre CartDrawer -> Finalizar Compra -> /checkout
    |
    +--> Movil: aparece FloatingCartButton + StickyActionBar muestra "Carrito"
           Click FloatingCartButton -> /carrito -> Finalizar Compra -> /checkout
           Click "Carrito" en StickyActionBar -> /carrito
```
