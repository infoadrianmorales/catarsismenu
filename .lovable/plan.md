

## Hacer el buscador compatible con eventos de Meta Pixel

### Problema

La herramienta de configuracion de eventos de Meta no puede capturar acciones en campos de texto (`<input>`). Necesita un **boton visible** al que pueda asociar el evento "Search". Por eso da error al intentar configurarlo.

### Solucion

Agregar un **boton de buscar** visible dentro del SearchBar que:
- Aparezca cuando el usuario escribe texto
- Tenga los atributos `data-meta-event="Search"` e `id="search-submit-btn"` para que Meta lo detecte
- Al hacer clic, dispare manualmente el evento `trackSearch` del pixel
- Reemplace el icono de lupa estatico por un boton funcional

### Cambios

**`src/components/SearchBar.tsx`**

- Agregar un boton de buscar (`<Button>`) a la derecha del input (o reemplazar la lupa de la izquierda por un boton a la derecha)
- Cuando hay texto: mostrar el boton de buscar (con icono de lupa) + el boton de limpiar (X)
- Cuando no hay texto: solo mostrar el icono de lupa decorativo
- El boton de buscar tendra `id="search-submit-btn"` y `data-meta-event="Search"` 
- Al hacer clic, llamara a `trackSearch(value)` directamente (importado de `metaPixel.ts`)
- Envolver el input y boton en un `<form>` con `onSubmit` para que Enter tambien dispare el evento

**Estructura resultante del SearchBar:**

```text
[form role="search"]
  [icono lupa decorativo a la izquierda]
  [input de texto]
  [boton X para limpiar (si hay texto)]
  [boton Buscar con id="search-submit-btn" y data-meta-event="Search" (si hay texto)]
[/form]
```

### Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/components/SearchBar.tsx` | Envolver en `<form>`, agregar boton de buscar visible con atributos de Meta Pixel, importar `trackSearch` |

No se necesitan cambios en otros archivos. El `useSearch` ya tiene el tracking con debounce que seguira funcionando para busquedas automaticas, y el boton agregara un punto de captura adicional para la herramienta de Meta.
