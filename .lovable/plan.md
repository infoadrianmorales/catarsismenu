
# Plan: Corregir carga de imágenes en móvil - Eliminar interferencia del zoom

## Problema Identificado

Las imágenes no cargan correctamente en móvil debido a la combinación de:

1. **`transition-transform duration-300`** - Crea capa de composición GPU
2. **`group-hover:scale-110`** - Transform que afecta el layout inicial
3. **`opacity: 0` → `opacity: 100`** - Transición simultánea con transform
4. **Múltiples `overflow: hidden`** - ScrollArea + contenedor imagen

```
┌────────────────────────────────────────────────────────┐
│  ScrollArea (overflow: hidden)                         │
│  ├── Viewport (overflow: hidden)                       │
│  │   └── Card                                          │
│  │       └── div (overflow: hidden, rounded-lg)        │
│  │           └── OptimizedImage container              │
│  │               └── img (transition-transform + scale)│
│  │                   ↑                                 │
│  │                   PROBLEMA: GPU layer + opacity     │
│  │                   transition interfieren en móvil   │
└────────────────────────────────────────────────────────┘
```

En navegadores móviles (especialmente Safari iOS y Chrome Android), cuando:
- Una imagen está en múltiples contenedores con `overflow: hidden`
- Tiene `transition-transform` aplicado
- Comienza con `opacity: 0`

El navegador puede no renderizar la imagen correctamente hasta que haya interacción del usuario.

---

## Solución

### Enfoque 1: Separar las transiciones de transform y opacity

Mover el efecto de zoom a un **contenedor envolvente** en lugar de la imagen directamente, y simplificar la transición de opacity.

### Enfoque 2: Usar media query para deshabilitar zoom en móvil

Aplicar el efecto de zoom solo en desktop (`sm:` breakpoint) donde no causa problemas.

### Enfoque 3: Cambiar a will-change para optimizar compositing

Agregar `will-change: transform` para preparar el navegador, pero esto puede empeorar el problema en móviles con poca memoria.

**Recomendación**: Combinar Enfoque 1 y 2 - Separar la animación y deshabilitarla en móvil.

---

## Cambios Técnicos

### Archivo: `src/components/CompactProductCard.tsx`

**Problema actual (línea 50):**
```jsx
<OptimizedImage 
  className="h-full w-full object-cover p-1 sm:p-1.5 transition-transform duration-300 ease-out group-hover:scale-110 group-active:scale-105"
/>
```

La transición de transform está en el mismo elemento que maneja opacity, causando conflictos de GPU layers.

**Solución:**
1. Mover el zoom al contenedor `.aspect-square` en lugar de la imagen
2. Deshabilitar zoom en móvil (solo aplicar en `sm:` y superiores)
3. Simplificar clases en la imagen

```jsx
{/* Contenedor con el efecto zoom - solo desktop */}
<div className="relative aspect-square overflow-hidden rounded-lg bg-white border border-foreground/10 shadow-sm sm:transition-transform sm:duration-300 sm:ease-out sm:group-hover:scale-105">
  <OptimizedImage 
    className="h-full w-full object-cover p-1 sm:p-1.5"
    // Sin transition-transform ni scale
  />
</div>
```

### Archivo: `src/components/OptimizedImage.tsx`

**Mejora adicional:**
Simplificar la transición de opacity para que no interfiera con transform:

```jsx
// Antes
className={cn(
  "transition-opacity duration-300",
  loaded ? "opacity-100" : "opacity-0",
  className
)}

// Después - Sin transición de opacity, aparecer inmediatamente
className={cn(
  loaded ? "opacity-100" : "opacity-0",
  className
)}
```

O usar una transición más corta:

```jsx
className={cn(
  "transition-opacity duration-150",
  loaded ? "opacity-100" : "opacity-0",
  className
)}
```

---

## Resumen de Cambios

| Archivo | Cambio |
|---------|--------|
| `src/components/CompactProductCard.tsx` | Mover zoom al contenedor, deshabilitarlo en móvil |
| `src/components/OptimizedImage.tsx` | Reducir/eliminar transición de opacity |
| `src/components/MenuCard.tsx` | Aplicar misma corrección de zoom |

---

## Resultado Esperado

| Dispositivo | Comportamiento |
|-------------|---------------|
| **Móvil** | Imágenes cargan inmediatamente sin efecto zoom |
| **Tablet** | Imágenes cargan, zoom sutil en hover |
| **Desktop** | Comportamiento actual mantenido con zoom en hover |

Las imágenes deberían cargar correctamente en todos los dispositivos al eliminar la interferencia entre las transiciones de transform y opacity en la imagen.
