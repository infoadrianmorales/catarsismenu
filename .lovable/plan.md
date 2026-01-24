

# Plan: Corregir Asimetría de Categorías en Página Principal

## Problema Identificado

Las tarjetas de productos en las secciones de categorías tienen alturas inconsistentes porque:

1. **Descripciones opcionales**: Algunas tarjetas tienen descripción y otras no, creando diferencias de altura
2. **Longitud variable de texto**: Los nombres y descripciones tienen diferentes longitudes
3. **Falta de altura uniforme**: El carrusel no fuerza una altura consistente entre tarjetas

## Solución Propuesta

Aplicar altura uniforme a todas las tarjetas usando flexbox y espacios reservados para el contenido.

---

## Cambios Técnicos

### Archivo: `src/components/CompactProductCard.tsx`

| Elemento | Problema Actual | Solución |
|----------|-----------------|----------|
| Descripción | Ocupa espacio variable cuando existe/no existe | Agregar `min-h-[2rem]` para reservar espacio fijo |
| Contenedor de contenido | Altura flexible | Usar estructura flex consistente |

**Cambio específico en línea 63-66:**

```text
Actual:
{item.descripcion_corta && (
  <p className="text-xs ... line-clamp-2 ...">

Nuevo:
<p className="text-xs ... line-clamp-2 min-h-[2rem] ...">
  {item.descripcion_corta || '\u00A0'}
```

Esto garantiza que el espacio de descripción siempre esté reservado, aunque esté vacío.

---

### Archivo: `src/components/ProductCarousel.tsx`

| Elemento | Problema Actual | Solución |
|----------|-----------------|----------|
| Contenedor de tarjeta | Solo ancho fijo, altura variable | Agregar `h-full` y clase de alineación |

**Cambio específico en líneas 17-19:**

```text
Actual:
className="snap-start shrink-0 w-[150px] sm:w-[185px]"

Nuevo:
className="snap-start shrink-0 w-[150px] sm:w-[185px] h-full"
```

También agregar `items-stretch` al contenedor flex para que todas las tarjetas tengan la misma altura.

---

## Resultado Visual Esperado

```text
ANTES (asimétrico):
┌─────┐ ┌─────┐ ┌─────┐
│     │ │     │ │     │
│  A  │ │  B  │ │  C  │
│     │ │     │ └─────┘  ← Altura diferente
│     │ └─────┘
└─────┘

DESPUÉS (simétrico):
┌─────┐ ┌─────┐ ┌─────┐
│     │ │     │ │     │
│  A  │ │  B  │ │  C  │
│     │ │     │ │     │
│     │ │     │ │     │
└─────┘ └─────┘ └─────┘  ← Altura uniforme
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/CompactProductCard.tsx` | Reservar espacio fijo para descripción con `min-h-[2rem]` |
| `src/components/ProductCarousel.tsx` | Agregar `items-stretch` al flex container y `h-full` a los wrappers |

---

## Notas de Compatibilidad

- Los cambios son puramente de CSS, no afectan lógica ni datos
- Las tarjetas en grid (categorías con ≤4 items) también se beneficiarán porque ya usan `h-full` en `CompactProductCard`
- Mantiene el diseño mobile-first existente

