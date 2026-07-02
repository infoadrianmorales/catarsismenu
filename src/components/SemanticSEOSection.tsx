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
import { appConfig } from '@/data/config';

export const SemanticSEOSection = () => {
  // [2026-07-02] Embed oficial de Google Maps (Catarsis Lechería).
  // URL provista por el negocio — no reemplazar por OSM ni por búsquedas
  // por texto. Si cambia la ubicación, actualizar también appConfig.maps_url.
  const googleMapsEmbed =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3926.993171529659!2d-64.69077589999999!3d10.181209299999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2d7338e1318071%3A0x1ceca6b07a16e0ef!2sCatarsis%20Lecheria!5e0!3m2!1ses!2sve!4v1783028229320!5m2!1ses!2sve';



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

        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-stretch">
          {/* Columna izquierda — Párrafos semánticos SEO.
              NO ELIMINAR NI OCULTAR. Google e IAs leen este texto.
              CONTRASTE: text-gray-300 cumple WCAG AA sobre #010C23. */}
          <div className="flex flex-col justify-center space-y-4 text-base md:text-lg text-gray-300 leading-relaxed">
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

          {/* Columna derecha — solo título + mapa (dirección, horario y CTA
              se muestran en el Footer y TopBar; se eliminaron aquí para
              evitar duplicación y mejorar la simetría visual). */}
          <div className="flex flex-col gap-5">
            <h3 className="text-xl md:text-2xl font-display font-bold text-white">
              Encuéntranos en Lechería
            </h3>

            <a
              href={appConfig.maps_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ver ubicación de Catarsis en Google Maps"
              className="block relative rounded-2xl overflow-hidden border border-white/10 group flex-1 min-h-[320px]"
            >
              <iframe
                title="Ubicación de Catarsis en Google Maps"
                src={googleMapsEmbed}
                loading="lazy"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="w-full h-full pointer-events-none border-0"
              />

              <span className="absolute bottom-3 left-3 bg-[#DB1F51] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                Ver en Google Maps
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
