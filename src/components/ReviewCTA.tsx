/**
 * ReviewCTA
 * Tarjeta llamativa que invita al usuario a dejar una reseña en Google.
 * Diseño Raspberry con sombra dura amarilla y textura halftone.
 * Dispara evento Contact del Meta Pixel al hacer clic.
 */
import { trackContact } from '@/lib/metaPixel';

// URL de reseñas de Google — actualizar cuando se tenga el enlace oficial
const GOOGLE_REVIEW_URL = 'https://g.page/r/CatarsisFood/review';

export const ReviewCTA = () => {
  const handleClick = () => {
    try {
      trackContact('google_review');
    } catch {
      /* noop */
    }
  };

  return (
    <section className="w-full flex items-center justify-center px-4 py-10 bg-background">
      <div className="relative max-w-sm w-full bg-raspberry p-8 rounded-2xl shadow-[12px_12px_0px_0px_hsl(var(--xanthous))] border-[3px] border-rich-black overflow-hidden group hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[16px_16px_0px_0px_hsl(var(--xanthous))] transition-all duration-300">
        {/* Textura halftone */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#000 15%, transparent 15%)',
            backgroundSize: '6px 6px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="font-body text-white font-bold text-xs uppercase tracking-[0.2em] opacity-90 mb-1">
            ¿Te gustó?
          </p>
          <h2 className="font-display text-white text-5xl font-black mb-4 leading-none uppercase tracking-tighter [transform:skewX(-2deg)]">
            CUÉNTANOS
          </h2>

          {/* Estrellas */}
          <div className="flex gap-1 mb-8" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                className="w-7 h-7 fill-xanthous drop-shadow-[0_2px_0_rgba(0,0,0,0.3)]"
                viewBox="0 0 24 24"
              >
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>

          <a
            href={GOOGLE_REVIEW_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="w-full bg-white hover:bg-neutral-50 text-rich-black py-4 px-6 rounded-xl font-display font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 border-b-[6px] border-neutral-300 active:border-b-0 min-h-[44px]"
          >
            <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            DÉJANOS TU RESEÑA
          </a>

          <p className="font-body mt-4 text-white/70 text-[10px] uppercase tracking-widest">
            Google Reviews • Catarsis Food
          </p>
        </div>
      </div>
    </section>
  );
};

export default ReviewCTA;
