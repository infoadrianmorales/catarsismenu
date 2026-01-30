
# Plan: Agregar Crédito del Desarrollador al Footer

## Cambio a Realizar

Agregar una línea de crédito al final del footer con el texto "Diseñado y desarrollado por Adrian Morales" incluyendo un enlace a www.moralesadrian.com

---

## Ubicación

El crédito se agregará al final de la sección de Copyright existente en el footer, debajo del enlace de "Términos y condiciones".

---

## Implementación

**Archivo a modificar:** `src/components/Footer.tsx`

Se agregará un nuevo elemento después del enlace de términos y condiciones:

```text
© 2026 Catarsis — Drinks & Food. Todos los derechos reservados.
Términos y condiciones
Diseñado y desarrollado por Adrian Morales  ← NUEVO
```

---

## Estilo

- Texto discreto con el mismo estilo que los demás elementos del footer (`text-xs text-muted-foreground`)
- El nombre "Adrian Morales" será un enlace clickeable
- El enlace abrirá en una nueva pestaña con atributos de seguridad (`target="_blank"`, `rel="noopener noreferrer"`)
- Hover suave hacia el color primario para consistencia visual

---

## Código a Agregar

```tsx
<p className="text-xs text-muted-foreground mt-2">
  Diseñado y desarrollado por{' '}
  <a 
    href="https://www.moralesadrian.com"
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-primary transition-colors underline"
  >
    Adrian Morales
  </a>
</p>
```

---

## Resultado Visual

El footer mostrará:
1. Copyright de Catarsis
2. Enlace a Términos y condiciones
3. Crédito del desarrollador con enlace (nuevo)
