
# Plan: Categorías Dinámicas desde la Base de Datos

## Resumen

Actualmente las categorías del menú están definidas de forma estática en múltiples archivos del código. Este plan implementará un sistema donde todas las categorías se cargan dinámicamente desde la base de datos, permitiendo que los cambios realizados en el panel de administración se reflejen automáticamente en el menú público.

---

## Estado Actual vs Estado Futuro

| Aspecto | Ahora | Después |
|---------|-------|---------|
| Fuente de datos | Arrays hardcodeados en 5+ archivos | Base de datos `categories` |
| Cambio de nombre | Requiere modificar código | Se hace desde Admin Panel |
| Nuevo íconos | Modificar código | Seleccionar en Admin Panel |
| Orden de categorías | Fijo en el código | Drag & drop en Admin Panel |
| Agregar/quitar categorías | Requiere desarrollador | Auto-gestionado |

---

## Flujo Después de la Implementación

```text
+-------------------+     +------------------+     +-------------------+
|   Admin Panel     | --> |   Base de Datos  | --> |   Menú Público    |
|   CategoriesPanel |     |   categories     |     |   (Index, Filter) |
+-------------------+     +------------------+     +-------------------+
        |                         |                         |
   Editar nombre           Guardado automático        Actualización
   Cambiar ícono           con RLS activo            en tiempo real
   Reordenar                                         sin deploy
```

---

## Archivos a Modificar

### 1. Crear Hook Público para Categorías
**Nuevo archivo:** `src/hooks/usePublicCategories.ts`

Un hook optimizado para el menú público que:
- Solo carga categorías activas
- Usa React Query para caché
- Incluye las categorías virtuales "Todos" y "Best Seller"

```text
// Pseudocódigo
usePublicCategories() {
  - Fetch categorías activas de Supabase
  - Ordenar por campo 'orden'
  - Agregar 'todos' y 'best-seller' al inicio
  - Mapear íconos de Lucide dinámicamente
  - Retornar: categories, loading, getCategoryBySlug()
}
```

---

### 2. Refactorizar CategoryFilter.tsx
**Archivo:** `src/components/CategoryFilter.tsx`

**Cambios:**
- Eliminar array estático `categories`
- Usar `usePublicCategories()` para obtener datos
- Renderizar íconos dinámicamente desde el campo `icono`
- Mostrar skeleton mientras carga

**Antes:**
```tsx
const categories: CategoryOption[] = [
  { id: 'todos', label: 'Todos', icon: <LayoutGrid /> },
  { id: 'entradas', label: 'Entradas', icon: <UtensilsCrossed /> },
  // ... 8 más hardcodeados
];
```

**Después:**
```tsx
const { categories, loading } = usePublicCategories();
// Renderiza dinámicamente desde la BD
```

---

### 3. Refactorizar Index.tsx
**Archivo:** `src/pages/Index.tsx`

**Cambios:**
- Eliminar `categoryConfig` estático
- Eliminar `categoryLabels` estático
- Usar `usePublicCategories()` para obtener configuración de secciones
- Pasar título y subtítulo (descripción) desde la BD

**Antes:**
```tsx
const categoryConfig = [
  { slug: 'best-seller', title: '🔥 Best Seller', subtitle: '...' },
  { slug: 'entradas', title: 'Entradas & Aperitivos', subtitle: '...' },
  // ... 7 más
];
```

**Después:**
```tsx
const { categories } = usePublicCategories();
// Itera sobre categorías de la BD
```

---

### 4. Refactorizar MenuLocal.tsx
**Archivo:** `src/pages/MenuLocal.tsx`

Mismos cambios que Index.tsx:
- Eliminar `categoryConfig` y `categoryLabels`
- Usar hook de categorías dinámicas

---

### 5. Refactorizar CategoryPage.tsx
**Archivo:** `src/pages/CategoryPage.tsx`

**Cambios:**
- Eliminar `categoryTitles` estático
- Obtener título y descripción desde la BD usando el slug de la URL
- Fallback elegante si la categoría no existe

