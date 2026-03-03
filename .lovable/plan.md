
Objetivo: corregir definitivamente el selector de rango “Personalizado” en Analíticas para que permita elegir fechas como 01 Feb → 01 Mar sin bloquear interacción.

1) Diagnóstico técnico (causa probable)
- El calendario se renderiza dentro de un Popover y el wrapper base del `DayPicker` en `src/components/ui/calendar.tsx` no trae `pointer-events-auto` por defecto.
- Aunque en `AnalyticsPanel` ya se pasa `className="pointer-events-auto"`, en este layout hay casos donde el contenedor/portal sigue absorbiendo eventos y la selección no se completa consistentemente.

2) Cambios a implementar
- Archivo: `src/components/ui/calendar.tsx`
  - Ajustar clase base del `DayPicker` de:
    - `className={cn("p-3", className)}`
  - a:
    - `className={cn("p-3 pointer-events-auto", className)}`
  - Esto deja el calendario interactivo de forma global en cualquier popover/dialog del admin.

- Archivo: `src/components/admin/AnalyticsPanel.tsx`
  - Mantener y reforzar el flujo de rango:
    - `pendingRange` para selección parcial (`from`) y final (`to`).
    - cerrar popover solo cuando existan ambas fechas.
  - Tipar con `DateRange` de `react-day-picker` para evitar inconsistencias de evento/estado.
  - Asegurar que el botón “Personalizado” quede activo al completar rango y que el label superior refleje el período seleccionado.

- Ajuste UX pequeño (mismo archivo)
  - Al abrir “Personalizado”, inicializar `pendingRange` con `customRange` si existe, para que el usuario pueda editar el rango previo sin perder contexto.

3) Verificación funcional (criterios de aceptación)
- En Admin > Analíticas > Personalizado:
  - Se puede hacer click en cualquier día del calendario.
  - Primer click define `from`, segundo click define `to`.
  - Ejemplo solicitado funciona: 01 de febrero a 01 de marzo.
  - El popover se cierra al completar `to`.
  - El encabezado de fechas y los KPIs/gráfico se recalculan con el nuevo rango.

4) Riesgo e impacto
- Riesgo bajo: cambio acotado al calendario UI + estado local de Analíticas.
- Impacto positivo transversal: otros calendarios del panel (órdenes/filtros) también quedan más robustos al estar `pointer-events-auto` en el componente base.
