import { useMemo, useDeferredValue } from 'react';
import { Item, SortOption, Location } from '../types';

// Hook customizado para busca, ordenação e filtro
const useInventoryFilters = (
  items: Item[],
  searchTerm: string,
  sortBy: SortOption,
  categoryFilter: string,
  getLocation: (id: string) => {
    success: boolean;
    location?: Location;
    error?: string;
  }
) => {
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredSortBy = useDeferredValue(sortBy);
  const deferredCategoryFilter = useDeferredValue(categoryFilter);

  // Extrai categorias únicas dos itens
  const categories = useMemo(
    () => [...new Set(items.flatMap((item) => item.category || []))].sort(),
    [items]
  );

  // Pré-processa itens uma única vez
  const processedItems = useMemo(() => {
    return items.map((item) => {
      const location = item?.locationId
      ? getLocation(item.locationId)
      : { success: false };
      return {
        ...item,
        searchableText: `${item.name} ${item.description || ''} ${
          location.success ? location.location?.name : ''
        } ${
          location.success ? location.location?.metadata?.shortId || '' : ''
        }`.toLowerCase(),
        sortDate: item.createdAt || new Date().getTime(),
      };
    });
  }, [items]);

  // Aplica filtros e ordenação
  const filteredAndSortedItems = useMemo(() => {
    let result = processedItems;

    // Filtro por busca
    if (deferredSearchTerm.trim()) {
      const searchLower = deferredSearchTerm.toLowerCase();
      result = result.filter((item) =>
        item.searchableText.includes(searchLower)
      );
    }

    // Filtro por categoria
    if (deferredCategoryFilter && deferredCategoryFilter !== 'all') {
      result = result.filter(
        (item) =>
          item?.category && item.category.includes(deferredCategoryFilter)
      );
    }

    // Ordenação
    result.sort((a, b) => {
      switch (deferredSortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'quantity':
          return (b.quantity || 0) - (a.quantity || 0); // Decrescente
        case 'recent':
          return (b.sortDate || 0) - (a.sortDate || 0); // Mais recente primeiro
        default:
          return 0;
      }
    });

    return result;
  }, [
    processedItems,
    deferredSearchTerm,
    deferredSortBy,
    deferredCategoryFilter,
  ]);

  const isProcessing =
    deferredSearchTerm !== searchTerm ||
    deferredSortBy !== sortBy ||
    deferredCategoryFilter !== categoryFilter;

  return {
    filteredAndSortedItems,
    categories,
    isProcessing,
  };
};

export default useInventoryFilters;
