## 1. Panel de suscriptores del newsletter en admin

La tabla `newsletter_subscribers` ya existe en Lovable Cloud (email, source, created_at). Solo falta la interfaz.

**Nuevo archivo**: `src/components/admin/NewsletterPanel.tsx`
- Lista todos los correos suscritos con: email, fecha de suscripción y fuente (homepage, categoría, etc.).
- Buscador por email.
- Contador total de suscriptores.
- Botón "Exportar CSV" para descargar la lista.
- Botón para eliminar un suscriptor (opcional, con confirmación).
- Consulta directa a Supabase con RLS de admin.

**Modificar** `src/pages/Admin.tsx`:
- Agregar nueva pestaña "Newsletter" (icono `Mail` de lucide) en el `TabsList`, entre "Marketing" y "Usuarios". El grid pasa de `grid-cols-11` a `grid-cols-12`.
- Agregar el `TabsContent` correspondiente.

**Verificación RLS**: la tabla ya tiene política que permite lectura solo a admins. No requiere migración.

## 2. Mostrar Newsletter en páginas de categoría

**Modificar** `src/pages/CategoryPage.tsx`:
- Importar `NewsletterSection` con `lazy` + `Suspense` (mismo patrón que `Index.tsx`).
- Insertarlo después de la grilla de productos y antes del `<Footer />`.
- Pasar `source="category-{slug}"` para diferenciar en analytics de dónde vino cada suscripción.

**Ajuste en `NewsletterSection.tsx`**:
- Aceptar prop opcional `source?: string` (default `"homepage"`) para poder etiquetar el origen.

## Fuera de alcance
- No se modifica la lógica de suscripción ni el diseño actual (blanco opaco con botón Raspberry).
- No se agregan a otras páginas (checkout, cart, order-confirmed) salvo confirmación posterior.
- La página `/menu` (estática) queda intacta.
