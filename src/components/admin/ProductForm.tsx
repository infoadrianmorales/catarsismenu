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
import { generateResponsiveImages, blobToFile, getImagePaths, getImageExtension } from '@/lib/imageProcessor';
import { useCategories } from '@/hooks/useCategories';

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



export const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
  const { categories, loading: categoriesLoading } = useCategories();
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

    // Validate file size (max 10MB for processing)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('La imagen no debe superar 10MB');
      return;
    }

    setUploading(true);
    
    try {
      const slug = formData.slug || `product-${Date.now()}`;
      
      // Generate responsive images (200, 400, 800px in WebP or JPEG)
      toast.info('Procesando imagen...');
      const images = await generateResponsiveImages(file);
      const paths = getImagePaths(slug, images.format);
      const ext = getImageExtension(images.format);
      
      // Upload all 3 sizes in parallel
      const uploadPromises = [
        supabase.storage
          .from('product-images')
          .upload(paths.thumb, images.thumb, { upsert: true, contentType: `image/${images.format}` }),
        supabase.storage
          .from('product-images')
          .upload(paths.card, images.card, { upsert: true, contentType: `image/${images.format}` }),
        supabase.storage
          .from('product-images')
          .upload(paths.full, images.full, { upsert: true, contentType: `image/${images.format}` }),
      ];
      
      const results = await Promise.all(uploadPromises);
      
      // Check for upload errors
      const uploadError = results.find(r => r.error);
      if (uploadError?.error) throw uploadError.error;

      // Get public URL for the full-size image (base URL)
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(paths.full);

      // Add cache buster to force reload
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;
      
      setFormData(prev => ({ ...prev, imagen_url: urlWithCacheBuster }));
      setImagePreview(urlWithCacheBuster);
      toast.success(`Imagen optimizada (${ext.toUpperCase()}) subida correctamente`);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Error al procesar la imagen');
    } finally {
      setUploading(false);
    }
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
              {categories.filter(c => c.activo).map(cat => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.nombre}
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
            value={formData.precio_usd === 0 ? '' : formData.precio_usd}
            onChange={e => setFormData(prev => ({ ...prev, precio_usd: e.target.value === '' ? 0 : parseFloat(e.target.value) }))}
            placeholder="0.00"
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
            value={formData.orden === 0 ? '' : formData.orden}
            onChange={e => setFormData(prev => ({ ...prev, orden: e.target.value === '' ? 0 : parseInt(e.target.value) }))}
            placeholder="0"
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


      {/* Imagen */}
      <div className="space-y-4">
        <Label>Imagen del producto</Label>
        
        {/* Info sobre procesamiento automático */}
        <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xs text-muted-foreground">
            Las imágenes se procesan automáticamente: recorte 1:1, conversión a WebP y generación de múltiples resoluciones (200px, 400px, 800px) para optimizar el rendimiento.
          </p>
        </div>

        <div className="flex items-start gap-4">
          {imagePreview ? (
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border bg-white">
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
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground text-center px-2">
                  Procesando...
                </span>
              </div>
            ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1 text-center">
                    Subir imagen
                  </span>
                  <span className="text-xs text-muted-foreground/60">1:1</span>
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
