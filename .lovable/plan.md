

# Plan: Cambiar Ruta de /legal a /terminos-y-condiciones

## Resumen

Actualizar la URL de la página de términos y condiciones de `/legal` a `/terminos-y-condiciones` para que sea consistente con el nuevo nombre.

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Cambiar ruta `/legal` a `/terminos-y-condiciones` |
| `src/components/Footer.tsx` | Actualizar href de `/legal` a `/terminos-y-condiciones` |

---

## Cambios Específicos

### 1. App.tsx (línea 65)

```tsx
// Antes
<Route path="/legal" element={<Legal />} />

// Después
<Route path="/terminos-y-condiciones" element={<Legal />} />
```

### 2. Footer.tsx (línea 88)

```tsx
// Antes
<a href="/legal" ...>

// Después
<a href="/terminos-y-condiciones" ...>
```

---

## Resultado

| Aspecto | Antes | Después |
|---------|-------|---------|
| URL | `/legal` | `/terminos-y-condiciones` |
| Texto del enlace | Términos y condiciones | Términos y condiciones |
| Componente | Legal.tsx | Legal.tsx (sin cambios) |

---

## Nota

El archivo `Legal.tsx` no necesita ser renombrado ya que solo afecta la organización interna del código. La URL visible para el usuario será `/terminos-y-condiciones`.

