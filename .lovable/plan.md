

# Plan: Cambiar Ícono de Categoría Hamburguesas

## Cambio Requerido

Reemplazar el ícono `Beef` (carne/res) por `Hamburger` (hamburguesa) para la categoría de hamburguesas.

---

## Ubicaciones a Actualizar

| Ubicación | Cambio |
|-----------|--------|
| `src/components/CategoryFilter.tsx` | Cambiar importación y uso de `Beef` por `Hamburger` |
| Base de datos (tabla `categories`) | Actualizar campo `icono` de `'Beef'` a `'Hamburger'` |

---

## Implementación

### Paso 1: Actualizar CategoryFilter.tsx

```tsx
// Antes
import { Beef, ... } from 'lucide-react';
{ id: 'hamburguesas', label: 'Hamburguesas', icon: <Beef className="h-4 w-4" /> }

// Después  
import { Hamburger, ... } from 'lucide-react';
{ id: 'hamburguesas', label: 'Hamburguesas', icon: <Hamburger className="h-4 w-4" /> }
```

### Paso 2: Actualizar Base de Datos

```sql
UPDATE categories 
SET icono = 'Hamburger' 
WHERE slug = 'hamburguesas';
```

---

## Resultado Visual

El ícono cambiará de una pieza de carne a una hamburguesa completa con pan, que es más representativo de la categoría.

