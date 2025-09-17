import React, { useState, useMemo, useCallback, useDeferredValue } from 'react';
import { Item, Page } from '../types';

interface InventoryPageProps {
  items: Item[];
  onNavigate: (page: Page, context?: any) => void;
}

// Hook customizado para busca com debounce usando useDeferredValue
const useInventorySearch = (items: Item[], searchTerm: string) => {
  // useDeferredValue adia atualizações não-urgentes, melhorando responsividade
  const deferredSearchTerm = useDeferredValue(searchTerm);
  
  // Pré-processa itens uma única vez quando a lista muda
  const processedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      searchableText: `${item.name} ${item.description}`.toLowerCase()
    }));
  }, [items]);

  // Filtra usando texto pré-processado para evitar toLowerCase() repetitivo  
  const filteredItems = useMemo(() => {
    if (!deferredSearchTerm.trim()) return processedItems;
    
    const searchLower = deferredSearchTerm.toLowerCase();
    return processedItems
      .filter(item => item.searchableText.includes(searchLower))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [processedItems, deferredSearchTerm]);

  return { filteredItems, isSearching: deferredSearchTerm !== searchTerm };
};

// Componente ItemCard otimizado com React.memo para evitar re-renders desnecessários
const ItemCard = React.memo<{ item: Item; onClick: () => void }>(({ item, onClick }) => {
  // Cache do cálculo de estoque baixo
  const isLowStock = useMemo(() => item.quantity <= item.minStock, [item.quantity, item.minStock]);
  
  // Handler de erro para imagens com lazy loading
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = 'none';
  }, []);

  return (
    <li
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow dark:border dark:border-gray-700"
    >
      {item.photo && (
        <img 
          src={item.photo} 
          alt={item.name} 
          className="w-16 h-16 object-cover rounded-md bg-gray-200 dark:bg-gray-600" 
          loading="lazy" // Lazy loading nativo para melhor performance
          onError={handleImageError}
        />
      )}
      <div className="flex-1">
        <h3 className="font-bold text-gray-800 dark:text-gray-100">{item.name}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{item.quantity}</p>
        <p className={`text-xs font-semibold ${isLowStock ? 'text-red-500 animate-pulse' : 'text-gray-400 dark:text-gray-500'}`}>
          {isLowStock ? `Estoque Baixo (Mín: ${item.minStock})` : `Mín: ${item.minStock}`}
        </p>
      </div>
    </li>
  );
});

ItemCard.displayName = 'ItemCard';

// Componente de loading skeleton para melhor UX
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

const InventoryPage: React.FC<InventoryPageProps> = ({ items, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Usa hook customizado para busca otimizada
  const { filteredItems, isSearching } = useInventorySearch(items, searchTerm);

  // Memoiza handler de navegação para evitar re-renders do ItemCard
  const handleItemClick = useCallback((itemId: string) => {
    onNavigate(Page.ITEM_DETAIL, { itemId });
  }, [onNavigate]);

  // Memoiza handler do botão adicionar
  const handleAddClick = useCallback(() => {
    onNavigate(Page.ITEM_FORM, { isEditing: false });
  }, [onNavigate]);

  return (
    <div className="p-4 pb-20">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar itens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* Mostra skeleton durante busca para melhor UX */}
      {isSearching ? (
        <ul className="space-y-3">
          {Array(3).fill(0).map((_, index) => (
            <ItemSkeleton key={`skeleton-${index}`} />
          ))}
        </ul>
      ) : filteredItems.length > 0 ? (
        <ul className="space-y-3">
          {filteredItems.map(item => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onClick={() => handleItemClick(item.id)} 
            />
          ))}
        </ul>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium">Nenhum item encontrado</h3>
          <p className="mt-1 text-sm">
            {searchTerm ? 'Tente buscar com outros termos.' : 'Comece adicionando um novo item.'}
          </p>
        </div>
      )}

      <button
        onClick={handleAddClick}
        className="fixed bottom-20 right-4 bg-primary text-white rounded-full p-4 shadow-lg hover:bg-secondary transition-transform transform hover:scale-110"
        aria-label="Adicionar novo item"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};

export default InventoryPage;