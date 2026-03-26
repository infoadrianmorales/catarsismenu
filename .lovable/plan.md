
## Plan: corregir el blank screen restante por accesos síncronos a storage fuera de `CartContext`

### Do I know what the issue is?
Sí. El crash más probable ya no está en `CartContext`, sino en otros accesos a storage que siguen ocurriendo antes o durante el render inicial.

### Problema real
Aunque `CartContext` ya quedó protegido, todavía hay dos puntos críticos que pueden seguir dejando la página en blanco:

1. **`src/hooks/useCurrency.ts`**
   - Sigue leyendo `localStorage` en el inicializador de `useState` sin `try/catch`
   - Sigue escribiendo con `localStorage.setItem(...)` sin protección
   - Si el navegador tiene storage bloqueado, corrupto o restringido, puede romper el render de `Index`

2. **`src/integrations/supabase/client.ts`**
   - El cliente se crea con `auth.storage: localStorage`
   - Ese acceso ocurre a nivel de módulo, antes de que React renderice
   - Si `localStorage` lanza `SecurityError` en ese navegador, el `ErrorBoundary` no puede capturarlo y la app queda en blanco

### Por qué el `ErrorBoundary` no basta
El `ErrorBoundary` solo ayuda con errores dentro del árbol de React.  
Si el fallo ocurre durante la carga/import de módulos o al crear el cliente global, la app ni siquiera llega a renderizar el boundary.

### Cambios a aplicar

#### 1. Endurecer `src/hooks/useCurrency.ts`
Agregar comentarios y reemplazar los accesos directos por versión segura:

- Proteger la lectura inicial de `localStorage`
- Si falla, usar `'USD'`
- Proteger también el `setItem`
- No cambiar lógica de moneda ni UI

Patrón:
```ts
const [currency, setCurrency] = useState<Currency>(() => {
  try {
    if (typeof window === 'undefined') return 'USD';
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'VES' || stored === 'USD' ? stored : 'USD';
  } catch (error) {
    console.warn('useCurrency: no se pudo leer moneda_activa:', error);
    return 'USD';
  }
});

useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, currency);
  } catch (error) {
    console.warn('useCurrency: no se pudo guardar moneda_activa:', error);
  }
}, [currency]);
```

#### 2. Endurecer `src/integrations/supabase/client.ts`
Sin editar la lógica de backend, usar un **storage adapter seguro** en vez de pasar `localStorage` directo.

Objetivo:
- Evitar que el acceso a `localStorage` explote al importar el módulo
- Si storage falla, degradar de forma segura a memoria/no-op
- Mantener autenticación persistente cuando el navegador sí lo permita

Implementación propuesta:
- Crear un objeto `safeStorage` con:
  - `getItem`
  - `setItem`
  - `removeItem`
- Cada método envuelto en `try/catch`
- Si falla, devolver `null` o no-op
- Pasar `safeStorage` a `createClient(..., { auth: { storage: safeStorage, ... } })`

Comentario obligatorio explicando que:
- algunos navegadores/modos privados lanzan errores al acceder a storage
- ese crash ocurre antes del primer render
- por eso debe protegerse a nivel de módulo

#### 3. Revisión rápida de accesos síncronos restantes
Aplicar la misma lógica solo donde el acceso pueda romper la carga inicial:
- `sessionStorage` en funciones que corren dentro de efectos no es el primer sospechoso, pero si encuentro acceso durante render/module init, lo incluiría
- No tocar checkout, pedidos, SEO ni schemas

### Archivos a modificar
- `src/hooks/useCurrency.ts`
- `src/integrations/supabase/client.ts`

### Archivos que NO se tocan
- `src/pages/Checkout.tsx`
- `src/components/SEO.tsx`
- `src/components/RestaurantSchema.tsx`
- `src/components/FAQSchema.tsx`
- `src/components/LocalBusinessSchema.tsx`
- `src/components/SemanticSEOSection.tsx`
- lógica del carrito, precios, pedido por WhatsApp

### Resultado esperado
1. La home vuelve a renderizar incluso si el navegador bloquea `localStorage`
2. El `ErrorBoundary` queda como red de seguridad adicional
3. Moneda, carrito y autenticación siguen funcionando cuando storage está disponible
4. Si storage falla, la app abre con valores por defecto en vez de pantalla en blanco

### Riesgo / compatibilidad
- **Riesgo bajo**
- El único efecto secundario posible es que, en navegadores donde storage esté bloqueado, no se persistan sesión o moneda entre recargas
- Eso es preferible a una pantalla completamente en blanco

### Verificación final
Confirmaré que:
1. la home carga sin blank screen
2. `useCurrency.ts` ya no tiene accesos directos inseguros a `localStorage`
3. el cliente global ya no referencia `localStorage` de forma peligrosa al importar
4. carrito, checkout, WhatsApp, SEO y schemas permanecen intactos
