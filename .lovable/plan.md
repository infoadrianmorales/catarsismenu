

## Ajustes en el Modulo de Ordenes

### Cambios a realizar

#### 1. Excluir ordenes canceladas de los ingresos
El codigo actual ya excluye las ordenes canceladas de los KPIs de ingresos (linea 176: `nonCanceled = orders.filter(o => o.status !== 'CANCELED')`). Se verificara que esto funcione correctamente en todos los calculos.

#### 2. Formatear bolivares con separador de miles (punto) y decimales (coma)
Actualmente los montos en bolivares se muestran como `Bs 283764` o `Bs 4404.29`. Se cambiara al formato venezolano estandar:
- `Bs 283.764,00` (punto para miles, coma para decimales)
- `Bs 3.250,00`
- `Bs 32.500,01`

Esto aplica en:
- **KPI "Ingresos Bs"** (linea 390): cambiar `kpis.revenueBs.toFixed(0)` a formato con separadores
- **Columna "Total" por orden** (linea 274): cambiar `.toFixed(2)` al formato venezolano

### Archivo a modificar

| Archivo | Cambios |
|---------|---------|
| `src/components/admin/OrdersPanel.tsx` | Agregar funcion `formatBs()` que formatea numeros con punto como separador de miles y coma como decimal. Aplicar en KPI de ingresos Bs y en la columna de total por orden. |

### Detalle tecnico

Se agrega una funcion helper:
```text
formatBs(n: number): string
  -> new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)
  -> Resultado: 3.250,00 / 32.500,01 / 283.764,50
```

Se aplica en:
- Linea 390: `Bs ${formatBs(kpis.revenueBs)}`
- Linea 274: `Bs ${formatBs(total * exchange_rate)}`

