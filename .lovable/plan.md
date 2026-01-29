
# Plan: Actualizar Página de Términos y Condiciones

## Resumen

Reemplazar el contenido actual de "Aviso Legal" con los nuevos "Términos y Condiciones" proporcionados, y actualizar las referencias en el Footer.

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Legal.tsx` | Reemplazar contenido completo con los 9 puntos de T&C |
| `src/components/Footer.tsx` | Cambiar texto "Aviso legal" por "Términos y condiciones" |

---

## Cambios en Legal.tsx

### Título Principal
- **Antes**: "Aviso Legal"
- **Después**: "Términos y Condiciones"

### Subtítulo
Agregar párrafo introductorio:
> "Al usar el sitio web de Catarsis, aceptas estos Términos y Condiciones. Si no estás de acuerdo, por favor, no lo uses."

### Secciones (9 en total)

| # | Título | Contenido resumido |
|---|--------|-------------------|
| 1 | ¿Qué hace este sitio? | Menú + carrito, no se paga en web, enlace a WhatsApp |
| 2 | Pedidos y disponibilidad | Precios/disponibilidad pueden cambiar, confirmación por WhatsApp |
| 3 | Datos personales | Nombre, teléfono, dirección requeridos |
| 4 | Uso permitido | No uso ilegal, contenido protegido |
| 5 | WhatsApp (servicio de tercero) | Plataforma externa, sus propios términos |
| 6 | Responsabilidad | No responsable por fallas técnicas |
| 7 | Cambios a estos términos | Pueden actualizarse en cualquier momento |
| 8 | Legislación | Leyes de Venezuela, Lechería |
| 9 | Contacto | WhatsApp del sitio |

---

## Cambios en Footer.tsx

**Línea 91** - Cambiar texto del enlace:

```tsx
// Antes
Aviso legal

// Después
Términos y condiciones
```

---

## Estructura Visual Final

```text
┌────────────────────────────────────────────┐
│ ← Volver al menú                           │
├────────────────────────────────────────────┤
│                                            │
│  TÉRMINOS Y CONDICIONES                    │
│  ──────────────────────                    │
│  Menú Catarsis                             │
│                                            │
│  Al usar el sitio web de Catarsis...       │
│                                            │
│  1) ¿Qué hace este sitio?                  │
│     [contenido]                            │
│                                            │
│  2) Pedidos y disponibilidad               │
│     • Los productos pueden cambiar...      │
│     • La disponibilidad puede variar...    │
│     • Enviar pedido es una solicitud...    │
│                                            │
│  3) Datos personales                       │
│     [contenido]                            │
│                                            │
│  4) Uso permitido                          │
│     • No uses para fines ilegales...       │
│     • Contenido protegido...               │
│                                            │
│  5) WhatsApp (servicio de tercero)         │
│     [contenido]                            │
│                                            │
│  6) Responsabilidad                        │
│     [contenido]                            │
│                                            │
│  7) Cambios a estos términos               │
│     [contenido]                            │
│                                            │
│  8) Legislación                            │
│     Venezuela, Lechería, Anzoátegui        │
│                                            │
│  9) Contacto                               │
│     [contenido]                            │
│                                            │
├────────────────────────────────────────────┤
│  [Footer]                                  │
│  © 2025 Catarsis                           │
│  Términos y condiciones  ← actualizado     │
└────────────────────────────────────────────┘
```

---

## Notas de Implementación

- Para la sección 8 (Legislación), usaré "Venezuela" como país y "Lechería, Anzoátegui" como ciudad, basándome en la información del Footer
- Las listas con viñetas (secciones 2 y 4) usarán elementos `<ul>` para mejor legibilidad
- Se mantiene el mismo estilo visual (fuentes, colores, espaciado) del diseño actual
