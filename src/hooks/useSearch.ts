import { useState, useMemo, useCallback } from 'react';
import { MenuItem, MenuCategory } from '@/types/menu';

export const useSearch = (items: MenuItem[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>('todos');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const filteredItems = useMemo(() => {
    let filtered = items;

    // Filter by category
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(item => item.categoria === selectedCategory);
    }

    // Filter by search query (name or description/ingredients)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.nombre.toLowerCase().includes(query) ||
        item.descripcion_corta.toLowerCase().includes(query)
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
  }, [items, searchQuery, selectedCategory, selectedTags]);

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
