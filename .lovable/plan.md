

## Plan: Aplicar estilo badge al bloque de contacto en Footer.tsx

### Cambios

**`src/components/Footer.tsx`**

1. **Línea 1** — Agregar `Clock` y `Phone` a los imports de lucide-react:
   ```
   import { Instagram, MapPin, Facebook, Youtube, Clock, Phone } from 'lucide-react';
   ```

2. **Líneas 49-78** — Reemplazar el bloque `{/* Info */}` completo con los 3 badges en formato pill, manteniendo los hrefs intactos:
   - Badge horario: `<span>` con `Clock` icon, texto plano
   - Badge ubicación: `<a href="https://maps.google.com/?q=Catarsis+Lecheria">` con `MapPin` icon
   - Badge teléfono: `<a href="https://api.whatsapp.com/send?phone=584249056438">` con `Phone` icon
   - Todos con: `rounded-full px-3 py-1 text-xs text-gray-300`, fondo `rgba(219, 31, 81, 0.08)`, iconos `#DB1F51`

3. **Comentario** agregado sobre el bloque explicando el estilo y la regla de mantener hrefs.

### Sin cambios
- TapeDivider, logo, redes sociales, copyright — intactos
- Contenido de texto idéntico
- hrefs de ubicación y teléfono preservados exactamente

