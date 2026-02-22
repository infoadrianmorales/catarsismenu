

## Cambios en el Panel de Administrador

### 1. Modulo de Clientes - Filtro por fecha y paginacion

**Filtro por fecha:** Agregar botones rapidos (Hoy, 7 dias, 30 dias, Todo) y datepickers para filtrar clientes por fecha de registro o ultima compra.

**Paginacion con selector de cantidad:** Reemplazar la lista infinita con paginacion. Un selector permite elegir cuantos mostrar por pagina: 10, 20, 50 o 100. Controles de navegacion al pie de la tabla.

**Archivo:** `src/components/admin/CustomersPanel.tsx`

### 2. Modulo de Banner - Subir a 5MB y optimizacion WebP automatica

**Limite de 5MB:** Cambiar `MAX_FILE_SIZE` de 3MB a 5MB y actualizar mensajes de la UI.

**Optimizacion automatica a WebP:** Antes de subir la imagen al storage, convertirla automaticamente a formato WebP usando Canvas API (similar a lo que ya hace `imageProcessor.ts` para productos). Se mantiene la resolucion original pero se convierte el formato para reducir peso.

**Archivo:** `src/components/admin/HeroSlidesPanel.tsx`

### 3. Tasa BCV - Verificar horario de sincronizacion

El BCV publica la tasa oficial alrededor de las 3:30-4:00 PM hora de Venezuela (VET = UTC-4), es decir, aproximadamente a las 7:30-8:00 PM UTC.

**Horarios actuales del cron:**
- 8:00 AM UTC (4:00 AM VET) -- demasiado temprano, la tasa no ha cambiado
- 5:00 PM UTC (1:00 PM VET) -- antes de la publicacion de la tarde

**Horarios corregidos propuestos:**
- 9:00 AM UTC (5:00 AM VET) -- captura la tasa del dia anterior (ya publicada)
- 9:00 PM UTC (5:00 PM VET) -- captura la tasa de la tarde recien publicada

Esto asegura que ambas sincronizaciones capturen tasas ya publicadas. Se actualizara tambien el texto en ConfigPanel que dice "8:00 AM y 5:00 PM" al nuevo horario.

**Accion:** Actualizar cron jobs via SQL insert y texto en ConfigPanel.

### 4. Eliminar modulo de Promos

Remover completamente la tab "Promos" y el componente `PromotionsPanel` del panel de administrador. La tabla `promotions` en la base de datos no se elimina (por si se quiere usar en el futuro).

**Archivos:**
- `src/pages/Admin.tsx` - Eliminar import, tab y contenido de promotions
- `src/components/admin/PromotionsPanel.tsx` - Eliminar archivo

### 5. Migrar Meta Pixel de Config a modulo Meta

Mover la seccion completa de Meta Pixel (toggle de activacion, campo de Pixel ID, lista de eventos) desde `ConfigPanel.tsx` hacia `MetaCatalogPanel.tsx`, que pasara a llamarse el modulo unificado de Meta. El modulo tendra dos secciones: Catalogo (feed XML) y Pixel (tracking).

**Archivos:**
- `src/components/admin/ConfigPanel.tsx` - Eliminar seccion Meta Pixel (lineas 510-610), eliminar estados y imports relacionados
- `src/components/admin/MetaCatalogPanel.tsx` - Agregar seccion de Meta Pixel con toggle, campo de ID y lista de eventos

### Detalle tecnico

**Paginacion de clientes:**
```text
Estados: pageSize (10|20|50|100), currentPage (1-based)
Selector: <Select> con opciones 10, 20, 50, 100
paginatedCustomers = filteredCustomers.slice((page-1)*size, page*size)
Reset pagina al cambiar filtros/busqueda/ordenamiento
```

**Conversion WebP para banners:**
```text
async convertToWebP(file: File): Promise<Blob>
  1. Crear Image() desde file
  2. Dibujar en Canvas a resolucion original
  3. canvas.toBlob('image/webp', 0.85)
  4. Retornar blob WebP
  Nombre del archivo: slide-{timestamp}.webp
```

**Cron jobs actualizados:**
```text
-- Eliminar cron jobs actuales
SELECT cron.unschedule(1);
SELECT cron.unschedule(2);

-- Crear nuevos con horarios correctos
cron.schedule('sync-bcv-morning', '0 9 * * *', ...)  -- 9 AM UTC = 5 AM VET
cron.schedule('sync-bcv-evening', '0 21 * * *', ...) -- 9 PM UTC = 5 PM VET
```

**Admin.tsx despues de eliminar Promos:**
```text
TabsList: grid-cols-9 (era 10)
Tabs: analytics, orders, customers, hero, config, categories, products, meta-catalog, users
```

