

# Plan: Reemplazar carrusel por grid completo de productos

## Problema

El carrusel horizontal (`ProductCarousel`) sigue causando problemas de carga de imágenes en dispositivos móviles, a pesar de las optimizaciones previas. La combinación de `ScrollArea`, `overflow: hidden`, y lazy loading no funciona correctamente en todos los navegadores móviles.

## Solución

Eliminar el componente de carrusel y mostrar los productos en un grid tradicional que carga las imágenes de forma estándar.

---

## Cambios Técnicos

### 1. Modificar `CategorySection.tsx`

Reemplazar el `ProductCarousel` por un grid de productos usando `MenuCard`:

```text
ANTES:
┌─────────────────────────────────────────────────────┐
│ Título Categoría                      Ver todo →    │
├─────────────────────────────────────────────────────┤
│ [Card][Card][Card][Card] ← scroll horizontal →      │
└─────────────────────────────────────────────────────┘

DESPUÉS:
┌─────────────────────────────────────────────────────┐
│ Título Categoría                      Ver todo →    │
├─────────────────────────────────────────────────────┤
│ [Card] [Card] [Card] [Card]                         │
│ [Card] [Card] [Card] [Card]                         │
│ ... (todos los productos visibles)                  │
└─────────────────────────────────────────────────────┘
```

**Cambios:**
- Importar `MenuCard` en lugar de `ProductCarousel`
- Usar grid responsivo: 2 columnas en móvil, 3 en tablet, 4 en desktop
- Eliminar la dependencia del hook de visibilidad del carrusel

### 2. Actualizar `MenuCard.tsx` (opcional)

El `MenuCard` ya usa `<img>` estándar con `loading="lazy"` del navegador, lo cual es más confiable que la implementación personalizada en móvil. No requiere cambios.

### 3. Archivo `ProductCarousel.tsx`

Puede conservarse para uso futuro o eliminarse. No es crítico para esta corrección.

---

## Código Propuesto

### `src/components/CategorySection.tsx`

```tsx
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { MenuItem, Currency } from '@/types/menu';
import { PriceDisplayMode } from '@/hooks/useCurrency';
import { MenuCard } from './MenuCard';

interface CategorySectionProps {
  slug: string;
  title: string;
  subtitle?: string;
  items: MenuItem[];
  currency: Currency;
  displayMode?: PriceDisplayMode;
}

export const CategorySection = ({ 
  slug, 
  title, 
  subtitle, 
  items, 
  currency, 
  displayMode = 'ambas' 
}: CategorySectionProps) => {
  if (items.length === 0) return null;

  return (
    <section className="py-6">
      <div className="container px-4">
        {/* Header con título y CTA "Ver todo" */}
        <div className="flex items-center justify-between mb-4">
          <Link 
            to={`/categoria/${slug}`}
            className="group flex items-center gap-2 hover:text-primary transition-colors"
          >
            <h2 className="text-xl md:text-2xl font-display font-black text-foreground group-hover:text-primary transition-colors">
              {title}
            </h2>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </Link>
          
          <Link 
            to={`/categoria/${slug}`}
            className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
          >
            Ver todo
          </Link>
        </div>

        {subtitle && (
          <p className="text-muted-foreground text-sm mb-4 max-w-2xl">
            {subtitle}
          </p>
        )}

        {/* Productos en grid - carga estándar del navegador */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <MenuCard 
              key={item.id}
              item={item} 
              currency={currency} 
              displayMode={displayMode}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

## Resumen de Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/CategorySection.tsx` | Modificar: reemplazar carrusel por grid |
| `src/components/ProductCarousel.tsx` | Sin cambios (puede eliminarse después) |
| `src/components/MenuCard.tsx` | Sin cambios |

---

## Beneficios

| Aspecto | Antes (Carrusel) | Después (Grid) |
|---------|------------------|----------------|
| Carga de imágenes | Problemática en móvil | Nativa del navegador |
| Visibilidad | Solo 2-3 productos | Todos visibles |
| Scroll | Horizontal (confuso) | Vertical (natural) |
| Compatibilidad | Requiere hacks | Funciona en todos |

---

## Resultado Esperado

- Las imágenes cargarán correctamente en todos los dispositivos
- Los usuarios verán todos los productos de cada categoría sin necesidad de scroll horizontal
- La navegación será más intuitiva con scroll vertical estándar
- El lazy loading nativo del navegador (`loading="lazy"`) manejará la carga eficientemente

