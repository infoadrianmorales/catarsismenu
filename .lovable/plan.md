
# Plan: Corregir Scroll al Inicio en Navegación

## Problema Identificado

Cuando el usuario navega a `/carrito` (u otras páginas) desde la página principal, el navegador mantiene la posición de scroll anterior. Esto causa que la página del carrito aparezca mostrando el contenido desde abajo o desde una posición intermedia, en lugar de comenzar desde arriba.

**Causa técnica**: React Router no tiene configurado el scroll restoration automático.

---

## Solución

Crear un componente `ScrollToTop` que detecte cambios de ruta y ejecute `window.scrollTo(0, 0)` para restablecer el scroll al inicio de cada página.

---

## Cambios Técnicos

### 1. Crear componente `ScrollToTop.tsx`

Nuevo archivo: `src/components/ScrollToTop.tsx`

```tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
```

Este componente:
- Escucha cambios en `pathname` usando `useLocation()`
- Ejecuta `window.scrollTo(0, 0)` cada vez que cambia la ruta
- No renderiza nada (retorna `null`)

### 2. Agregar ScrollToTop a App.tsx

Modificar `src/App.tsx` para incluir el componente dentro del `BrowserRouter`:

```tsx
import { ScrollToTop } from './components/ScrollToTop';

const AppContent = () => {
  const location = useLocation();
  const hideFloatingWhatsApp = location.pathname === '/admin' || location.pathname === '/auth';

  return (
    <MetaPixelProvider>
      <ScrollToTop /> {/* ← Agregar aquí */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ... rutas existentes ... */}
        </Routes>
      </Suspense>
      {!hideFloatingWhatsApp && <FloatingWhatsApp />}
    </MetaPixelProvider>
  );
};
```

---

## Resumen de Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/ScrollToTop.tsx` | Crear - Componente de scroll restoration |
| `src/App.tsx` | Modificar - Agregar ScrollToTop al layout |

---

## Comportamiento Esperado

| Acción | Antes | Después |
|--------|-------|---------|
| Click en botón flotante del carrito | Página carga desde posición de scroll anterior | Página carga desde arriba |
| Navegar a cualquier página | Mantiene scroll | Siempre inicia desde arriba |
| Volver al menú desde carrito | Posición inconsistente | Inicia desde arriba |

---

## Resultado

Todas las navegaciones entre páginas iniciarán con el scroll en la posición `(0, 0)`, proporcionando una experiencia de usuario consistente y esperada.
