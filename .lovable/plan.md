

## Reescribir Seccion SEO — Tono Honesto y Realista

### Problema

El texto actual tiene afirmaciones exageradas:
- "Las mejores hamburguesas de Lecheria" — demasiado pretencioso
- "Pizzas artesanales" — no lo son
- "Cocteleria de autor" — la mayoria son cocteles clasicos/basicos
- "El mejor bar nocturno" — vender humo

### Sobre Ocultar el Texto

**No es recomendable.** Google penaliza el texto oculto (display:none, visibility:hidden, texto invisible, fuera de pantalla). Lo considera tecnica manipulativa y puede afectar negativamente el posicionamiento. El texto actual ya esta en formato discreto (letra pequena, color gris sutil), que es la forma correcta.

### Solucion

Reescribir el contenido con un tono honesto que siga aportando valor SEO sin exagerar:

**Archivo: `src/pages/Index.tsx`** (lineas 127-158)

Cambios principales:
- **H2**: Cambiar de "Las Mejores Hamburguesas" a algo como "Hamburguesas, Pizzas y Mas en Lecheria"
- **Parrafo 1**: Describir a Catarsis como restaurante reconocido por sus hamburguesas, sin decir "las mejores" ni "gourmet". Mencionar variedad y sabor
- **Parrafo 2**: Cambiar "pizzas artesanales" a simplemente "pizzas". Mantener mencion de emparedados, parrilla y ensaladas
- **Parrafo 3**: Cambiar "cocteleria de autor" a "cocteleria" o "variedad de cocteles". Quitar "el mejor bar nocturno", reemplazar con referencia al ambiente nocturno sin superlativos
- **Parrafo 4**: Mantener info de pagos y ubicacion (esto es factual)

### Texto Propuesto

```
H2: Hamburguesas, Pizzas y Cocteleria en Lecheria — Catarsis Drinks & Food

P1: Catarsis Drinks & Food es un restaurante en Lecheria, Anzoategui, 
reconocido por sus hamburguesas — desde la Clasica Americana hasta la 
Honeyholic Burger, BBQ Champions y la Smash. Cada una preparada con 
ingredientes frescos y recetas propias.

P2: Ademas de hamburguesas, el menu incluye pizzas, emparedados, 
opciones de parrilla con cortes de mar y tierra, y ensaladas frescas. 
Ideal tanto para un almuerzo rapido como para una cena completa.

P3: Por las noches, Catarsis se transforma en un espacio con ambiente 
de bar donde puedes disfrutar de una variedad de cocteles — desde 
el Catarsis Punch hasta clasicos como la Margarita. Abrimos de lunes 
a domingo, con horario extendido hasta la 1:00 AM los fines de semana.

P4: (se mantiene igual — info de pagos y ubicacion)
```

### Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/pages/Index.tsx` | Reescribir seccion SEO (lineas 127-158) con tono realista |

Los links internos a categorias se mantienen (son buenos para SEO interno).
