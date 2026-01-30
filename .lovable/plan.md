

# Plan: Revertir Ícono de Hamburguesas

## Problema

El ícono `Sandwich` está duplicado entre las categorías:
- Hamburguesas → Sandwich ❌
- Emparedados → Sandwich ✓

Esto causa confusión visual para los usuarios.

---

## Solución

Revertir el ícono de Hamburguesas a `Beef` (carne), que era el original y es distintivo.

---

## Cambios a Realizar

| Archivo | Cambio |
|---------|--------|
| `src/components/CategoryFilter.tsx` | Cambiar `Sandwich` de vuelta a `Beef` para hamburguesas |
| Base de datos | Actualizar `icono = 'Beef'` para slug `hamburguesas` |

---

## Implementación

### Código (CategoryFilter.tsx)

```tsx
// Línea 32: Revertir a Beef
{ id: 'hamburguesas', label: 'Hamburguesas', icon: <Beef className="h-4 w-4" /> },
```

### Base de Datos

```sql
UPDATE categories 
SET icono = 'Beef' 
WHERE slug = 'hamburguesas';
```

---

## Resultado

- Hamburguesas: 🥩 (Beef) - distintivo
- Emparedados: 🥪 (Sandwich) - distintivo

Cada categoría tendrá su propio ícono único.

