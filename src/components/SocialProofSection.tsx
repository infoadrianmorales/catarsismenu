/**
 * SocialProofSection
 * Bloque unificado que combina Testimonios + CTA de reseña Google
 * dentro de una sola card gris clara.
 */
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { trackContact } from '@/lib/metaPixel';

const GOOGLE_REVIEW_URL = 'https://g.page/r/Ce_gFnqwpuwcEBM/review';

interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Alexandra Bolívar',
    role: 'Local Guide',
    quote:
      'Excelente servicio de otro nivel. Música en directo, buen ambiente y tiempo de espera menor a 10 minutos.',
  },
  {
    name: 'Boot Camp Venezuela',
    role: 'Local Guide',
    quote:
      'Esto es una experiencia increíble. Les recomiendo la Pizza Tasty, es BRUTAL. Todo de primera: desde la masa, los ingredientes y la cocción. 💯 puntos.',
  },
  {
    name: 'Giovanna Gabriella',
    role: 'Local Guide',
    quote:
      'Todo excelente. Me gustó porque tiene espacio al aire libre, buena música y la comida muy rica.',
  },
  {
    name: 'María Gabriela León Franco',
    role: 'Local Guide',
    quote: 'Excelente ambiente para pasarlo en familia y amigos. Lo recomiendo 💛.',
  },
  {
    name: 'Alan Armas',
    role: 'Local Guide',
    quote:
      'La comida es UFF, buenísima. El ambiente es chill, perfecto para una reunión con amigos o una cita tranquila. Recomiendo mucho sus hamburguesas y el emparedado de Fondue de lomito. 100% recomendados.',
  },
  {
    name: 'Andrés Daniel',
    role: 'Local Guide',
    quote:
      'Todo lo que pidió la familia fue riquísimo. Los platos a buena temperatura, la comida con un sabor especial y los jugos súper concentrados ✨. Y ni hablar de los Aros de Cebolla, los mejores que he probado en mi vida. Su empaque para llevar, muy elegante.',
  },
  {
    name: 'Keillys Ramírez',
    role: 'Cliente',
    quote:
      'Me gustó todo, la verdad. Muy recomendado para pasar el rato y conversar con amigos. La atención de los chicos es súper buena.',
  },
];

export const SocialProofSection = () => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = TESTIMONIALS.length;
  const active = TESTIMONIALS[index];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  // [2026-07-02] Autoplay 6s con pausa en hover y respeto por reduced-motion.
  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || isPaused) return;

    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, total, index]);

  const handleReviewClick = () => {
    try {
      trackContact('google_review');
    } catch {
      /* noop */
    }
  };

  return (
    <section className="w-full px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-white text-2xl sm:text-3xl font-bold mb-6 uppercase tracking-wide">
          Testimonios de nuestros clientes
        </h2>

        <div className="rounded-3xl overflow-hidden">
          {/* Testimonios — fondo blanco, altura fija para uniformidad */}
          <div
            className="bg-white px-6 py-12 sm:py-14 text-center flex flex-col justify-center min-h-[300px] sm:min-h-[340px]"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div key={index} className="animate-fade-in">
              <p className="text-[#010C23] text-base font-medium">{active.name}</p>
              <p className="text-[#010C23]/60 text-sm mb-6">{active.role}</p>

              <p
                className="text-[#010C23] text-lg sm:text-xl md:text-2xl italic max-w-2xl mx-auto leading-relaxed"
                style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
              >
                "{active.quote}"
              </p>
            </div>

            {/* Controles del carrusel */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={prev}
                aria-label="Testimonio anterior"
                className="p-2 text-[#010C23]/50 hover:text-[#010C23] transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Ir al testimonio ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === index
                        ? 'w-6 bg-[#010C23]'
                        : 'w-2 bg-[#010C23]/25 hover:bg-[#010C23]/40'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={next}
                aria-label="Siguiente testimonio"
                className="p-2 text-[#010C23]/50 hover:text-[#010C23] transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* CTA Reseña Google — fondo azul marca */}
          <div className="bg-[#010C23] px-6 py-8 sm:py-10 flex flex-col md:flex-row items-center md:justify-between gap-6 text-center md:text-left">

            <div className="space-y-2 max-w-xl">
              <h3 className="font-display text-white text-2xl sm:text-3xl font-bold tracking-tight leading-tight uppercase">
                ¿Qué te pareció <span className="text-[#DB1F51]">Catarsis</span>?
              </h3>
              <p className="font-body text-white/70 text-sm md:text-base">
                Tu experiencia es el motor de nuestro espacio. Ayúdanos a crecer dejando una reseña en Google.
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3 shrink-0">
              <div className="flex gap-1" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-5 h-5" style={{ color: '#FFB800' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>

              <a
                href={GOOGLE_REVIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleReviewClick}
                className="group inline-flex items-center gap-2 bg-[#DB1F51] hover:bg-[#c11b47] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-body font-medium text-sm transition-all duration-300 hover:-translate-y-0.5 shadow-lg shadow-[#DB1F51]/20 min-h-[44px]"
              >
                <span>Déjanos tu reseña</span>
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
      </div>
    </section>
  );
};

export default SocialProofSection;
