## Objetivo
Mejorar la legibilidad del mensaje de WhatsApp generado en el checkout, igualando el formato del ejemplo enviado:
- Nombre del producto **en negrita** (`*Nombre*`).
- **Línea en blanco** entre cada producto dentro de una misma categoría.
- Mantener extras y notas con la misma sangría que ya usan.

## Cambios
Archivo único: `src/pages/Checkout.tsx`, dentro de `generateWhatsAppMessage` (líneas ~333-355).

1. Formato de cada producto: `• 1x *Thousand Smash* — Bs 13631.42` (envolver `item.nombre` en `*...*`).
2. Unir los productos de una categoría con `\n\n` (línea en blanco) en lugar de `\n`.
3. La separación entre categorías (`\n\n` entre secciones) se mantiene igual.
4. La vista previa en vivo del checkout (línea 954) refleja el cambio automáticamente porque usa la misma función.

## Resultado esperado

```
*HAMBURGUESAS*
• 1x *Thousand Smash* — Bs 13631.42
   *Extras:*
   - Tocineta (+Bs 1105.85)
   - Carne 150gr (+Bs 2211.70)

• 1x *Chicken Crunch* — Bs 9576.64
   *Extras:*
   - Queso facilista (+Bs 1105.85)
   - Pollo crispy (+Bs 1843.08)
```

Sin cambios en la Edge Function, CAPI, ni en la lógica de pedido — solo formato del texto.