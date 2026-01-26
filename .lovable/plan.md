
# Plan: Corregir carga de imágenes en carruseles móviles

## Problema Identificado

Las imágenes dentro de los carruseles horizontales (`ProductCarousel`) no se cargan correctamente en dispositivos móviles porque:

1. El componente `ScrollArea` de Radix UI crea un **viewport interno** con `overflow: hidden`
2. El `IntersectionObserver` usa el viewport de la ventana principal
3. Las imágenes dentro del scroll horizontal **nunca "intersectan"** con el viewport principal aunque sean visibles en pantalla
4. El timer de seguridad de 1.2s puede no ser suficiente para todos los productos

```
┌────────────────────────────────────────────────┐
│         Viewport Principal (window)             │
│  ┌──────────────────────────────────────────┐  │
│  │       ScrollArea (overflow: hidden)       │  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │  │
│  │  │ IMG │ │ IMG │ │ IMG │ │ IMG │ │ IMG │ │  │
│  │  │  ✓  │ │  ✓  │ │  X  │ │  X  │ │  X  │ │  │
│  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ │  │
│  │   │◄──Visible──►│◄───Oculto en scroll───►│  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│    IntersectionObserver no detecta las         │
│    imágenes ocultas en el scroll horizontal    │
└────────────────────────────────────────────────┘
```

---

## Solución

Cargar **todas** las imágenes de un carrusel cuando la **sección** del carrusel entra en viewport, en lugar de observar cada imagen individualmente.

### Enfoque 1: Simplificar OptimizedImage para carruseles

**Archivo: `src/components/ProductCarousel.tsx`**

Pasar `loading="eager"` a las imágenes dentro del carrusel cuando la sección sea visible:

```text
Cambios:
├── Usar IntersectionObserver a nivel de sección (no de imagen)
├── Cuando la sección es visible, cargar TODAS las imágenes del carrusel
└── Evitar el problema del viewport interno de ScrollArea
```

### Enfoque 2: Forzar carga en CompactProductCard cuando está en carrusel

**Archivo: `src/components/CompactProductCard.tsx`**

Agregar prop opcional `forceLoad` que bypasea el lazy loading:

```text
interface CompactProductCardProps {
  item: MenuItem;
  currency: Currency;
  displayMode?: PriceDisplayMode;
  forceLoad?: boolean;  // <-- Nueva prop
}
```

---

## Cambios Técnicos

### Archivo 1: `src/components/ProductCarousel.tsx`

Implementar detección de visibilidad a nivel de carrusel y pasar la señal a los cards:

```text
1. Agregar hook useIntersectionObserver al contenedor del carrusel
2. Cuando isVisible = true, pasar loading="eager" a CompactProductCard
3. Las imágenes cargarán inmediatamente cuando la sección sea visible
```

### Archivo 2: `src/components/CompactProductCard.tsx`

Agregar soporte para forzar carga inmediata:

```text
1. Agregar prop 'forceLoad?: boolean'
2. Pasar loading="eager" a OptimizedImage cuando forceLoad=true
```

### Archivo 3: `src/components/OptimizedImage.tsx`

Asegurar que `loading="eager"` bypasee completamente el IntersectionObserver:

```text
Línea 119 ya tiene: const shouldLoad = loading === 'eager' || isIntersecting;
Esto ya funciona correctamente, solo necesitamos pasar "eager" desde el carrusel.
```

---

## Flujo de Carga Corregido

```text
┌─────────────────────────────────────────────┐
│         Usuario hace scroll                  │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ ProductCarousel detecta que está visible    │
│ (IntersectionObserver en contenedor)        │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ Pasa forceLoad=true a TODOS los cards       │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ CompactProductCard pasa loading="eager"     │
│ a OptimizedImage                            │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│ TODAS las imágenes del carrusel cargan      │
│ inmediatamente (incluidas las ocultas)      │
└─────────────────────────────────────────────┘
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/ProductCarousel.tsx` | Agregar detección de visibilidad y pasar `forceLoad` a cards |
| `src/components/CompactProductCard.tsx` | Agregar prop `forceLoad` y pasar `loading="eager"` a imagen |

---

## Beneficios de esta Solución

1. **Resuelve el problema raíz**: Las imágenes cargan cuando la sección es visible, sin importar el scroll interno
2. **Mantiene lazy loading global**: Las secciones que no están en viewport aún no cargarán
3. **Compatible con móviles**: No depende del viewport interno de ScrollArea
4. **Performance optimizada**: Solo carga imágenes de secciones visibles (6-8 productos a la vez)
5. **Sin breaking changes**: El comportamiento fuera de carruseles no cambia

---

## Resultado Esperado

En móvil/tablet:
- Todas las imágenes de cada sección del carrusel cargarán correctamente
- El scroll horizontal mostrará las imágenes pre-cargadas sin delay
- Las secciones no visibles seguirán con lazy loading normal
