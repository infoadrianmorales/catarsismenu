import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, Package, Info, FileDown } from 'lucide-react';
import { generateMenuPdf } from '@/lib/menuPdfExport';
import { ProductForm } from './ProductForm';
import { SortableProductCard } from './SortableProductCard';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

import { Product } from './SortableProductCard';

type ProductCategory = Database['public']['Enums']['product_category'];

const CATEGORIES = [
  { value: 'todos', label: 'Todas las categorías' },
  { value: 'entradas', label: 'Entradas' },
  { value: 'hamburguesas', label: 'Hamburguesas' },
  { value: 'emparedados', label: 'Emparedados' },
  { value: 'pizzas', label: 'Pizzas' },
  { value: 'parrilla', label: 'Parrilla' },
  { value: 'ensaladas', label: 'Ensaladas' },
  { value: 'cocteleria', label: 'Coctelería' },
  { value: 'postres', label: 'Postres' },
];

export const ProductsPanel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  const filteredProducts = selectedCategory === 'todos' 
    ? products 
    : products.filter(p => p.categoria === selectedCategory);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = filteredProducts.findIndex(p => p.id === active.id);
    const newIndex = filteredProducts.findIndex(p => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Reorder the filtered list
    const reorderedFiltered = arrayMove(filteredProducts, oldIndex, newIndex);
    
    // Update local state immediately for smooth UX
    if (selectedCategory === 'todos') {
      setProducts(reorderedFiltered);
    } else {
      // If filtering, we need to update the full products array
      const newProducts = products.map(p => {
        const filteredIndex = reorderedFiltered.findIndex(fp => fp.id === p.id);
        if (filteredIndex !== -1) {
          return { ...p, orden: filteredIndex };
        }
        return p;
      });
      setProducts(newProducts);
    }

    // Save new order to database
    setSaving(true);
    try {
      const updates = reorderedFiltered.map((product, index) => ({
        id: product.id,
        orden: index,
      }));

      // Update each product's order
      for (const update of updates) {
        const { error } = await supabase
          .from('products')
          .update({ orden: update.orden })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast.success('Orden actualizado');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al guardar el orden');
      // Revert on error
      fetchProducts();
    } finally {
      setSaving(false);
    }
  }, [filteredProducts, products, selectedCategory]);

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

  const handleToggleFeatured = async (product: Product) => {
    const featuredCount = products.filter(p => p.destacado).length;
    const isCurrentlyFeatured = product.destacado;
    
    // Check max 4 featured products
    if (!isCurrentlyFeatured && featuredCount >= 4) {
      toast.error('Máximo 4 productos destacados permitidos');
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .update({ destacado: !isCurrentlyFeatured })
        .eq('id', product.id);

      if (error) throw error;
      
      toast.success(isCurrentlyFeatured ? 'Producto quitado de destacados' : 'Producto marcado como destacado');
      fetchProducts();
    } catch (error) {
      console.error('Error toggling featured:', error);
      toast.error('Error al actualizar producto');
    }
  };

  const getCategoryLabel = (categoria: string) => {
    const found = CATEGORIES.find(c => c.value === categoria);
    return found?.label || categoria;
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Productos</h2>
          <p className="text-sm text-muted-foreground">
            {filteredProducts.length} de {products.length} productos
            <span className="mx-2">•</span>
            <span className="text-secondary">{products.filter(p => p.destacado).length}/4 destacados</span>
            {saving && <span className="ml-2 text-primary">(Guardando...)</span>}
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAddProduct} className="gap-2 bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Agregar
          </Button>
        </div>
      </div>

      {/* Drag & Drop hint */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <Info className="h-4 w-4 shrink-0" />
        <span>Arrastra las tarjetas desde la barra superior para reordenar los productos.</span>
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredProducts.map(p => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <SortableProductCard
                  key={product.id}
                  product={product}
                  categoryLabel={getCategoryLabel(product.categoria)}
                  onEdit={handleEditProduct}
                  onDelete={setDeletingProduct}
                  onToggleFeatured={handleToggleFeatured}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
