

## Insertar código de seguimiento de Metricool

Se agregará el script de Metricool en `index.html`, justo antes del cierre de `</head>`, similar a como ya está integrado el Meta Pixel.

### Cambios

**`index.html`** -- Agregar el script de Metricool antes del cierre `</head>`:

```html
<!-- Metricool Tracking Code -->
<script>
  function loadScript(a){
    var b=document.getElementsByTagName("head")[0],
        c=document.createElement("script");
    c.type="text/javascript";
    c.src="https://tracker.metricool.com/resources/be.js";
    c.onreadystatechange=a;
    c.onload=a;
    b.appendChild(c)
  }
  loadScript(function(){beTracker.t({hash:"4157fa87e6bd40d5b2591b9947e24168"})});
</script>
```

Se ubicará junto al bloque existente del Meta Pixel para mantener todos los scripts de tracking agrupados. No requiere cambios en ningún otro archivo.

