import React, { useMemo, useCallback } from 'react';
import { Item } from '../types';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

// Função para gerar cor única baseada na categoria
const getCategoryColor = (category: string) => {
  const colors = [
    { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-800 dark:text-blue-200' },
    { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' },
    { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200' },
    { bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-800 dark:text-pink-200' },
    { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' },
    { bg: 'bg-indigo-100 dark:bg-indigo-900', text: 'text-indigo-800 dark:text-indigo-200' },
    { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' },
    { bg: 'bg-teal-100 dark:bg-teal-900', text: 'text-teal-800 dark:text-teal-200' },
    { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-800 dark:text-orange-200' },
    { bg: 'bg-cyan-100 dark:bg-cyan-900', text: 'text-cyan-800 dark:text-cyan-200' }
  ];
  
  // Hash simples para garantir cor consistente por categoria
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash + category.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
};

// Componente de badge para categorias - reutilizável e performático
const CategoryBadge: React.FC<{ category: string }> = React.memo(({ category }) => {
  const colors = getCategoryColor(category);
  return (
    <span className={`inline-block ${colors.bg} ${colors.text} text-xs px-2 py-1 rounded-full font-medium mr-1 mb-1`}>
      {category}
    </span>
  );
});

const ItemCard = React.memo<ItemCardProps>(({ item, onClick }) => {
  // Cache do cálculo de estoque baixo
  const isLowStock = useMemo(
    () => item.quantity <= item.minStock,
    [item.quantity, item.minStock]
  );

  // Cache das categorias filtradas e limitadas
  const displayCategories = useMemo(() => {
    if (!item.category || item.category.length === 0) return [];
    
    // Limita a 3 categorias para manter layout compacto
    const categories = item.category.slice(0, 3);
    return categories;
  }, [item.category]);

  // Verifica se há categorias excedentes
  const hasMoreCategories = useMemo(
    () => item.category && item.category.length > 3,
    [item.category]
  );

  // Handler de erro para imagens com lazy loading
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      e.currentTarget.style.display = 'none';
    },
    []
  );

  return (
    <li
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow dark:border dark:border-gray-700"
    >
      {/* Imagem do produto */}
      {item.photo && (
        <img
          src={item.photo}
          alt={item.name}
          className="w-16 h-16 object-cover rounded-md bg-gray-200 dark:bg-gray-600 flex-shrink-0"
          loading="lazy"
          onError={handleImageError}
          draggable="false"
        />
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 truncate">
          {item.name}
        </h3>
        
        {/* Descrição */}
        {item.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-1">
            {item.description}
          </p>
        )}
        
        {/* Categorias - visualização compacta */}
        {displayCategories.length > 0 && (
          <div className="flex flex-wrap items-center mt-2">
            {displayCategories.map((category, index) => (
              <CategoryBadge key={`${category}-${index}`} category={category} />
            ))}
            {hasMoreCategories && (
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                +{item.category!.length - 3} mais
              </span>
            )}
          </div>
        )}
      </div>

      {/* Informações de estoque */}
      <div className="text-right flex-shrink-0">
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
          {item.quantity}
        </p>
        <p
          className={`text-xs font-semibold ${
            isLowStock
              ? 'text-red-500 animate-pulse'
              : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {isLowStock
            ? `Estoque Baixo (Mín: ${item.minStock})`
            : `Mín: ${item.minStock}`}
        </p>
      </div>
    </li>
  );
});

// Adiciona displayName para facilitar debugging
ItemCard.displayName = 'ItemCard';
CategoryBadge.displayName = 'CategoryBadge';

export default ItemCard;