
# Plan: Corregir bloqueo de ventanas emergentes en WhatsApp

## Problema Identificado

El navegador está bloqueando la redirección a WhatsApp porque se usa `window.open()` con `_blank`:

```javascript
// Checkout.tsx línea 429
window.open(whatsappUrl, '_blank');  // ← BLOQUEADO como popup
```

Los navegadores móviles (especialmente Chrome en Android y Safari en iOS) bloquean `window.open()` cuando:
1. No es resultado directo de un click del usuario
2. Se ejecuta después de operaciones asíncronas (como guardar en base de datos)

En el checkout, primero se ejecutan varias llamadas a la base de datos y **después** se intenta abrir WhatsApp, lo que el navegador interpreta como popup no solicitado.

---

## Solución

Cambiar de `window.open()` a `window.location.href` para la redirección del checkout. Esto navega la página actual en lugar de abrir una nueva ventana, evitando completamente el bloqueo de popups.

```text
┌─────────────────────────────────────────────┐
│         Usuario hace click en Enviar        │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ Guardar orden en base de datos              │
│ (operaciones asíncronas)                    │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ ANTES: window.open() ← BLOQUEADO            │
│ AHORA: window.location.href ← FUNCIONA      │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ Usuario navega a WhatsApp                   │
│ (sin popup, sin bloqueo)                    │
└─────────────────────────────────────────────┘
```

---

## Cambios Técnicos

### Archivo: `src/pages/Checkout.tsx`

**Línea 429 - Cambio principal:**

```javascript
// ANTES (bloqueado como popup):
window.open(whatsappUrl, '_blank');

// DESPUÉS (navegación directa, sin bloqueo):
window.location.href = whatsappUrl;
```

Este cambio es seguro porque:
- El usuario ya completó el checkout
- El carrito ya fue limpiado
- La orden ya está guardada en la base de datos
- La página de éxito se mostrará cuando el usuario regrese

### Botones auxiliares (sin cambios necesarios)

Los siguientes componentes pueden mantener `window.open()` porque:
- Son clicks directos del usuario (no hay operaciones asíncronas previas)
- No requieren guardar datos antes de redirigir

| Componente | Comportamiento actual | Cambio |
|------------|----------------------|--------|
| `FloatingWhatsApp.tsx` | `window.open()` | Sin cambios (click directo) |
| `StickyActionBar.tsx` | `window.open()` | Sin cambios (click directo) |
| `HeroSection.tsx` | `window.open()` | Sin cambios (click directo) |

---

## Flujo de Usuario Después del Cambio

1. Usuario completa el formulario de checkout
2. Click en "Enviar pedido por WhatsApp"
3. Se guarda la orden en la base de datos
4. **La página actual navega a WhatsApp** (sin ventana emergente)
5. Usuario envía el mensaje en WhatsApp
6. Usuario regresa a la app (botón atrás o link)
7. Si regresa a `/checkout`, verá la pantalla de éxito si hay `lastOrderId` en sessionStorage

---

## Compatibilidad

| Navegador | `window.open()` después de async | `window.location.href` después de async |
|-----------|----------------------------------|----------------------------------------|
| Chrome Android | Bloqueado | Funciona |
| Safari iOS | Bloqueado | Funciona |
| Firefox | A veces bloqueado | Funciona |
| Chrome Desktop | A veces bloqueado | Funciona |

---

## Resultado Esperado

- El checkout redirigirá correctamente a WhatsApp sin ser bloqueado
- El mensaje con el pedido se abrirá en la app de WhatsApp
- La orden quedará guardada en la base de datos
- El usuario podrá regresar a ver la confirmación
