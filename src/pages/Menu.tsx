import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProducts } from '@/hooks/useProducts';
import { usePublicCategories } from '@/hooks/usePublicCategories';
import { MenuItem } from '@/types/menu';

// [2026-10-06] /menu usa el mismo catálogo que la home para evitar que
// productos, descripciones, precios y datos estructurados se desactualicen.
const formatPrice = (price: number) => `$${price.toFixed(2)}`;

interface MenuCategoryGroup {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  items: MenuItem[];
}

const CategorySection = ({ category }: { category: MenuCategoryGroup }) => {
  const startingPrice = Math.min(...category.items.map((item) => item.precio_usd));

  return (
    <section id={category.slug} className="scroll-mt-24 border-t border-border py-8 first:border-t-0 md:py-10">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-primary md:text-3xl">
            {category.name}
          </h2>
          {category.description && (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground md:text-base">
              {category.description}
            </p>
          )}
        </div>
        <p className="shrink-0 text-sm font-semibold text-secondary md:text-base">
          Desde {formatPrice(startingPrice)} USD
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-10 gap-y-1 md:grid-cols-2">
        {category.items.map((item) => (
          <Link
            key={item.id}
            to={`/${item.categoria}/${item.slug}`}
            className="group flex min-h-24 items-start justify-between gap-4 border-b border-border/60 py-4 transition-colors hover:border-primary/60"
          >
            <div className="min-w-0 flex-1">
              <h3 className="flex items-center gap-1 font-display text-base font-semibold text-foreground transition-colors group-hover:text-primary md:text-lg">
                <span>{item.nombre}</span>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
              </h3>
              {item.descripcion_corta && (
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {item.descripcion_corta}
                </p>
              )}
            </div>
            <span className="shrink-0 font-display text-base font-bold text-secondary md:text-lg">
              {formatPrice(item.precio_usd)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

const Menu = () => {
  const queryClient = useQueryClient();
  const { products, loading: productsLoading, error: productsError } = useProducts();
  const { sectionCategories, loading: categoriesLoading, error: categoriesError } = usePublicCategories();

  // Se excluye Best Seller porque es una agrupación virtual y no una categoría
  // del catálogo. El resto conserva el orden definido en administración.
  const menuCategories = useMemo<MenuCategoryGroup[]>(() => (
    sectionCategories
      .filter((category) => category.slug !== 'best-seller')
      .map((category) => ({
        id: category.id,
        slug: category.slug,
        name: category.nombre,
        description: category.descripcion,
        items: products.filter((product) => product.categoria === category.slug),
      }))
      .filter((category) => category.items.length > 0)
  ), [products, sectionCategories]);

  // El JSON-LD se genera desde exactamente los mismos elementos visibles.
  const menuSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Menú Catarsis Drinks & Food',
    url: 'https://www.catarsiszone.com/menu',
    inLanguage: 'es',
    description: 'Carta actualizada de Catarsis Drinks & Food en CC Aventura Plaza, Lechería, Anzoátegui.',
    hasMenuSection: menuCategories.map((category) => ({
      '@type': 'MenuSection',
      name: category.name,
      description: category.description || `${category.items.length} productos disponibles`,
      hasMenuItem: category.items.map((item) => ({
        '@type': 'MenuItem',
        name: item.nombre,
        description: item.descripcion_corta,
        url: `https://www.catarsiszone.com/${item.categoria}/${item.slug}`,
        offers: {
          '@type': 'Offer',
          price: item.precio_usd.toFixed(2),
          priceCurrency: 'USD',
          availability: item.is_orderable === false
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
        },
      })),
    })),
  }), [menuCategories]);

  const loading = productsLoading || categoriesLoading;
  const hasError = Boolean(productsError || categoriesError);

  const handleRetry = () => {
    queryClient.refetchQueries({ queryKey: ['products'] });
    queryClient.refetchQueries({ queryKey: ['public-categories'] });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Menú Completo y Precios Actualizados"
        description="Consulta el menú actualizado de Catarsis Drinks & Food: entradas, hamburguesas, emparedados, pizzas, parrilla, ensaladas, bebidas, coctelería y postres en Lechería."
        url="/menu"
      />

      {!loading && menuCategories.length > 0 && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(menuSchema)}</script>
        </Helmet>
      )}

      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft aria-hidden="true" />
              Volver al inicio
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        <div className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
          <p className="mb-2 text-sm font-semibold uppercase text-secondary">Carta actualizada</p>
          <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Menú de Catarsis Drinks & Food
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Todos nuestros platos, bebidas y precios vigentes en CC Aventura Plaza, Lechería.
          </p>
        </div>

        {!loading && menuCategories.length > 0 && (
          <nav aria-label="Categorías del menú" className="mb-6 flex gap-2 overflow-x-auto border-y border-border py-3">
            {menuCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.slug}`}
                className="inline-flex min-h-11 shrink-0 items-center px-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                {category.name}
              </a>
            ))}
          </nav>
        )}

        {loading ? (
          <div className="space-y-10" aria-label="Cargando menú">
            {[0, 1, 2].map((section) => (
              <div key={section} className="space-y-4">
                <Skeleton className="h-8 w-52" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-20 w-full" />)}
                </div>
              </div>
            ))}
          </div>
        ) : menuCategories.length > 0 ? (
          menuCategories.map((category) => <CategorySection key={category.id} category={category} />)
        ) : (
          <section className="py-16 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {hasError ? 'No pudimos cargar el menú' : 'El menú no está disponible'}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              {hasError ? 'Revisa tu conexión e inténtalo nuevamente.' : 'Vuelve pronto para consultar nuestra carta.'}
            </p>
            {hasError && (
              <Button onClick={handleRetry} className="mt-6">
                <RefreshCw aria-hidden="true" />
                Reintentar
              </Button>
            )}
          </section>
        )}

        <section className="mt-8 border-t border-border pt-8">
          <h2 className="font-display text-2xl font-bold text-primary">Cómo pedir en Catarsis</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>Visítanos en CC Aventura Plaza, Lechería, Anzoátegui. Hacemos delivery en Lechería y zonas cercanas.</p>
            <p>Aceptamos Pago Móvil, Zelle, efectivo en dólares y bolívares, además de tarjetas de débito y crédito.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Menu;