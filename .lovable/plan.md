

## Crear Feed de Catálogo para Meta (Facebook/Instagram)

### Que es un Feed de Productos

Meta necesita una URL que devuelva tu catalogo de productos en un formato estandar. Meta lee esta URL periodicamente para mantener tu catalogo actualizado automaticamente.

### Como Funciona

```text
┌──────────────────────────────────┐
│  Tu Base de Datos (productos)    │
│  nombre, precio, imagen, etc.    │
└──────────────┬───────────────────┘
               │
               v
┌──────────────────────────────────┐
│  Endpoint /meta-catalog-feed     │
│  Genera XML/CSV con productos    │
└──────────────┬───────────────────┘
               │
               v
┌──────────────────────────────────┐
│  Meta Commerce Manager           │
│  Lee la URL cada X horas         │
│  Actualiza tu catalogo           │
└──────────────────────────────────┘
```

---

### Cambios a Realizar

#### 1. Crear Backend Function: `meta-catalog-feed`

Una funcion backend que consulta todos los productos activos y genera un feed XML (formato Atom/RSS que Meta acepta).

Cada producto incluira:
- **id** - Identificador unico del producto
- **title** - Nombre del producto
- **description** - Descripcion corta
- **availability** - in stock / out of stock
- **price** - Precio en USD
- **link** - URL del producto en tu web (catarsiszone.com/producto/slug)
- **image_link** - URL de la imagen del producto
- **brand** - "Catarsis Drinks & Food"
- **condition** - "new"
- **product_type** - Categoria del producto

#### 2. Formato del Feed

Meta acepta feeds en formato XML (RSS/Atom), CSV o TSV. Usaremos **XML** porque es el mas robusto y soporta todos los campos.

Ejemplo de como se vera cada producto en el feed:

```text
<entry>
  <g:id>uuid-del-producto</g:id>
  <g:title>Catarsis Burger</g:title>
  <g:description>Hamburguesa gourmet con ingredientes premium</g:description>
  <g:link>https://www.catarsiszone.com/producto/catarsis-burger</g:link>
  <g:image_link>https://imagen-del-producto.jpg</g:image_link>
  <g:price>8.99 USD</g:price>
  <g:availability>in stock</g:availability>
  <g:brand>Catarsis Drinks & Food</g:brand>
  <g:condition>new</g:condition>
  <g:product_type>Hamburguesas</g:product_type>
</entry>
```

---

### Detalles Tecnicos

#### Archivo: `supabase/functions/meta-catalog-feed/index.ts`

- Endpoint publico (sin autenticacion) para que Meta pueda leerlo
- Consulta la tabla `products` donde `activo = true`
- Genera XML con namespace Google Merchant (`g:`)
- Responde con `Content-Type: application/xml`
- Incluye todos los campos requeridos por Meta

#### Configuracion en `supabase/config.toml`

- Desactivar verificacion JWT para este endpoint (debe ser publico)

---

### Como Conectarlo en Meta

Una vez creado el endpoint, los pasos en Meta son:

1. Ir a **Meta Commerce Manager** (business.facebook.com/commerce)
2. Crear un nuevo catalogo de tipo "E-commerce"
3. Seleccionar "Feed de datos" como fuente
4. Pegar la URL del feed (sera algo como `https://qucqigemdbyclxqjzkbs.supabase.co/functions/v1/meta-catalog-feed`)
5. Configurar la frecuencia de actualizacion (diaria recomendado)
6. Meta validara el feed y comenzara a importar los productos

### Beneficios

| Funcionalidad | Descripcion |
|---------------|-------------|
| Facebook Shop | Tus productos aparecen en tu pagina de Facebook |
| Instagram Shopping | Puedes etiquetar productos en publicaciones |
| Anuncios dinamicos | Meta muestra productos relevantes automaticamente |
| Actualizacion automatica | Precios y disponibilidad siempre al dia |
| Retargeting | Muestra a usuarios los productos que vieron en tu web |

