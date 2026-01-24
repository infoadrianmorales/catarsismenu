import { useState, useRef } from 'react';
import { Upload, Trash2, AlertCircle, Image, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useHeroSlides } from '@/hooks/useHeroSlides';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const RECOMMENDED_WIDTH = 1920;
const RECOMMENDED_HEIGHT = 1080;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const HeroSlidesPanel = () => {
  const { slides, loading, addSlide, deleteSlide, canAddMore, canDelete } = useHeroSlides();
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Formato no válido. Usa JPG, PNG o WebP.');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`La imagen es muy pesada. Máximo ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
      return;
    }

    // Validate dimensions
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    
    await new Promise<void>((resolve) => {
      img.onload = () => {
        if (img.width !== RECOMMENDED_WIDTH || img.height !== RECOMMENDED_HEIGHT) {
          toast.warning(`Dimensiones: ${img.width}x${img.height}. Recomendado: ${RECOMMENDED_WIDTH}x${RECOMMENDED_HEIGHT}`);
        }
        resolve();
      };
      img.onerror = () => resolve();
    });

    setUploading(true);

    try {
      const fileName = `slide-${Date.now()}.${file.type.split('/')[1]}`;
      
      const { data, error: uploadError } = await supabase.storage
        .from('hero-slides')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('hero-slides')
        .getPublicUrl(data.path);

      const success = await addSlide(urlData.publicUrl);
      
      if (success) {
        toast.success('Slide agregado correctamente');
      } else {
        toast.error('Error al guardar el slide');
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!canDelete) {
      toast.error('Debe haber al menos 1 slide');
      return;
    }

    setDeletingId(id);
    const success = await deleteSlide(id, imageUrl);
    
    if (success) {
      toast.success('Slide eliminado');
    } else {
      toast.error('Error al eliminar');
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Slides del Banner Principal
          </CardTitle>
          <CardDescription>
            Gestiona las imágenes del carrusel en la página principal. Mínimo 1, máximo 5 slides.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info box */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Especificaciones:</strong>
              <ul className="list-disc list-inside mt-1 text-sm">
                <li>Dimensiones: <strong>{RECOMMENDED_WIDTH}x{RECOMMENDED_HEIGHT}px</strong> (16:9)</li>
                <li>Tamaño máximo: <strong>{MAX_FILE_SIZE / (1024 * 1024)}MB</strong></li>
                <li>Formatos: JPG, PNG, WebP</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Upload button */}
          {canAddMore ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full sm:w-auto gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Agregar Slide ({slides.length}/5)
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Has alcanzado el límite de 5 slides. Elimina uno para agregar otro.
              </AlertDescription>
            </Alert>
          )}

          {/* Slides grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="aspect-video rounded-lg" />
              ))}
            </div>
          ) : slides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay slides. Agrega el primero.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {slides.map((slide, index) => (
                <div 
                  key={slide.id} 
                  className="relative group rounded-lg overflow-hidden border border-border bg-muted"
                >
                  <div className="aspect-video">
                    <img
                      src={slide.image_url}
                      alt={`Slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Overlay with delete button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(slide.id, slide.image_url)}
                      disabled={deletingId === slide.id || !canDelete}
                      className="gap-2"
                    >
                      {deletingId === slide.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Eliminar
                    </Button>
                  </div>

                  {/* Order badge */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!canDelete && slides.length === 1 && (
            <p className="text-sm text-muted-foreground text-center">
              No puedes eliminar el último slide. Debe haber al menos 1.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
