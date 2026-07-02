/**
 * SocialProofSection
 * Bloque unificado que combina Testimonios + CTA de reseña Google
 * dentro de una sola card gris clara.
 */
import { useState } from 'react';
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
    name: 'Daniela Padrón',
    role: 'Cliente',
    quote: '¡La CHEESY BURGER es mi favorita! Siempre la pido con extra tocineta.',
  },
  {
    name: 'Andrés Rojas',
    role: 'Cliente',
    quote: 'La mejor pizza artesanal de Lechería. La masa es espectacular.',
  },
  {
    name: 'María Fernanda',
    role: 'Cliente',
    quote: 'El ambiente es increíble y los cócteles de autor son únicos en la zona.',
  },
  {
    name: 'José Luis',
    role: 'Cliente',
    quote: 'Delivery rápido y la comida llega caliente. Mi spot favorito.',
  },
  {
    name: 'Camila Herrera',
    role: 'Cliente',
    quote: 'Los emparedados son enormes y llenos de sabor. Muy recomendados.',
  },
];

export const SocialProofSection = () => {
  const [index, setIndex] = useState(0);
  const total = TESTIMONIALS.length;
  const active = TESTIMONIALS[index];

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

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

        <div className="rounded-3xl bg-[#F5F6F8] overflow-hidden">
          {/* Testimonios */}
          <div className="px-6 py-12 sm:py-14 text-center">
            <p className="text-[#010C23] text-base font-medium">{active.name}</p>
            <p className="text-[#010C23]/60 text-sm mb-6">{active.role}</p>

            <p
              className="text-[#010C23] text-lg sm:text-xl md:text-2xl italic max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
            >
              "{active.quote}"
            </p>

            {/* Controles del carrusel */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                type="button"
                onClick={prev}
                aria-label="Testimonio anterior"
                className="p-2 text-[#010C23]/60 hover:text-[#010C23] transition-colors"
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
                className="p-2 text-[#010C23]/60 hover:text-[#010C23] transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-[#010C23]/10 mx-6" />

          {/* CTA Reseña Google */}
          <div className="px-6 py-8 sm:py-10 flex flex-col md:flex-row items-center md:justify-between gap-6 text-center md:text-left">
            <div className="space-y-2 max-w-xl">
              <h3 className="font-display text-[#010C23] text-2xl sm:text-3xl font-bold tracking-tight leading-tight uppercase">
                ¿Qué te pareció <span className="text-[#DB1F51]">Catarsis</span>?
              </h3>
              <p className="font-body text-[#010C23]/70 text-sm md:text-base">
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
