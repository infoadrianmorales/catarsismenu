/**
 * ReviewCTA
 * Sección minimalista tipo "split editorial" que invita al usuario a dejar una reseña en Google.
 * Texto y contexto a la izquierda; estrellas + botón Raspberry a la derecha.
 * Dispara evento Contact del Meta Pixel al hacer clic.
 */
import { trackContact } from '@/lib/metaPixel';

// URL oficial de reseñas de Google Business
const GOOGLE_REVIEW_URL = 'https://g.page/r/Ce_gFnqwpuwcEBM/review';

export const ReviewCTA = () => {
  const handleClick = () => {
    try {
      trackContact('google_review');
    } catch {
      /* noop */
    }
  };

  return (
    <section className="w-full flex items-center justify-center bg-background px-4 sm:px-6 py-12">
      <div className="w-full max-w-5xl">
        <div className="relative overflow-hidden border-y border-white/10 py-14 px-4 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-10">
          {/* Halos decorativos muy sutiles */}
          <div
            className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: 'hsl(var(--raspberry) / 0.06)' }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: 'hsl(var(--xanthous) / 0.05)' }}
            aria-hidden="true"
          />

          {/* Izquierda: Texto */}
          <div className="relative space-y-3 max-w-xl text-center md:text-left">
            <h2 className="font-display text-white text-4xl md:text-5xl font-bold tracking-tight leading-tight">
              ¿Qué te pareció <span className="text-[#DB1F51]">Catarsis</span>?
            </h2>
            <p className="font-body text-white/60 text-base md:text-lg max-w-md mx-auto md:mx-0">
              Tu experiencia es el motor de nuestro espacio. Ayúdanos a crecer dejando una reseña en Google.
            </p>
          </div>

          {/* Derecha: Estrellas + CTA */}
          <div className="relative flex flex-col items-center md:items-end gap-5 shrink-0">
            <div className="flex gap-1.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} className="w-6 h-6" style={{ color: '#FFB800' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>

            <a
              href={GOOGLE_REVIEW_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleClick}
              className="group inline-flex items-center gap-3 bg-[#DB1F51] hover:bg-[#c11b47] text-white px-8 py-4 rounded-full font-body font-medium transition-all duration-300 hover:-translate-y-1 shadow-lg shadow-[#DB1F51]/20 min-h-[44px]"
            >
              <span>Déjanos tu reseña</span>
              <svg
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewCTA;
