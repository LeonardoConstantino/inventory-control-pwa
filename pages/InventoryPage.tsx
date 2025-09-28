import React, { useState, useCallback } from 'react';
import { FileText, Add } from '../components/Icons';
import EmptyState from '../components/EmptyState';
import ItemCard from '../components/ItemCard';
import useInventoryFilters from '../hooks/useInventoryFilters';
import SearchAndFiltersBar from '../components/SearchAndFiltersBar';
import { Item, Page, Location } from '../types';

interface InventoryPageProps {
  items: Item[];
  onNavigate: (page: Page, context?: any) => void;
  getLocation: (id: string) => {
    success: boolean;
    location?: Location;
    error?: string;
  };
}

const ItemSkeleton = React.memo(() => (
  <li className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4 animate-pulse">
    <div className="w-16 h-16 bg-gray-200 dark:bg-gray-600 rounded-md"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
    </div>
    <div className="text-right space-y-1">
      <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-8"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
    </div>
  </li>
));

ItemSkeleton.displayName = 'ItemSkeleton';

const InventoryPage: React.FC<InventoryPageProps> = ({
  items,
  onNavigate,
  getLocation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Hook customizado integrado para todos os filtros
  const { filteredAndSortedItems, categories, isProcessing } =
    useInventoryFilters(items, searchTerm, sortBy, categoryFilter, getLocation);

  // Handlers memoizados
  const handleItemClick = useCallback(
    (itemId) => {
      onNavigate(Page.ITEM_DETAIL, { itemId });
    },
    [onNavigate]
  );

  const handleAddClick = useCallback(() => {
    onNavigate(Page.ITEM_FORM, { isEditing: false });
  }, [onNavigate]);

  return (
    <div className="p-4 pb-20">
      <SearchAndFiltersBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
      />

      {isProcessing ? (
        <ul className="space-y-3">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <ItemSkeleton key={`skeleton-${index}`} />
            ))}
        </ul>
      ) : filteredAndSortedItems.length > 0 ? (
        <ul className="space-y-3">
          {filteredAndSortedItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<FileText className="h-16 w-16 text-gray-400" />}
          title="Nenhum item encontrado"
          message={
            searchTerm || categoryFilter !== 'all'
              ? 'Tente ajustar os filtros de busca.'
              : 'Comece adicionando um novo item.'
          }
        />
      )}

      <button
        onClick={handleAddClick}
        className="fixed bottom-20 right-4 bg-primary text-white rounded-full p-4 shadow-lg opacity-60 hover:opacity-100 hover:bg-secondary transition-transform transform hover:scale-110"
        aria-label="Adicionar novo item"
      >
        <Add className="h-8 w-8 hover:rotate-90 transition-transform duration-200" />
      </button>
    </div>
  );
};

export default InventoryPage;
