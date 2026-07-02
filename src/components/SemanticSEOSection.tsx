// [2026-07-02] CATARSIS — Sección SEO + ubicación en 2 columnas simétricas.
// Coordenadas verificadas contra el listado real de Google Places
// (10.181209, -64.690776).
// REGLA: El texto de la columna izquierda NO debe eliminarse ni ocultarse
// con CSS display:none. Google y los modelos de IA lo leen directamente
// desde el HTML. Es la base del posicionamiento local.
// HORARIO: 12:00 PM – 1:00 AM confirmado por el negocio (no usar el
// horario que muestra la ficha de Google, que dice 2:00 AM y no está
// actualizado — mantener 1:00 AM por temas legales).
// ACTUALIZAR SI CAMBIA horario, ubicación, carta o pagos.
// Mantener sincronizado con RestaurantSchema.tsx, FAQSchema.tsx y
// public/llms.txt.
import { MapPin, Clock } from 'lucide-react';
import { appConfig } from '@/data/config';

export const SemanticSEOSection = () => {
  // Coordenadas verificadas del negocio.
  const LAT = 10.181209;
  const LNG = -64.690776;
  // BBox pequeña alrededor del punto para el embed de OpenStreetMap (sin API key).
  const delta = 0.003;
  const bbox = `${LNG - delta}%2C${LAT - delta}%2C${LNG + delta}%2C${LAT + delta}`;
  const osmEmbed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${LAT}%2C${LNG}`;

  return (
    <section
      aria-label="Sobre Catarsis Lechería"
      style={{ backgroundColor: '#010C23' }}
      className="py-10 px-6"
    >
      {/* Contenedor ensanchado (antes max-w-3xl) para que las dos
          columnas queden simétricas y con espacio suficiente. */}
      <div className="max-w-5xl mx-auto space-y-6">
        {/* H2 SEO: keyword local de alto valor para Google e IAs.
            Se mantiene arriba, abarcando todo el ancho. */}
        <h2
          className="text-sm md:text-base font-semibold tracking-wide"
          style={{ color: '#F2B60F' }}
        >
          ¿Por qué Catarsis es el restaurante favorito de Lechería?
        </h2>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Columna izquierda — Párrafos semánticos SEO.
              NO ELIMINAR NI OCULTAR. Google e IAs leen este texto.
              Actualizar si cambia la carta o el horario. */}
          {/* ACCESIBILIDAD [CONTRASTE]: text-gray-300 cumple WCAG AA
              (ratio 4.5:1) sobre fondo #010C23. */}
          <div className="space-y-2 text-xs md:text-sm text-gray-300 leading-relaxed">
            <p>
              Catarsis Drinks &amp; Food es un restaurante en CC Aventura
              Plaza, Lechería, Anzoátegui, reconocido por la calidad de
              cada uno de sus productos. Hamburguesas gourmet, pizzas,
              emparedados, parrilla, ensaladas y coctelería de autor —
              todos preparados con ingredientes frescos y recetas propias.
            </p>
            <p>
              Por las noches, disfruta de cócteles únicos como el Catarsis
              Punch, la Margarita y más. Abrimos de lunes a domingo de
              12:00 PM a 1:00 AM. Aceptamos dólares, bolívares,
              Pago Móvil, Zelle y tarjetas.
            </p>
          </div>

          {/* Columna derecha — Ubicación real con mapa estático y CTA.
              Coordenadas verificadas: 10.181209, -64.690776.
              Mapa vía OpenStreetMap (gratis, sin API key). El botón
              "Cómo llegar" usa appConfig.maps_url (Place ID real),
              la misma URL que ya usa el Footer. */}
          <div className="space-y-3">
            <h3
              className="text-sm md:text-base font-semibold tracking-wide"
              style={{ color: '#F2B60F' }}
            >
              Encuéntranos en Lechería
            </h3>

            <a
              href={appConfig.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver ubicación de Catarsis en Google Maps"
              className="block relative rounded-xl overflow-hidden border border-white/10 group"
            >
              <iframe
                title="Ubicación de Catarsis en Lechería"
                src={osmEmbed}
                loading="lazy"
                className="w-full h-48 md:h-56 pointer-events-none"
              />
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Ver en Google Maps
              </span>
            </a>

            <div className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#DB1F51' }} />
              <div className="leading-snug">
                <p className="font-semibold text-white">CC Aventura Plaza</p>
                <p>Av. Diego Bautista Urbaneja, Lechería, Anzoátegui</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
              <Clock className="h-4 w-4 mt-0.5 shrink-0" style={{ color: '#DB1F51' }} />
              <div className="leading-snug">
                <p className="font-semibold text-white">Lunes a Domingo</p>
                <p>12:00 PM – 1:00 AM</p>
              </div>
            </div>

            <a
              href={appConfig.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#DB1F51] hover:bg-[#DB1F51]/90 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
            >
              <MapPin className="h-4 w-4" />
              Cómo llegar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
