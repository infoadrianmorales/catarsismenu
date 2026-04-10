
## Plan: Mostrar máximo 10 sugerencias en el banner móvil

### Problema
En la página del carrito, la versión móvil (`isMobile`) está limitando las sugerencias a 6 items (`maxItems={6}`), pero el usuario quiere mostrar hasta 10 sugerencias máximo.

### Cambio necesario

**Archivo: `src/pages/Cart.tsx`**

**Línea 336** — Cambiar de 6 a 10 sugerencias:
```
// Antes:
<UpsellSuggestions maxItems={6} />

// Después:
<UpsellSuggestions maxItems={10} />
```

### Verificación
1. En mobile (390px): el banner muestra hasta 10 sugerencias distribuidas entre comida y bebidas
2. El scroll horizontal funciona correctamente para navegar las 10 sugerencias
3. Desktop sin cambios (ya usa maxItems={10})
