

# Plan: Agregar Búsqueda con Filtro por Categoría

## Objetivo

Permitir a los clientes filtrar productos por categoría (hamburguesas, pizzas, entradas, etc.) usando una barra de navegación horizontal con tabs, tanto en la página de delivery (/) como en la de local (/local).

---

## Componentes Existentes (Reutilizables)

| Componente | Estado | Ubicación |
|------------|--------|-----------|
| `CategoryFilter` | Listo | `src/components/CategoryFilter.tsx` |
| `useSearch` hook | Listo | `src/hooks/useSearch.ts` |
| `SearchBar` | Listo | `src/components/SearchBar.tsx` |

---

## Arquitectura Propuesta

```text
┌─────────────────────────────────────────────────────────────┐
│                        MenuHeader                            │
├─────────────────────────────────────────────────────────────┤
│                        HeroSection                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │         🔍 Buscar por nombre o ingrediente...        │    │  ← SearchBar
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  [Todos] [Best Seller] [Entradas] [Hamburguesas] [Pizzas]...│  ← CategoryFilter (sticky)
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    Productos filtrados según categoría seleccionada         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Comportamiento

| Selección | Resultado |
|-----------|-----------|
| "Todos" (default) | Muestra todas las secciones por categoría como actualmente |
| "Hamburguesas" | Muestra solo productos de hamburguesas en un grid |
| Búsqueda + Categoría | Combina ambos filtros |

---

## Cambios Requeridos

### 1. Crear Componente Combinado: `SearchAndFilter.tsx`

Nuevo componente que integra SearchBar + CategoryFilter:

```tsx
// src/components/SearchAndFilter.tsx
interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: MenuCategory;
  onCategoryChange: (category: MenuCategory) => void;
}
```

### 2. Modificar `Index.tsx`

- Importar y usar `useSearch` hook
- Agregar `SearchAndFilter` después de `FeaturedProducts`
- Renderizado condicional:
  - Si `selectedCategory === 'todos'` y no hay búsqueda: mostrar secciones agrupadas
  - Si hay filtro activo: mostrar productos filtrados en grid único

### 3. Modificar `MenuLocal.tsx`

- Aplicar los mismos cambios que en Index
- El componente `CategoryFilter` usará el mismo styling

---

## Archivos a Crear/Modificar

| Archivo | Acción |
|---------|--------|
| `src/components/SearchAndFilter.tsx` | Crear |
| `src/pages/Index.tsx` | Modificar |
| `src/pages/MenuLocal.tsx` | Modificar |

---

## Flujo de Usuario

1. El cliente ve el menú con todas las secciones organizadas por categoría
2. Puede tocar un tab de categoría (ej: "Hamburguesas")
3. El menú muestra solo los productos de esa categoría
4. Puede combinar con búsqueda de texto
5. Botón "Todos" regresa a la vista completa

---

## Diseño Visual del Filtro

```text
┌────────────────────────────────────────────────────────────────────┐
│ [📱 Todos] [🔥 Best Seller] [🍽️ Entradas] [🍔 Hamburguesas] [🥪]... │
└────────────────────────────────────────────────────────────────────┘
         ↑                          ↑
    Activo (amarillo)         Inactivo (outline)
```

- Scroll horizontal en móvil
- Sticky debajo del header
- Iconos + texto para cada categoría

---

## Detalles Técnicos

### SearchAndFilter.tsx

```tsx
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { MenuCategory } from '@/types/menu';

interface Props {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: MenuCategory;
  onCategoryChange: (category: MenuCategory) => void;
}

export const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}: Props) => {
  return (
    <>
      <SearchBar value={searchQuery} onChange={onSearchChange} />
      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onCategoryChange={onCategoryChange} 
      />
    </>
  );
};
```

### Lógica de renderizado en Index/MenuLocal

```tsx
const { 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory, 
  filteredItems, 
  hasFilters 
} = useSearch(products);

// Si hay filtros activos, mostrar grid filtrado
// Si no, mostrar secciones por categoría como antes
{hasFilters ? (
  <FilteredProductsGrid items={filteredItems} ... />
) : (
  <CategorySections ... />
)}
```

---

## Resultado Esperado

| Antes | Después |
|-------|---------|
| Solo scroll por secciones | Tabs para saltar a categoría |
| Sin búsqueda en home | Búsqueda integrada con filtros |
| Navegación lineal | Acceso rápido a cualquier categoría |

---

## Beneficios

- **UX mejorada**: Clientes encuentran productos más rápido
- **Consistencia**: Mismo comportamiento en `/` y `/local`
- **Reutilización**: Usa componentes existentes
- **Mobile-first**: Scroll horizontal optimizado para táctil

