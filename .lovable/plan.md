

## Plan: Corregir crash por localStorage corrupto + Error Boundary

### Cambios

**1. `src/contexts/CartContext.tsx` (líneas 40-55)**

Reemplazar la lectura sin protección y el guardado sin protección:

```tsx
// Antes (L40-50) — crash si JSON corrupto
const [items, setItems] = useState<CartItem[]>(() => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CartItem[];
      return parsed.filter(item => isValidUUID(item.id));
    }
  }
  return [];
});

// Después — try/catch + validación de array
const [items, setItems] = useState<CartItem[]>(() => {
  // CORRECCIÓN CRÍTICA [CART-STORAGE]: try/catch evita crash
  // si catarsis_cart tiene JSON corrupto
  try {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return parsed.filter(item => isValidUUID(item.id));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
});
```

Proteger también el `useEffect` de persistencia (L52-55):
```tsx
useEffect(() => {
  // CORRECCIÓN [CART-PERSIST]: try/catch para storage lleno o bloqueado
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('CartContext: No se pudo guardar el carrito:', error);
  }
}, [items]);
```

**2. Crear `src/components/ErrorBoundary.tsx`**

Componente class-based que captura errores de render y muestra un fallback con botón "Recargar página" (fondo `#010C23`, botón `#DB1F51`) en lugar de pantalla en blanco. El botón limpia `catarsis_cart` del storage y recarga.

**3. `src/main.tsx`**

Envolver `<App />` con `<ErrorBoundary>`:
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </HelmetProvider>
);
```

### Sin cambios
- Flujo de pedidos, checkout, precios — intactos
- Schemas, SEO, SemanticSEOSection — intactos
- Lógica del carrito (addToCart, removeFromCart, etc.) — intacta

