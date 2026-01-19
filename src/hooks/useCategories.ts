import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Category {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  icono: string;
  orden: number;
  activo: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface CategoryInsert {
  nombre: string;
  slug: string;
  descripcion?: string | null;
  icono?: string;
  orden?: number;
  activo?: boolean;
}

export interface CategoryUpdate {
  nombre?: string;
  slug?: string;
  descripcion?: string | null;
  icono?: string;
  orden?: number;
  activo?: boolean;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from('categories')
      .select('*')
      .order('orden', { ascending: true });

    if (fetchError) {
      console.error('Error fetching categories:', fetchError);
      setError('Error al cargar las categorías');
      toast.error('Error al cargar las categorías');
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const createCategory = async (category: CategoryInsert): Promise<Category | null> => {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      toast.error('Error al crear la categoría');
      return null;
    }

    toast.success('Categoría creada');
    await fetchCategories();
    return data;
  };

  const updateCategory = async (id: string, updates: CategoryUpdate): Promise<boolean> => {
    const { error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating category:', error);
      toast.error('Error al actualizar la categoría');
      return false;
    }

    toast.success('Categoría actualizada');
    await fetchCategories();
    return true;
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      toast.error('Error al eliminar la categoría');
      return false;
    }

    toast.success('Categoría eliminada');
    await fetchCategories();
    return true;
  };

  const updateCategoryOrder = async (orderedIds: string[]): Promise<boolean> => {
    try {
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await supabase
          .from('categories')
          .update({ orden: i + 1 })
          .eq('id', orderedIds[i]);

        if (error) throw error;
      }

      toast.success('Orden actualizado');
      await fetchCategories();
      return true;
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error al actualizar el orden');
      return false;
    }
  };

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    updateCategoryOrder,
  };
};
