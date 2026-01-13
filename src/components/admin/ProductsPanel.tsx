import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Package } from 'lucide-react';

interface Product {
  id: string;
  nombre: string;
  slug: string;
  categoria: string;
  descripcion_corta: string | null;
  precio_usd: number;
  tags: string[];
  imagen_url: string | null;
  orden: number;
  activo: boolean;
}

export const ProductsPanel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Productos</h2>
          <p className="text-sm text-muted-foreground">
            {products.length} productos en el menú
          </p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          Agregar Producto
        </Button>
      </div>

      {products.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No hay productos todavía.
              <br />
              Agrega tu primer producto para comenzar.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="bg-card border-border">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{product.nombre}</CardTitle>
                  <span className={`text-xs px-2 py-1 rounded ${
                    product.activo 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {product.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  {product.descripcion_corta || 'Sin descripción'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-secondary">
                    ${product.precio_usd.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {product.categoria}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
