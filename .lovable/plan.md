

# Plan: Optimización Técnica de Imágenes

## Resumen

Implementaremos mejoras técnicas para optimizar las imágenes de productos:
1. **Conversión a WebP** - Formato moderno 30-50% más liviano que JPEG
2. **Múltiples resoluciones** - Thumbnails pequeños para el menú, imagen grande para detalle
3. **Mejoras al componente OptimizedImage** - Soporte para srcset y formatos modernos

---

## Estado Actual vs Propuesto

| Característica | Actual | Propuesto |
|----------------|--------|-----------|
| Formato | JPEG | WebP (con fallback JPEG) |
| Resoluciones | 800px única | 200px (thumb), 400px (card), 800px (full) |
| Peso promedio | ~150KB | ~50KB (WebP 400px) |
| Lazy loading | ✅ IntersectionObserver | ✅ + responsive srcset |

---

## Cambios Técnicos

### 1. Actualizar `src/lib/imageProcessor.ts`

Agregar nuevas funciones:

```text
Nuevas funciones:
├── convertToWebP(blob, quality)     → Convierte imagen a WebP
├── generateThumbnails(file)         → Genera 3 resoluciones
└── Actualizar resizeImageTo1x1      → Usar WebP por defecto
```

Lógica de generación de resoluciones:

```text
Original (cualquier tamaño)
    │
    ▼
┌─────────────────────────────────────┐
│  Resize + Crop a 1:1 (cuadrado)     │
└─────────────────────────────────────┘
    │
    ├──► 800x800 WebP (full)   → products/{slug}.webp
    ├──► 400x400 WebP (card)   → products/{slug}_400.webp
    └──► 200x200 WebP (thumb)  → products/{slug}_200.webp
```

### 2. Actualizar `src/components/admin/ProductForm.tsx`

Modificar `handleImageUpload` para:
- Generar las 3 versiones de la imagen
- Subir todas al storage
- Guardar la URL base (sin sufijo) en la base de datos

```text
Flujo de subida:
1. Usuario selecciona imagen
2. Procesar a 1:1
3. Generar 3 tamaños en WebP
4. Subir los 3 archivos a storage
5. Guardar URL base en imagen_url
```

### 3. Actualizar `src/components/OptimizedImage.tsx`

Agregar soporte para múltiples resoluciones:

```text
Props nuevas:
├── sizes?: string           → Tamaños responsivos (srcset)
└── variant?: 'thumb' | 'card' | 'full'

Lógica:
- Si la URL base es de producto, construir srcset automáticamente
- Detectar URLs de storage de productos (_200.webp, _400.webp, .webp)
- Usar <picture> con fallback a JPEG original si existe
```

Ejemplo de uso:

```text
<OptimizedImage 
  src="/products/hamburguesa.webp"
  alt="Hamburguesa"
  sizes="(max-width: 640px) 150px, 185px"
/>

Genera:
<picture>
  <source 
    srcset="...hamburguesa_200.webp 200w, 
            ...hamburguesa_400.webp 400w"
    sizes="(max-width: 640px) 150px, 185px"
    type="image/webp" 
  />
  <img src="...hamburguesa.webp" ... />
</picture>
```

### 4. Actualizar `src/components/CompactProductCard.tsx`

Pasar el variant correcto al OptimizedImage:

```text
<OptimizedImage 
  src={item.imagen}
  variant="card"        ← Nuevo
  sizes="150px"         ← Nuevo
  ...
/>
```

---

## Estructura de Archivos en Storage

```text
product-images/
├── hamburguesa.webp          (800x800 - detalle producto)
├── hamburguesa_400.webp      (400x400 - tarjetas menú)
├── hamburguesa_200.webp      (200x200 - thumbnails)
├── pizza-margarita.webp
├── pizza-margarita_400.webp
├── pizza-margarita_200.webp
└── ...
```

---

## Impacto en Rendimiento

| Métrica | Antes | Después |
|---------|-------|---------|
| Peso promedio por imagen | ~150KB | ~35KB (400px WebP) |
| Tiempo de carga inicial | ~2.5s | ~1.2s |
| LCP (Largest Contentful Paint) | Mejorado con srcset |
| Puntuación Lighthouse Performance | +5-10 puntos estimado |

---

## Compatibilidad

- **WebP**: 97% de navegadores soportados
- **Fallback**: Se mantiene funcionalidad con JPEG para navegadores antiguos
- **Imágenes existentes**: Seguirán funcionando, solo las nuevas usarán WebP

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/lib/imageProcessor.ts` | Agregar conversión WebP y generación de múltiples tamaños |
| `src/components/admin/ProductForm.tsx` | Subir 3 versiones de cada imagen |
| `src/components/OptimizedImage.tsx` | Soporte para srcset y picture element |
| `src/components/CompactProductCard.tsx` | Pasar sizes y variant al OptimizedImage |

