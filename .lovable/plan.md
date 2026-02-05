

## Redirección de /menu y Configuración de Favicon

### Resumen
Implementaré una redirección de la ruta `/menu` hacia la página principal `/` para preservar el posicionamiento en Google, y verificaré que el favicon de Catarsis esté correctamente configurado en todas las páginas.

---

### Análisis del Estado Actual

**Favicon:**
- El archivo `public/favicon.png` existe y está correctamente referenciado en `index.html` (línea 6)
- La configuración actual es correcta: `<link rel="icon" href="/favicon.png" type="image/png" />`
- Todas las páginas de la aplicación heredan este favicon automáticamente

**Ruta /menu:**
- Actualmente no existe una ruta `/menu` definida en `App.tsx`
- Los usuarios que acceden a `/menu` desde Google ven la página 404 (NotFound)

---

### Cambios a Realizar

#### 1. Agregar Redirección /menu → / en `src/App.tsx`

Crearé un componente de redirección que envíe a los usuarios desde `/menu` a la página principal, preservando el SEO:

```text
┌─────────────────────────────────────────────────────────┐
│  Usuario accede a catarsiszone.com/menu                 │
│                       ↓                                 │
│  React Router detecta ruta /menu                        │
│                       ↓                                 │
│  Navigate component redirige a /                        │
│                       ↓                                 │
│  Usuario ve la página principal con el menú completo    │
└─────────────────────────────────────────────────────────┘
```

**Modificación en `App.tsx`:**
- Importar el componente `Navigate` de react-router-dom
- Agregar una nueva ruta: `<Route path="/menu" element={<Navigate to="/" replace />} />`

#### 2. Verificar Favicon (Ya Configurado)

El favicon ya está correctamente configurado:
- Archivo: `public/favicon.png` 
- Referencia en HTML: `<link rel="icon" href="/favicon.png" type="image/png" />`
- Este favicon se aplica automáticamente a todas las páginas de la SPA

**Nota:** Si el favicon no se muestra en algún navegador, puede ser un problema de caché. Los usuarios pueden forzar la actualización con Ctrl+F5 o borrar la caché del navegador.

---

### Detalles Técnicos

#### Archivo: `src/App.tsx`

**Línea 6 - Agregar Navigate al import:**
```typescript
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
```

**Línea 62 - Agregar nueva ruta (después de la ruta raíz):**
```typescript
<Route path="/" element={<Index />} />
<Route path="/menu" element={<Navigate to="/" replace />} />
```

El atributo `replace` asegura que:
- La URL `/menu` no quede en el historial del navegador
- Los usuarios puedan usar el botón "Atrás" correctamente
- Google eventualmente actualizará su índice a la URL canónica

---

### Beneficios

| Aspecto | Antes | Después |
|---------|-------|---------|
| /menu | Página 404 | Redirige a página principal |
| SEO Google | Link roto | Preserva tráfico orgánico |
| Experiencia usuario | Error | Flujo continuo |
| Favicon | ✅ Configurado | ✅ Sin cambios necesarios |

---

### Consideraciones SEO Adicionales

Para informar a Google sobre la redirección permanente, el sitemap ya tiene configurada la URL canónica correcta (`https://www.catarsiszone.com/`). La redirección del lado del cliente funcionará para los usuarios, y Google eventualmente actualizará su índice.

Si deseas una redirección HTTP 301 (más eficiente para SEO), esto requeriría configuración a nivel del servidor/hosting (Netlify, Vercel, etc.) con un archivo `_redirects` o similar.

