import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
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

interface SortableProductCardProps {
  product: Product;
  categoryLabel: string;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  isDragDisabled?: boolean;
}

export const SortableProductCard = ({
  product,
  categoryLabel,
  onEdit,
  onDelete,
  isDragDisabled = false,
}: SortableProductCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: product.id,
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`bg-card border-border overflow-hidden transition-shadow ${
        isDragging ? 'shadow-xl ring-2 ring-primary' : ''
      }`}
    >
      {/* Drag Handle */}
      {!isDragDisabled && (
        <div 
          {...attributes} 
          {...listeners}
          className="flex items-center justify-center py-2 bg-muted/50 cursor-grab active:cursor-grabbing hover:bg-muted transition-colors border-b border-border"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground ml-1">Arrastrar para ordenar</span>
        </div>
      )}

      {product.imagen_url && (
        <div className="aspect-square bg-white">
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
            {categoryLabel}
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
            onClick={() => onEdit(product)}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
