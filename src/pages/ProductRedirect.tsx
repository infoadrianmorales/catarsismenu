// [2026-07-02] CATARSIS — Redirige /producto/:slug (URL antigua) a la
// nueva URL canónica /{categoria}/{slug}. Es un redirect del lado del
// cliente (no HTTP 301 real): mientras el sitio vive en Lovable no
// tenemos control del servidor, pero evita enlaces rotos, consolida
// señales SEO y funciona para todo el tráfico ya indexado/compartido.
import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const ProductRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  // null = cargando · '' = no encontrado · string = categoría real
  const [categoria, setCategoria] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setCategoria('');
      return;
    }
    // Consulta puntual: solo leemos la categoría del producto por slug.
    // Mucho más liviano que cargar toda la lista global de productos.
    supabase
      .from('products')
      .select('categoria')
      .eq('slug', slug)
      .maybeSingle()
      .then(({ data }) => setCategoria(data?.categoria ?? ''));
  }, [slug]);

  // Loading: dejamos un fallback mínimo para no dejar la pantalla blanca.
  if (categoria === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Redirigiendo…</p>
      </div>
    );
  }

  // Producto inexistente → home. `replace` evita ensuciar el historial.
  if (!categoria || !slug) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to={`/${categoria}/${slug}`} replace />;
};

export default ProductRedirect;
