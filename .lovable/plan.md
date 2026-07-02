## Objetivo
Actualizar la URL de Google Maps al Place ID real y reestructurar `SemanticSEOSection` en 2 columnas simétricas (texto SEO existente a la izquierda, ubicación con mapa a la derecha). En móvil, apiladas.

## Cambios

### 1) `src/data/config.ts` (línea 8)
Reemplazar:
```ts
maps_url: 'https://maps.google.com/?q=Catarsis+Lecheria',
```
por:
```ts
// [2026-07-02] CATARSIS — URL actualizada con Place ID real
// (antes era una búsqueda por texto, menos precisa).
maps_url: 'https://www.google.com/maps/search/?api=1&query=Catarsis+Drinks+%26+Food&query_place_id=ChIJcYAx4ThzLYwR7-AWerCm7Bw',
```

### 2) `src/components/SemanticSEOSection.tsx`
Reescritura completa (los tags JSX del prompt vinieron truncados; los reconstruyo respetando la intención textual y visual):
- Imports: `MapPin`, `Clock` de `lucide-react` y `appConfig` de `@/data/config`.
- Contenedor `max-w-5xl` (antes `max-w-3xl`) para acomodar 2 columnas.
- H2 SEO existente se conserva **idéntico** arriba, ancho completo.
- Grid `md:grid-cols-2 gap-8`:
  - **Columna izquierda**: los dos `<p>` semánticos SEO existentes, textualmente sin cambios (críticos para Google/IA).
  - **Columna derecha**: título "Encuéntranos en Lechería", mapa embed OpenStreetMap (iframe con bbox de coordenadas 10.181209, -64.690776, sin API key) envuelto en `<a>` que abre `appConfig.maps_url`, bloque MapPin con "CC Aventura Plaza / Av. Diego Bautista Urbaneja, Lechería, Anzoátegui", bloque Clock con "Lunes a Domingo / 12:00 PM – 1:00 AM", y botón CTA Raspberry "Cómo llegar" que abre `appConfig.maps_url`.
- Mantener fondo `#010C23`, tokens de color y contraste WCAG AA (text-gray-300).
- Comentarios de gobernanza (no eliminar texto SEO, horario 1:00 AM confirmado, coordenadas verificadas, sincronía con RestaurantSchema/FAQSchema/llms.txt).

## No tocar
Ningún otro archivo. Sin cambios en schemas ni en Footer.