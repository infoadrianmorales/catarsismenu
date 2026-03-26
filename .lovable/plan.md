

## Plan: Corregir warning de fetchPriority en HeroSection

### Problema
La consola muestra un error de React: `React does not recognize the 'fetchPriority' prop on a DOM element`. React 18 no reconoce `fetchPriority` como prop válida en `<img>`. Esto genera un warning en consola pero **no impide que la página se muestre**.

La página probablemente no se veía temporalmente porque el servidor Vite se estaba reiniciando (log: "server connection lost. Polling for restart..."). Esto es normal después de editar archivos.

### Corrección
**`src/components/HeroSection.tsx` L140** — Cambiar `fetchPriority` a `fetchpriority` (lowercase), que es el atributo HTML estándar:

```tsx
// Antes
fetchPriority={index === 0 ? 'high' : undefined}

// Después — usar spread para evitar el warning de React 18
{...(index === 0 ? { fetchpriority: 'high' } : {})}
```

Un solo cambio de línea. Elimina el warning de consola sin afectar funcionalidad.

