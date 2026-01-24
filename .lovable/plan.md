
# Plan: Integración Completa de Meta Pixel (Facebook Pixel)

## Resumen

Implementaremos el Meta Pixel para rastrear conversiones y optimizar campañas publicitarias en Facebook/Instagram. La integración incluirá configuración dinámica desde el panel de administración y eventos avanzados de e-commerce.

---

## Eventos a Implementar

| Evento | Descripción | Ubicación |
|--------|-------------|-----------|
| **PageView** | Cada vista de página | Global (cambio de ruta) |
| **ViewContent** | Ver página de producto | `ProductPage.tsx` |
| **AddToCart** | Agregar producto al carrito | `AddToCartButton.tsx` |
| **InitiateCheckout** | Entrar al checkout | `Checkout.tsx` |
| **Purchase** | Compra completada | `Checkout.tsx` (éxito) |
| **Contact** | Clic en WhatsApp | Hero, StickyBar, FloatingWA |
| **Search** | Búsqueda de productos | `useSearch.ts` |

---

## Fase 1: Configuración en Base de Datos

### 1.1 Nuevas claves en tabla `config`

Se insertarán dos nuevas configuraciones:

| Key | Valor Inicial | Descripción |
|-----|---------------|-------------|
| `meta_pixel_id` | `""` | ID del Pixel (15-16 dígitos) |
| `meta_pixel_enabled` | `"false"` | Activa/desactiva el tracking |

---

## Fase 2: Servicio Centralizado de Meta Pixel

### 2.1 Crear `src/lib/metaPixel.ts`

Servicio que manejará todas las interacciones con el Pixel:

```text
Funciones:
├── initMetaPixel(pixelId: string)
│   └── Inyecta el script base de Facebook dinámicamente
│
├── trackPageView()
│   └── fbq('track', 'PageView')
│
├── trackViewContent(product)
│   └── fbq('track', 'ViewContent', {
│         content_ids: [id],
│         content_name: nombre,
│         content_category: categoria,
│         content_type: 'product',
│         value: precio_usd,
│         currency: 'USD'
│       })
│
├── trackAddToCart(product, quantity)
│   └── fbq('track', 'AddToCart', {
│         content_ids: [id],
│         content_name: nombre,
│         content_type: 'product',
│         value: precio_usd * quantity,
│         currency: 'USD'
│       })
│
├── trackInitiateCheckout(items, subtotal)
│   └── fbq('track', 'InitiateCheckout', {
│         content_ids: items.map(i => i.id),
│         num_items: totalItems,
│         value: subtotal,
│         currency: 'USD'
│       })
│
├── trackPurchase(orderId, value, items)
│   └── fbq('track', 'Purchase', {
│         value,
│         currency: 'USD',
│         content_ids: items.map(i => i.id),
│         order_id: orderId,
│         num_items: items.length
│       })
│
├── trackContact(source)
│   └── fbq('track', 'Contact', {
│         content_category: source
│       })
│
└── trackSearch(query)
    └── fbq('track', 'Search', {
          search_string: query
        })
```

### 2.2 Consideraciones Técnicas

- El script se inyecta solo si hay Pixel ID configurado y habilitado
- Verificación de `window.fbq` antes de cada llamada
- Compatibilidad total con el sistema de analytics existente

---

## Fase 3: Panel de Administración

### 3.1 Nueva sección en `ConfigPanel.tsx`

Se agregará una nueva tarjeta "Meta Pixel (Facebook)" con:

| Campo | Descripción |
|-------|-------------|
| Pixel ID | Input para el ID de 15-16 dígitos |
| Habilitado | Switch para activar/desactivar |
| Estado | Badge verde si está activo |
| Ayuda | Link a documentación de Meta |

### 3.2 Validación

- El Pixel ID debe ser numérico (15-16 dígitos)
- Mostrar error visual si el formato es inválido
- Guardado automático al modificar

---

## Fase 4: Proveedor Global

### 4.1 Crear `src/components/MetaPixelProvider.tsx`

Componente que:
1. Obtiene el Pixel ID de la configuración
2. Inicializa el Pixel si está configurado y habilitado
3. Escucha cambios de ruta para disparar `PageView`

