

## Auditoría (Fase 1)

**Orden actual al final de Index.tsx (líneas 130-143):**

1. L132: `<SemanticSEOSection />` — texto SEO
2. L134: `<Footer />` — contiene internamente:
   - L17-21: Franja amarilla "TU SPOT PARA DESCONECTAR" (tape-divider)
   - L27-117: Bloque inferior (logo, descripción, horario, ubicación, teléfono, redes)
   - L119-150: Copyright

**Problema:** La franja amarilla y el bloque inferior están **dentro** de `Footer.tsx`, no como componentes separados en Index.tsx. Para reordenar SemanticSEOSection entre la franja y el bloque inferior, hay que extraer la franja del Footer o reestructurar el Footer.

---

## Plan de cambios

### CAMBIO 1 — SemanticSEOSection.tsx (reemplazo completo)
Sobreescribir con el código exacto del usuario: 2 párrafos cortos, sin badges, H2 `text-sm md:text-base`, fondo `#010C23` sin borde superior.

### CAMBIO 2 — Footer.tsx (extraer franja)
- **Extraer** la franja "TU SPOT PARA DESCONECTAR" (líneas 16-21) del Footer y convertirla en un componente separado `TapeDivider` exportado desde Footer.tsx (o inline en Index.tsx)
- El Footer queda sin la franja — empieza directamente con el bloque inferior (logo, info, redes, copyright)

### CAMBIO 3 — Index.tsx (reordenar)
Cambiar las líneas 130-134 a:

```
{/* ORDEN FINAL — no modificar esta secuencia:
    1. Franja de marca — elemento visual de separación
    2. SemanticSEOSection — texto SEO para Google e IAs
    3. Bloque inferior — contacto, horario y ubicación
    4. Footer */}
<TapeDivider />
<SemanticSEOSection />
<Footer />
```

Donde `<Footer />` ya no incluye la franja internamente.

### Archivos modificados

| Archivo | Acción |
|---------|--------|
| `src/components/SemanticSEOSection.tsx` | Reemplazo completo con código del usuario |
| `src/components/Footer.tsx` | Extraer franja a componente exportado; eliminar del render del footer |
| `src/pages/Index.tsx` | Importar TapeDivider, reordenar: TapeDivider → SemanticSEOSection → Footer |

### Verificación
| # | Check |
|---|-------|
| 1 | SemanticSEOSection aparece DESPUÉS de la franja y ANTES del bloque inferior |
| 2 | H2: "¿Por qué Catarsis es el restaurante favorito de Lechería?" |
| 3 | 2 párrafos cortos, sin badges |
| 4 | Bloque inferior (horario, ubicación, teléfono) intacto |
| 5 | Sin datos repetidos entre SemanticSEOSection y bloque inferior |
| 6 | Home carga sin errores |

