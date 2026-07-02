/**
 * TestimonialsSection
 * Carrusel de testimonios de clientes con navegación por flechas y dots.
 * Estilo minimalista tipo card gris claro con texto en cursiva serif.
 */
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

export const TestimonialsSection = () => {
  const [index, setIndex] = useState(0);
  const total = TESTIMONIALS.length;
  const active = TESTIMONIALS[index];

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <section className="w-full px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-display text-white text-2xl sm:text-3xl font-bold mb-6">
          Testimonios de nuestros clientes
        </h2>

        <div className="rounded-3xl bg-[#F5F6F8] px-6 py-12 sm:py-16 text-center relative">
          <p className="text-[#010C23] text-base font-medium">{active.name}</p>
          <p className="text-[#010C23]/60 text-sm mb-6">{active.role}</p>

          <p
            className="text-[#010C23] text-lg sm:text-xl md:text-2xl italic max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            "{active.quote}"
          </p>

          {/* Controles */}
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
      </div>
    </section>
  );
};

export default TestimonialsSection;
