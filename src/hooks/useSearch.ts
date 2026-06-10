import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { MenuItem, MenuCategory } from '@/types/menu';
import { trackSearch } from '@/lib/metaPixel';

export const useSearch = (items: MenuItem[], bestSellers: MenuItem[] = []) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('todos');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // [2026-06-10] Pixel Search: debounce 800ms + mínimo 3 chars (la
  // validación de longitud también vive dentro de trackSearch).
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    const q = searchQuery.trim();
    if (q.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        trackSearch(q);
      }, 800);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const filteredItems = useMemo(() => {
    // For best-seller category, use the bestSellers array directly
    if (selectedCategory === 'best-seller') {
      let filtered = bestSellers;
      
      // Apply search filter if present
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(item =>
          item.nombre.toLowerCase().includes(query) ||
          item.descripcion_corta.toLowerCase().includes(query) ||
          item.categoria.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    }

    let filtered = items;

    // Filter by category
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(item => item.categoria === selectedCategory);
    }

    // Filter by search query (name or description/ingredients or category)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.nombre.toLowerCase().includes(query) ||
        item.descripcion_corta.toLowerCase().includes(query) ||
        item.categoria.toLowerCase().includes(query)
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item =>
        selectedTags.some(tag => item.tags.includes(tag))
      );
    }

    // Sort by orden
    return filtered.sort((a, b) => a.orden - b.orden);
  }, [items, bestSellers, searchQuery, selectedCategory, selectedTags]);

  const handleCategoryChange = useCallback((category: MenuCategory) => {
    setSelectedCategory(category);
    // Analytics event
    window.dispatchEvent(new CustomEvent('analytics', {
      detail: { event: 'click_tab_categoria', category }
    }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('todos');
    setSelectedTags([]);
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory: handleCategoryChange,
    selectedTags,
    toggleTag,
    filteredItems,
    clearFilters,
    hasFilters: searchQuery.trim() !== '' || selectedCategory !== 'todos' || selectedTags.length > 0,
  };
};
