

# Plan: Cambiar Ruta de `/menu` a `/local`

## Objetivo

Renombrar la ruta del menú para escaneo QR de `/menu` a `/local` para mayor claridad semántica.

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Cambiar ruta y array de rutas ocultas |
| `src/contexts/ViewModeContext.tsx` | Actualizar detección de path |

---

## Cambios Detallados

### 1. App.tsx

**Línea 53** - Actualizar array de rutas donde se oculta WhatsApp:
```tsx
// Antes
const hideFloatingWhatsApp = ['/admin', '/auth', '/menu'].includes(location.pathname);

// Después
const hideFloatingWhatsApp = ['/admin', '/auth', '/local'].includes(location.pathname);
```

**Línea 62** - Cambiar la ruta del componente:
```tsx
// Antes
<Route path="/menu" element={<MenuLocal />} />

// Después
<Route path="/local" element={<MenuLocal />} />
```

### 2. ViewModeContext.tsx

**Línea 25** - Actualizar detección del path local:
```tsx
// Antes
const isLocalPath = location.pathname === '/menu';

// Después
const isLocalPath = location.pathname === '/local';
```

---

## Resultado

| Antes | Después |
|-------|---------|
| `https://catarsismenu.lovable.app/menu` | `https://catarsismenu.lovable.app/local` |

---

## Beneficios

- **Claridad**: `/local` indica claramente que es para uso en el local/restaurante
- **Consistencia**: El nombre coincide con el modo `local` del ViewModeContext
- **SEO**: Evita confusión con `/menu` que podría esperarse como menú de navegación