### 4.2 Integrar en `App.tsx`

Envolver la aplicación con el proveedor para tracking global.

---

## Fase 5: Integración en Componentes

### 5.1 Eventos de Producto

| Archivo | Evento | Cuándo |
|---------|--------|--------|
| `ProductPage.tsx` | `ViewContent` | Al cargar la página de producto |
| `AddToCartButton.tsx` | `AddToCart` | Al agregar producto al carrito |

### 5.2 Eventos de Checkout

| Archivo | Evento | Cuándo |
|---------|--------|--------|
| `Checkout.tsx` | `InitiateCheckout` | Al entrar al checkout |
| `Checkout.tsx` | `Purchase` | Al completar la orden exitosamente |

### 5.3 Eventos de Contacto

| Archivo | Evento | Cuándo |
|---------|--------|--------|
| `HeroSection.tsx` | `Contact` | Clic en botón WhatsApp |
| `StickyActionBar.tsx` | `Contact` | Clic en botón "Pedir" |
| `FloatingWhatsApp.tsx` | `Contact` | Clic en botón flotante |

### 5.4 Eventos de Búsqueda

| Archivo | Evento | Cuándo |
|---------|--------|--------|
| `useSearch.ts` | `Search` | Al buscar productos (debounced) |

---

## Archivos a Crear

| Archivo | Propósito |
|---------|-----------|
| `src/lib/metaPixel.ts` | Servicio centralizado de Meta Pixel |
| `src/components/MetaPixelProvider.tsx` | Proveedor global de inicialización |

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/hooks/useConfig.ts` | Agregar campos `meta_pixel_id` y `meta_pixel_enabled` |
| `src/components/admin/ConfigPanel.tsx` | Nueva sección de configuración del Pixel |
| `src/App.tsx` | Integrar `MetaPixelProvider` |
| `src/pages/ProductPage.tsx` | Agregar evento `ViewContent` |
| `src/components/cart/AddToCartButton.tsx` | Agregar evento `AddToCart` |
| `src/pages/Checkout.tsx` | Agregar eventos `InitiateCheckout` y `Purchase` |
| `src/components/HeroSection.tsx` | Agregar evento `Contact` |
| `src/components/StickyActionBar.tsx` | Agregar evento `Contact` |
| `src/components/FloatingWhatsApp.tsx` | Agregar evento `Contact` |
| `src/hooks/useSearch.ts` | Agregar evento `Search` |

---

## Cambios en Base de Datos

### Migración SQL

```sql
INSERT INTO config (key, value) 
VALUES 
  ('meta_pixel_id', ''),
  ('meta_pixel_enabled', 'false')
ON CONFLICT (key) DO NOTHING;
```

---

## Flujo de Datos

```text
Usuario navega
       │
       ▼
┌─────────────────────────────┐
│   MetaPixelProvider         │
│   - Inicializa Pixel        │
│   - Escucha cambios ruta    │
└──────────────┬──────────────┘
               │
     ┌─────────┴─────────┐
     │                   │
     ▼                   ▼
PageView           Evento específico
(automático)       (según acción)
     │                   │
     └─────────┬─────────┘
               │
               ▼
        ┌─────────────┐
        │  Meta Ads   │
        │  Manager    │
        └─────────────┘
```

---

## Resultado Esperado

1. **Panel de Admin**: Nueva sección para configurar Meta Pixel
2. **Tracking Automático**: `PageView` en cada navegación
3. **Eventos E-commerce**: `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`
4. **Eventos Contacto**: Cada clic en WhatsApp registrado
5. **Búsquedas**: Rastreo de qué buscan los usuarios
6. **Sin código hardcoded**: El Pixel ID se configura desde el admin
7. **Compatible**: El sistema de analytics interno sigue funcionando

---

## Verificación Post-Implementación

Para verificar que el Pixel funciona:

1. Instalar extensión "Meta Pixel Helper" en Chrome
2. Navegar por el sitio
3. Verificar que los eventos aparecen en la extensión
4. Confirmar en Meta Events Manager que los eventos llegan
