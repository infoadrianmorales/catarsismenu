
# Plan: Sistema Dual - Modo Local vs Delivery

## Resumen

Implementar un sistema de contexto que detecte automáticamente el modo de visualización basándose en la URL, adaptando la interfaz para cada caso de uso.

| Modo | URL | Características |
|------|-----|-----------------|
| **Delivery** | `/` | Hero con slides, todos los CTAs, carrito, WhatsApp flotante |
| **Local** | `/menu` | Hero estático (1 imagen), solo Instagram, sin carrito, sin WhatsApp |

---

## Archivos a Crear/Modificar

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/contexts/ViewModeContext.tsx` | Crear | Contexto para detectar y compartir el modo |
| `src/pages/MenuLocal.tsx` | Crear | Página del menú local |
| `src/components/HeroSection.tsx` | Modificar | Aceptar prop `mode` para adaptar comportamiento |
| `src/App.tsx` | Modificar | Agregar ruta `/menu` y provider del contexto |

---

## Detalles Técnicos

### 1. ViewModeContext

```typescript
type ViewMode = 'delivery' | 'local';

interface ViewModeContextType {
  mode: ViewMode;
  isDeliveryMode: boolean;
  isLocalMode: boolean;
}
```

El contexto detectará el modo basándose en:
- Ruta `/menu` → modo local
- Query param `?mode=local` → modo local
- Cualquier otra cosa → modo delivery

### 2. HeroSection Adaptativo

**Modo Delivery (actual):**
- Carousel de slides desde la base de datos
- Flechas de navegación y dots
- Botones: WhatsApp, Instagram, Cómo llegar

**Modo Local (nuevo):**
- Imagen estática única (primer slide o fallback)
- Sin carousel, sin flechas, sin dots
- Solo botón de Instagram

```text
┌─────────────────────────────────────────┐
│                                         │
│         [Imagen Hero Estática]          │
│                                         │
│           ┌─────────────────┐           │
│           │  📸 Instagram   │           │
│           └─────────────────┘           │
│  ════════════════════════════════════   │  ← Tape divider
└─────────────────────────────────────────┘
```

### 3. Página MenuLocal

Nueva página simplificada que:
- Usa `HeroSection` con `mode="local"`
- Muestra el menú completo por categorías
- Sin `FloatingCartButton`
- Sin `StickyActionBar` (o versión simplificada sin carrito/WhatsApp)
- Sin `FloatingWhatsApp`

### 4. Componentes Ocultados en Modo Local

| Componente | Delivery | Local |
|------------|----------|-------|
| Hero Carousel | ✅ | ❌ (imagen única) |
| Botón WhatsApp (Hero) | ✅ | ❌ |
| Botón Cómo llegar (Hero) | ✅ | ❌ |
| Botón Instagram (Hero) | ✅ | ✅ |
| FloatingCartButton | ✅ | ❌ |
| StickyActionBar | ✅ | ❌ o simplificado |
| FloatingWhatsApp | ✅ | ❌ |
| Botón "Agregar" en productos | ✅ | ❌ |

---

## URLs para QR Codes

**Para el local (tablets/QR):**
```
https://catarsismenu.lovable.app/menu
```

**Para delivery/marketing:**
```
https://catarsismenu.lovable.app
```

---

## Flujo de Tracking Meta Pixel

Ambos modos tendrán tracking, pero con eventos diferenciados:

| Evento | Delivery | Local |
|--------|----------|-------|
| PageView | ✅ con `mode=delivery` | ✅ con `mode=local` |
| ViewContent | ✅ | ✅ |
| AddToCart | ✅ | ❌ |
| InitiateCheckout | ✅ | ❌ |
| Purchase | ✅ | ❌ |
| Contact (WhatsApp) | ✅ | ❌ |

Esto te permitirá segmentar audiencias en Meta Ads basándote en el comportamiento.

---

## Resultado Visual - Modo Local

```text
┌────────────────────────────────────────────┐
│ [Logo Catarsis]              [USD│VES]     │  Header simplificado
├────────────────────────────────────────────┤
│                                            │
│           [Imagen Hero Única]              │  Sin carousel
│                                            │
│              [📸 Instagram]                │  Solo este CTA
│                                            │
│  ═══════ TAPE DIVIDER ════════════════     │
├────────────────────────────────────────────┤
│  🔥 Best Seller                            │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐              │  Sin botón agregar
│  │ 🍔 │ │ 🍕 │ │ 🥗 │ │ 🍹 │              │
│  └────┘ └────┘ └────┘ └────┘              │
│                                            │
│  🍔 Hamburguesas Gourmet                   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐              │
│  │    │ │    │ │    │ │    │              │
│  └────┘ └────┘ └────┘ └────┘              │
│                                            │
│  [Footer con redes sociales]               │
└────────────────────────────────────────────┘
                  ↑
         Sin StickyActionBar
         Sin FloatingWhatsApp
         Sin FloatingCartButton
```

---

## Pasos de Implementación

1. **Crear ViewModeContext** - Contexto que detecta el modo por URL
2. **Modificar HeroSection** - Aceptar prop `mode` para cambiar comportamiento
3. **Crear MenuLocal.tsx** - Página simplificada para el local
4. **Actualizar App.tsx** - Agregar ruta `/menu` y wrapper del contexto
5. **Adaptar tracking** - Incluir `mode` en eventos de Meta Pixel