**Antes:**
```tsx
const categoryTitles: Record<string, { title: string; subtitle: string }> = {
  entradas: { title: 'Entradas & Aperitivos', subtitle: '...' },
  // ...
};
```

**Después:**
```tsx
const { getCategoryBySlug } = usePublicCategories();
const categoryInfo = getCategoryBySlug(slug);
```

---

### 6. Refactorizar ProductForm.tsx
**Archivo:** `src/components/admin/ProductForm.tsx`

**Cambios:**
- Eliminar `CATEGORIES` estático
- Cargar categorías desde `useCategories()` (ya existe)
- El dropdown de categorías mostrará las categorías de la BD

**Antes:**
```tsx
const CATEGORIES = [
  { value: 'entradas', label: 'Entradas' },
  // ... 7 más
];
```

**Después:**
```tsx
const { categories } = useCategories();
// Select usa categorías dinámicas
```

---

### 7. Actualizar Tipos
**Archivo:** `src/types/menu.ts`

**Cambios:**
- Hacer `MenuCategory` dinámico (string en lugar de union type)
- Agregar interface `PublicCategory` para el menú

```text
// Nuevo
export interface PublicCategory {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  icono: string;
  orden: number;
}

// Modificado
export type MenuCategory = string; // Antes era union estática
```

---

## Mapa de Íconos Dinámico

El hook mapeará el campo `icono` de la BD a componentes de Lucide:

| Campo en BD | Componente Lucide |
|-------------|-------------------|
| `Soup` | `<Soup />` |
| `Beef` | `<Beef />` |
| `Sandwich` | `<Sandwich />` |
| `Pizza` | `<Pizza />` |
| `Flame` | `<Flame />` |
| `Salad` | `<Salad />` |
| `Wine` | `<Wine />` |
| `IceCream` | `<IceCream />` |

Fallback: `<Utensils />` si el ícono no existe.

---

## Categorías Virtuales

Estas categorías no existen en la BD pero se mantienen en el código:

| Slug | Propósito |
|------|-----------|
| `todos` | Mostrar todos los productos |
| `best-seller` | Productos más vendidos (de la vista `best_sellers_food`) |

Se agregarán automáticamente al inicio de la lista en el hook.

---

## Orden de Implementación

1. Crear `usePublicCategories.ts` (nuevo hook con caché)
2. Actualizar `types/menu.ts` (tipos flexibles)
3. Refactorizar `CategoryFilter.tsx` (tabs dinámicos)
4. Refactorizar `Index.tsx` (secciones dinámicas)
5. Refactorizar `MenuLocal.tsx` (misma lógica que Index)
6. Refactorizar `CategoryPage.tsx` (títulos dinámicos)
7. Refactorizar `ProductForm.tsx` (dropdown de admin)
8. Verificar funcionamiento completo

---

## Datos Actuales en la Base de Datos

Las categorías ya existen y están configuradas:

| Nombre | Slug | Ícono | Orden |
|--------|------|-------|-------|
| Entradas | entradas | Soup | 1 |
| Hamburguesas | hamburguesas | Beef | 2 |
| Emparedados | emparedados | Sandwich | 3 |
| Pizzas | pizzas | Pizza | 4 |
| Parrilla | parrilla | Flame | 5 |
| Ensaladas | ensaladas | Salad | 6 |
| Coctelería | cocteleria | Wine | 7 |
| Postres | postres | IceCream | 8 |

---

## Beneficios

- Cambiar nombres desde el Admin Panel sin tocar código
- Agregar nuevas categorías sin deploy
- Reordenar categorías con drag & drop
- Cambiar íconos visualmente
- Activar/desactivar categorías temporalmente
- Consistencia entre admin y menú público

---

## Resumen de Archivos

| Archivo | Acción |
|---------|--------|
| `src/hooks/usePublicCategories.ts` | **Crear** |
| `src/types/menu.ts` | Modificar |
| `src/components/CategoryFilter.tsx` | Refactorizar |
| `src/pages/Index.tsx` | Refactorizar |
| `src/pages/MenuLocal.tsx` | Refactorizar |
| `src/pages/CategoryPage.tsx` | Refactorizar |
| `src/components/admin/ProductForm.tsx` | Refactorizar |
