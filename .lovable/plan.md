
Diagnóstico confirmado: el calendario sí está interactivo, pero en `AnalyticsPanel` se está cerrando en el primer clic porque `react-day-picker` puede devolver un rango “completo” en ese primer clic (`from` y `to` iguales). La condición actual (`if (range.from && range.to)`) lo toma como selección final y cierra el popover.

Plan de corrección:

1) Ajustar lógica de cierre en `src/components/admin/AnalyticsPanel.tsx`
- Modificar `handleDateSelect` para **no cerrar** cuando `from` y `to` sean el mismo día en el primer clic.
- Solo cerrar cuando el rango esté realmente completado con segunda fecha (rango efectivo).
- Mantener `pendingRange` visible mientras se selecciona la segunda fecha.

2) Forzar selección en dos pasos para “Personalizado”
- En el `<Calendar mode="range" ... />`, agregar `min={1}` para evitar que el primer clic cuente como rango final.
- Resultado esperado: primer clic = fecha inicial; segundo clic = fecha final.

3) Mantener UX consistente del popover
- Conservar `handleCalendarOpen` para precargar `pendingRange` desde `customRange` al abrir.
- Al completar rango válido, guardar en `customRange`, cambiar preset a `custom` y cerrar popover.

4) Verificación funcional
- Probar Admin → Analíticas → Personalizado:
  - Clic en 01 Feb: el calendario permanece abierto.
  - Clic en 01 Mar: se cierra y aplica rango completo.
  - El encabezado y métricas se recalculan con ese rango.
- Validar también un segundo intento cambiando rango para confirmar que `pendingRange` no se pierde.
