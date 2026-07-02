## Problema

En `src/components/ReviewCTA.tsx` uso clases `bg-raspberry`, `text-raspberry`, `fill-xanthous`, `shadow-raspberry/20`, pero esos tokens **no están registrados en `tailwind.config.ts`** (solo existen como variables CSS `--raspberry` / `--xanthous`). Resultado: el botón sale transparente, "Catarsis" no aparece en fucsia y las estrellas se ven negras — justo lo que muestras en la captura.

## Cambios

Editar únicamente `src/components/ReviewCTA.tsx` para usar los mismos valores del prototipo aprobado:

1. **Estrellas** → reemplazar `fill-xanthous` por color directo `#FFB800` (`style={{ color: '#FFB800' }}` + `fill="currentColor"`).
2. **"Catarsis"** → reemplazar `text-raspberry` por `text-[#DB1F51]`.
3. **Botón** → reemplazar `bg-raspberry hover:bg-raspberry/90 shadow-raspberry/20` por `bg-[#DB1F51] hover:bg-[#c11b47] shadow-[#DB1F51]/20` (píldora fucsia sólida con flecha, tal cual el prototipo).
4. **Halos** → mantener con `hsl(var(--raspberry)/0.06)` y `hsl(var(--xanthous)/0.05)` (esos sí existen como variables CSS y funcionan como fondo sutil).
5. Sin cambios en `Index.tsx`, `OrderConfirmed.tsx`, ni en la lógica de tracking. Sin tocar tailwind.config.

Resultado esperado: heading en Phudu con "Catarsis" fucsia, 5 estrellas amarillas alineadas a la derecha y píldora fucsia sólida "Déjanos tu reseña →", idéntico al prototipo Split editorial.