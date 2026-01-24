import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HeroSlide {
  id: string;
  image_url: string;
  orden: number;
  activo: boolean;
}

export const useHeroSlides = () => {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_slides')
        .select('*')
        .order('orden', { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (err) {
      console.error('Error fetching hero slides:', err);
      setError('Error al cargar slides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const addSlide = async (imageUrl: string): Promise<boolean> => {
    try {
      const maxOrden = slides.length > 0 ? Math.max(...slides.map(s => s.orden)) + 1 : 0;
      
      const { error } = await supabase
        .from('hero_slides')
        .insert({ image_url: imageUrl, orden: maxOrden });

      if (error) throw error;
      await fetchSlides();
      return true;
    } catch (err) {
      console.error('Error adding slide:', err);
      return false;
    }
  };

  const deleteSlide = async (id: string, imageUrl: string): Promise<boolean> => {
    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('hero_slides')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Delete from storage
      const urlParts = imageUrl.split('/hero-slides/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('hero-slides').remove([filePath]);
      }

      await fetchSlides();
      return true;
    } catch (err) {
      console.error('Error deleting slide:', err);
      return false;
    }
  };

  const reorderSlides = async (newOrder: HeroSlide[]): Promise<boolean> => {
    try {
      const updates = newOrder.map((slide, index) => ({
        id: slide.id,
        image_url: slide.image_url,
        orden: index,
        activo: slide.activo,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('hero_slides')
          .update({ orden: update.orden })
          .eq('id', update.id);
        if (error) throw error;
      }

      await fetchSlides();
      return true;
    } catch (err) {
      console.error('Error reordering slides:', err);
      return false;
    }
  };

  // Get only active slides for public display
  const activeSlides = slides.filter(s => s.activo);

  return {
    slides,
    activeSlides,
    loading,
    error,
    addSlide,
    deleteSlide,
    reorderSlides,
    refetch: fetchSlides,
    canAddMore: slides.length < 5,
    canDelete: slides.length > 1,
  };
};
