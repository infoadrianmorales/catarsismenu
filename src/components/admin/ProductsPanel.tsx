import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, Plus, Package, Pencil, Trash2 } from 'lucide-react';
import { ProductForm } from './ProductForm';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ProductCategory = Database['public']['Enums']['product_category'];

interface Product {
  id: string;
  nombre: string;
  slug: string;
  categoria: ProductCategory;
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('categoria', { ascending: true })
      .order('orden', { ascending: true });

    if (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deletingProduct.id);

      if (error) throw error;
      toast.success('Producto eliminado');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error al eliminar el producto');
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const getCategoryLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      entradas: 'Entradas',
      hamburguesas: 'Hamburguesas',
      emparedados: 'Emparedados',
      pizzas: 'Pizzas',
      parrilla: 'Parrilla',
      ensaladas: 'Ensaladas',
      alitas: 'Alitas',
      cocktails: 'Coctelería',
      postres: 'Postres',
      bebidas: 'Bebidas',
      acompanantes: 'Acompañantes',
    };
    return labels[categoria] || categoria;
  };

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
        <Button onClick={handleAddProduct} className="gap-2 bg-primary hover:bg-primary/90">
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
            <Card key={product.id} className="bg-card border-border overflow-hidden">
              {product.imagen_url && (
                <div className="aspect-video bg-white">
                  <img 
                    src={product.imagen_url} 
                    alt={product.nombre}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.descripcion_corta || 'Sin descripción'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-secondary">
                    ${Number(product.precio_usd).toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {getCategoryLabel(product.categoria)}
                  </span>
                </div>
                
                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-muted rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditProduct(product)}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeletingProduct(product)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Product Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct}
            onSuccess={handleFormSuccess}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente "{deletingProduct?.nombre}". 
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
