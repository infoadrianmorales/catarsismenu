

## Plan: Cards 3 completas + 4ta cortada a la mitad

### Cambio clave

El ancho actual de cada card es `calc((100% - 20px) / 3)` — esto muestra exactamente 3 cards sin dejar pista visual de que hay más. Hay que cambiar el ancho para que 3 cards + media card quepan en el viewport.

### Fórmula

Si el contenedor tiene ancho `W` y gap de 10px:
- Para mostrar 3.5 cards: `cardWidth = (W - 3*gap) / 3.5`
- Simplificado en CSS: `calc((100% - 30px) / 3.5)`

Esto deja exactamente media card visible a la derecha, comunicando claramente que hay más contenido.

### Cambios en `src/components/cart/UpsellSuggestions.tsx`

**Línea 108** — Cambiar el width de las cards en mobile:
```
// Antes:
width: isMobile ? 'calc((100% - 20px) / 3)' : '150px'

// Después:
// [2026-04-10] 3 cards completas + 4ta cortada a la mitad
width: isMobile ? 'calc((100% - 30px) / 3.5)' : '150px'
```

**Línea 74** — Ajustar el gap para que coincida (gap-2.5 = 10px, 3 gaps entre 3.5 cards):
El gap actual de `gap-2.5` (10px) ya es correcto — entre 3.5 cards hay 3 gaps visibles = 30px total, que coincide con la fórmula.

**Línea 48-54** — Forzar `canScrollRight = true` inicialmente cuando hay más de 3 items en mobile, para que la flecha aparezca de inmediato:
```typescript
const [canScrollRight, setCanScrollRight] = useState(items.length > 3);
```

### Archivo

| Acción | Archivo |
|--------|---------|
| Modificar | `src/components/cart/UpsellSuggestions.tsx` |

### Verificación
1. En mobile (390px): se ven 3 cards completas + la 4ta cortada a la mitad
2. La flecha derecha aparece visible desde el inicio
3. Swipe y flechas funcionan
4. Desktop sin cambios (sigue usando 150px fijo)

