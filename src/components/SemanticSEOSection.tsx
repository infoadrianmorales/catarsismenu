// [2026-07-02] CATARSIS — Sección SEO + ubicación en 2 columnas simétricas.
// Coordenadas verificadas contra el listado real de Google Places
// (10.181209, -64.690776).
// REGLA: El texto de la columna izquierda NO debe eliminarse ni ocultarse
// con CSS display:none. Google y los modelos de IA lo leen directamente
// desde el HTML. Es la base del posicionamiento local.
// HORARIO: 12:00 PM – 1:00 AM confirmado por el negocio (mantener 1:00 AM
// por temas legales, aunque la ficha de Google diga otra cosa).
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
      className="py-14 md:py-20 px-6"
    >
      {/* Contenedor ensanchado para columnas simétricas con más aire. */}
      <div className="max-w-6xl mx-auto space-y-8 md:space-y-10">
        {/* H2 SEO — tipografía display grande estilo brand. */}
        <h2
          className="text-2xl md:text-4xl font-display font-bold uppercase tracking-tight"
          style={{ color: '#F2B60F' }}
        >
          ¿Por qué Catarsis es el restaurante favorito de Lechería?
        </h2>

        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-start">
          {/* Columna izquierda — Párrafos semánticos SEO.
              NO ELIMINAR NI OCULTAR. Google e IAs leen este texto.
              Actualizar si cambia la carta o el horario.
              CONTRASTE: text-gray-300 cumple WCAG AA sobre #010C23. */}
          <div className="space-y-4 text-base md:text-lg text-gray-300 leading-relaxed">
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

          {/* Columna derecha — Ubicación real con mapa y CTA.
              Coordenadas verificadas: 10.181209, -64.690776.
              Mapa vía OpenStreetMap (gratis, sin API key). CTA usa
              appConfig.maps_url (Place ID real) — misma URL del Footer. */}
          <div className="space-y-5">
            <h3 className="text-xl md:text-2xl font-display font-bold text-white">
              Encuéntranos en Lechería
            </h3>

            <a
              href={appConfig.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver ubicación de Catarsis en Google Maps"
              className="block relative rounded-2xl overflow-hidden border border-white/10 group"
            >
              <iframe
                title="Ubicación de Catarsis en Lechería"
                src={osmEmbed}
                loading="lazy"
                className="w-full h-64 md:h-72 pointer-events-none"
              />
              <span className="absolute bottom-3 left-3 bg-[#DB1F51] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                Ver en Google Maps
              </span>
            </a>

            <div className="flex items-start gap-3 text-sm md:text-base text-gray-300 pt-2">
              <MapPin className="h-6 w-6 mt-0.5 shrink-0" style={{ color: '#F2B60F' }} />
              <div className="leading-snug">
                <p className="font-bold text-white text-base md:text-lg">CC Aventura Plaza</p>
                <p>Av. Diego Bautista Urbaneja, Lechería, Anzoátegui</p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm md:text-base text-gray-300 pt-4 border-t border-white/10">
              <Clock className="h-6 w-6 mt-0.5 shrink-0" style={{ color: '#F2B60F' }} />
              <div className="leading-snug pt-4">
                <p className="font-bold text-white text-base md:text-lg">Lunes a Domingo</p>
                <p>12:00 PM – 1:00 AM</p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <a
                href={appConfig.maps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#DB1F51] hover:bg-[#DB1F51]/90 text-white text-base font-semibold px-6 py-3 rounded-full transition-colors"
              >
                <MapPin className="h-5 w-5" />
                Cómo llegar
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
