
# Plan: Corregir visualización de imágenes existentes

## Problema
Las imágenes de productos no se muestran porque el componente `OptimizedImage` intenta cargar variantes (`_400.jpg`, `_200.jpg`) que no existen. Solo las imágenes originales (`producto.jpg`) están disponibles.

## Causa Raíz
El código actual asume que todas las imágenes tienen variantes de tamaño:

```text
URL entrada:    products/chicken-crunch.jpg?t=123456
URL generada:   products/chicken-crunch_400.jpg  ← NO EXISTE
Resultado:      Error 404, imagen no se muestra
```

## Solución
Modificar la lógica en `OptimizedImage.tsx` para:
1. **Imágenes JPEG (legacy):** Usar URL original directamente, sin variantes
2. **Imágenes WebP (nuevas optimizadas):** Usar variantes `_200.webp`, `_400.webp`, `.webp`

---

## Cambios Técnicos

### Archivo: `src/components/OptimizedImage.tsx`

**Modificar la función `parseProductUrl`** para detectar si hay variantes reales:

```text
Lógica actual:
├── Detectar formato (.jpg o .webp)
├── Generar URLs de variantes (_200, _400)
└── Usar variante según 'variant' prop

Lógica corregida:
├── Detectar formato (.jpg o .webp)
├── SI es JPEG → usar URL original (sin variantes)
├── SI es WebP → generar URLs de variantes
└── Preservar query string (?t=timestamp)
```

**Cambio específico en líneas 91-128:**

```text
ANTES:
const format = parsed.isWebP ? 'webp' : 'jpg';
const variantSrc = variantSize === 800 
  ? `${parsed.basePath}.${format}`
  : `${parsed.basePath}_${variantSize}.${format}`;

DESPUÉS:
// Para JPEG (imágenes legacy), usar URL original
if (!parsed.isWebP) {
  return { src, srcSet: undefined, sizes: undefined, usesPicture: false };
}
// Para WebP (nuevas optimizadas), usar variantes
const variantSrc = variantSize === 800 
  ? `${parsed.basePath}.webp`
  : `${parsed.basePath}_${variantSize}.webp`;
```

---

## Comportamiento Esperado

| Tipo de Imagen | URL Entrada | URL Usada |
|----------------|-------------|-----------|
| JPEG (existente) | `chicken-crunch.jpg?t=123` | `chicken-crunch.jpg?t=123` ✅ |
| WebP (nueva) | `chicken-crunch.webp` | `chicken-crunch_400.webp` ✅ |

---

## Diagrama de Flujo

```text
┌─────────────────────────────────────────────┐
│           OptimizedImage                    │
│    src="products/hamburguesa.jpg?t=123"    │
└─────────────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │ ¿Es imagen de        │
         │ producto storage?    │
         └──────────────────────┘
                    │
            Sí      │
                    ▼
         ┌──────────────────────┐
         │ ¿Formato es WebP?    │
         └──────────────────────┘
            │               │
     No (JPEG)          Sí (WebP)
            │               │
            ▼               ▼
   ┌────────────────┐  ┌────────────────┐
   │ Usar URL       │  │ Generar srcset │
   │ original       │  │ con variantes  │
   │ (sin cambios)  │  │ _200, _400     │
   └────────────────┘  └────────────────┘
            │               │
            └───────┬───────┘
                    │
                    ▼
         ┌──────────────────────┐
         │   Renderizar <img>   │
         │   o <picture>        │
         └──────────────────────┘
```

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/OptimizedImage.tsx` | Ajustar lógica para que imágenes JPEG usen URL original sin intentar cargar variantes |

## Resultado
Las imágenes existentes (JPEG) se mostrarán correctamente de inmediato. Las nuevas imágenes subidas (WebP optimizado) usarán las variantes responsivas automáticamente.
