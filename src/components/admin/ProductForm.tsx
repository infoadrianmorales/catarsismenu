import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type ProductCategory = Database['public']['Enums']['product_category'];

interface Product {
  id?: string;
  nombre: string;
  slug: string;
  categoria: ProductCategory;
  descripcion_corta: string;
  precio_usd: number;
  tags: string[];
  imagen_url: string | null;
  orden: number;
  activo: boolean;
}

interface ProductFormProps {
  product?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  { value: 'entradas', label: 'Entradas' },
  { value: 'hamburguesas', label: 'Hamburguesas' },
  { value: 'emparedados', label: 'Emparedados' },
  { value: 'pizzas', label: 'Pizzas' },
  { value: 'parrilla', label: 'Parrilla' },
  { value: 'ensaladas', label: 'Ensaladas' },
  { value: 'cocteleria', label: 'Coctelería' },
  { value: 'postres', label: 'Postres' },
];

const AVAILABLE_TAGS = ['Popular', 'Nuevo', 'Vegetariano', '2x1'];

export const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.imagen_url || null);
  
  const [formData, setFormData] = useState<Product>({
    nombre: product?.nombre || '',
    slug: product?.slug || '',
    categoria: product?.categoria || 'entradas' as ProductCategory,
    descripcion_corta: product?.descripcion_corta || '',
    precio_usd: product?.precio_usd || 0,
    tags: product?.tags || [],
    imagen_url: product?.imagen_url || null,
    orden: product?.orden || 0,
    activo: product?.activo ?? true,
  });

  // Auto-generate slug from nombre
  useEffect(() => {
    if (!product) {
      const slug = formData.nombre
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.nombre, product]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${formData.slug || Date.now()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, imagen_url: publicUrl }));
      setImagePreview(publicUrl);
      toast.success('Imagen subida correctamente');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.categoria || formData.precio_usd <= 0) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const productData = {
        nombre: formData.nombre,
        slug: formData.slug,
        categoria: formData.categoria,
        descripcion_corta: formData.descripcion_corta || null,
        precio_usd: formData.precio_usd,
        tags: formData.tags,
        imagen_url: formData.imagen_url,
        orden: formData.orden,
        activo: formData.activo,
      };

      if (product?.id) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('Producto actualizado');
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
        toast.success('Producto creado');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Nombre */}
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={e => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
            placeholder="Ej: Hamburguesa Clásica"
            required
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            placeholder="hamburguesa-clasica"
          />
        </div>

        {/* Categoría */}
        <div className="space-y-2">
          <Label>Categoría *</Label>
          <Select
            value={formData.categoria}
            onValueChange={value => setFormData(prev => ({ ...prev, categoria: value as ProductCategory }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona categoría" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Precio */}
        <div className="space-y-2">
          <Label htmlFor="precio">Precio USD *</Label>
          <Input
            id="precio"
            type="number"
            step="0.01"
            min="0"
            value={formData.precio_usd}
            onChange={e => setFormData(prev => ({ ...prev, precio_usd: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>

        {/* Orden */}
        <div className="space-y-2">
          <Label htmlFor="orden">Orden</Label>
          <Input
            id="orden"
            type="number"
            min="0"
            value={formData.orden}
            onChange={e => setFormData(prev => ({ ...prev, orden: parseInt(e.target.value) || 0 }))}
          />
        </div>

        {/* Activo */}
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="activo"
            checked={formData.activo}
            onCheckedChange={checked => setFormData(prev => ({ ...prev, activo: checked }))}
          />
          <Label htmlFor="activo">Producto activo</Label>
        </div>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción corta (máx 120 caracteres)</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion_corta}
          onChange={e => setFormData(prev => ({ ...prev, descripcion_corta: e.target.value.slice(0, 120) }))}
          placeholder="Ingredientes o descripción breve..."
          maxLength={120}
        />
        <p className="text-xs text-muted-foreground">{formData.descripcion_corta.length}/120</p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Etiquetas</Label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                formData.tags.includes(tag)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Imagen */}
      <div className="space-y-2">
        <Label>Imagen del producto</Label>
        <div className="flex items-start gap-4">
          {imagePreview ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setImagePreview(null);
                  setFormData(prev => ({ ...prev, imagen_url: null }));
                }}
                className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Subir imagen</span>
                </>
              )}
            </label>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {product ? 'Guardar cambios' : 'Crear producto'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
