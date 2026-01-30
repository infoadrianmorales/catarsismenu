import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { MenuCategory } from '@/types/menu';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: MenuCategory;
  onCategoryChange: (category: MenuCategory) => void;
}

export const SearchAndFilter = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange
}: SearchAndFilterProps) => {
  return (
    <>
      <SearchBar value={searchQuery} onChange={onSearchChange} />
      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onCategoryChange={onCategoryChange} 
      />
    </>
  );
};
