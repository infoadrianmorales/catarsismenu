import { useMemo, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface HeroSlide {
  id: string;
  image_url: string;
  orden: number;
  activo: boolean;
}

// Fetch hero slides from Supabase
const fetchHeroSlides = async (): Promise<HeroSlide[]> => {
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('orden', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const useHeroSlides = () => {
  const queryClient = useQueryClient();

  const { data: slides = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ['hero-slides'],
    queryFn: fetchHeroSlides,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const addSlide = useCallback(async (imageUrl: string): Promise<boolean> => {
    try {
      const maxOrden = slides.length > 0 ? Math.max(...slides.map(s => s.orden)) + 1 : 0;
      
      const { error } = await supabase
        .from('hero_slides')
        .insert({ image_url: imageUrl, orden: maxOrden });

      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      return true;
    } catch (err) {
      console.error('Error adding slide:', err);
      return false;
    }
  }, [slides, queryClient]);

  const deleteSlide = useCallback(async (id: string, imageUrl: string): Promise<boolean> => {
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

      await queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      return true;
    } catch (err) {
      console.error('Error deleting slide:', err);
      return false;
    }
  }, [queryClient]);

  const reorderSlides = useCallback(async (newOrder: HeroSlide[]): Promise<boolean> => {
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

      await queryClient.invalidateQueries({ queryKey: ['hero-slides'] });
      return true;
    } catch (err) {
      console.error('Error reordering slides:', err);
      return false;
    }
  }, [queryClient]);

  // Get only active slides for public display - memoized
  const activeSlides = useMemo(() => slides.filter(s => s.activo), [slides]);

  return {
    slides,
    activeSlides,
    loading,
    error: error?.message || null,
    addSlide,
    deleteSlide,
    reorderSlides,
    refetch,
    canAddMore: slides.length < 5,
    canDelete: slides.length > 1,
  };
};
