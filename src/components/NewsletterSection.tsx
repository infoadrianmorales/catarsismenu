/**
 * NewsletterSection
 * Sección de captación de correos que guarda suscriptores en la tabla
 * `newsletter_subscribers` de Lovable Cloud. Dispara evento Lead al éxito.
 */
import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { trackLead } from '@/lib/metaPixel';

const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Ingresa un correo válido' })
  .max(254, { message: 'Correo demasiado largo' });

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: parsed.data.toLowerCase(), source: 'homepage' });

      if (error) {
        // 23505 = unique_violation → ya suscrito, tratamos como éxito silencioso
        if (error.code === '23505') {
          toast.success('¡Ya estás suscrito! Gracias por seguirnos.');
        } else {
          throw error;
        }
      } else {
        toast.success('¡Suscripción exitosa! Gracias por unirte.');
        try {
          trackLead('newsletter');
        } catch {
          /* noop */
        }
      }
      setEmail('');
    } catch (err) {
      console.error('[Newsletter] Error al suscribir:', err);
      toast.error('Hubo un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full flex items-center justify-center px-4 sm:px-6 py-8">
      <div className="w-full max-w-5xl">
        <div className="rounded-3xl bg-[#010C23] border border-white/5 shadow-2xl px-6 py-10 sm:py-12 text-center">
          <div className="flex justify-center mb-4">
            <Send className="h-8 w-8 text-white" strokeWidth={1.5} />
          </div>

          <h2 className="font-display text-white text-3xl sm:text-4xl font-bold mb-6">
            ¡Suscríbete!
          </h2>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo electrónico"
              disabled={loading}
              required
              maxLength={254}
              aria-label="Correo electrónico"
              className="flex-1 rounded-full bg-transparent border border-white/20 px-5 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/50 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 hover:bg-[#DB1F51] hover:border-[#DB1F51] text-white px-6 py-3 font-medium transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span>Registrarme</span>
            </button>
          </form>

          <p className="text-white/50 text-xs sm:text-sm mt-5">
            Suscríbete a nuestro newsletter y recibe ofertas y noticias exclusivas.
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
