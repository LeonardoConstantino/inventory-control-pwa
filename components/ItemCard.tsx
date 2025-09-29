import React, { useMemo, useCallback, useState } from 'react';
import CategoryBadge from './CategoryBadge';
import { Item } from '../types';
import { AlertTriangle } from './Icons';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
}

const ItemCard = React.memo<ItemCardProps>(({ item, onClick }) => {
  const isLowStock = useMemo(
    () => item.minStock > 0 && item.quantity <= item.minStock,
    [item.quantity, item.minStock]
  );
  const displayCategories = useMemo(
    () => item.category?.slice(0, 3) || [],
    [item.category]
  );
  const hasMoreCategories = useMemo(
    () => (item.category?.length || 0) > 3,
    [item.category]
  );

  const [imageError, setImageError] = useState(false);
  const handleImageError = useCallback(() => setImageError(true), []);

  return (
    <li
      onClick={onClick}
      // 1. Coesão & 3. Microinterações
      className="bg-base dark:bg-neutral-800-dark p-4 rounded-lg shadow-card flex items-center space-x-4 cursor-pointer 
                 transition-all duration-200 ease-in-out 
                 hover:shadow-card-hover hover:scale-[1.02] active:scale-[0.98] active:shadow-sm
                 dark:border dark:border-neutral-700-dark"
    >
      {/* Imagem do produto ou placeholder */}
      {item.photo && !imageError && (
        <div className="w-16 h-16 object-cover rounded-md bg-neutral-100 dark:bg-neutral-700-dark flex-shrink-0 flex items-center justify-center">
          <img
            src={item.photo}
            alt={item.name}
            className="w-full h-full object-cover rounded-md"
            loading="lazy"
            onError={handleImageError}
            draggable="false"
          />
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 min-w-0">
        {/* 2. Hierarquia Visual */}
        <h3 className="font-semibold text-neutral-600 dark:text-neutral-300-dark truncate">
          {item.name}
        </h3>

        {item.description && (
          <p className="text-sm text-neutral-500 line-clamp-1 mb-1">
            {item.description}
          </p>
        )}

        {displayCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {displayCategories.map((category) => (
              <CategoryBadge key={category} category={category} />
            ))}
            {hasMoreCategories && (
              <span className="text-xs text-neutral-500 font-medium ml-1">
                +{(item.category?.length || 0) - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Informações de estoque */}
      <div className="text-right flex-shrink-0 w-24">
        <p className="text-2xl font-bold text-neutral-600 dark:text-neutral-300-dark">
          {item.quantity}
        </p>
        <div
          className={`text-xs font-semibold flex items-center justify-end gap-1 ${
            isLowStock
              ? 'text-error animate-pulse'
              : 'text-neutral-400 dark:text-neutral-500'
          }`}
        >
          {isLowStock && <AlertTriangle className="h-3 w-3" />}
          <p>{isLowStock ? `Baixo` : `Mín: ${item.minStock}`}</p>
        </div>
      </div>
    </li>
  );
});

ItemCard.displayName = 'ItemCard';

export default ItemCard;
