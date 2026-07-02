## Cambios

### 1) `src/data/config.ts`
Reemplazar `maps_url` por el enlace corto oficial provisto:
```ts
maps_url: 'https://maps.app.goo.gl/8gq64htCh7T5KxpR8',
```
Esto actualiza automáticamente el botón "Cómo llegar" de `SemanticSEOSection` y cualquier enlace del Footer que ya use `appConfig.maps_url`.

### 2) `src/components/SemanticSEOSection.tsx`
- Reemplazar el iframe OpenStreetMap por el embed oficial de Google Maps:
  ```
  https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3926.993171529659!2d-64.69077589999999!3d10.181209299999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2d7338e1318071%3A0x1ceca6b07a16e0ef!2sCatarsis%20Lecheria!5e0!3m2!1ses!2sve!4v1783028229320!5m2!1ses!2sve
  ```
- Mantener wrapper `<a>` con `appConfig.maps_url`, atributos `loading="lazy"`, `referrerPolicy="strict-origin-when-cross-origin"`, `allowFullScreen`, `title` accesible y `className` actual (alto `h-64 md:h-72`, borde redondeado).
- Eliminar las constantes `LAT/LNG/bbox/osmEmbed` (ya no se usan).

## No tocar
Ningún otro archivo. El Footer ya consume `appConfig.maps_url`, así que se actualiza sin cambios.