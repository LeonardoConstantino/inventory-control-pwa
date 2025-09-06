import React, { useState, useMemo } from 'react';
import { Item, Page } from '../types';

interface InventoryPageProps {
  items: Item[];
  onNavigate: (page: Page, context?: any) => void;
}

const ItemCard: React.FC<{ item: Item; onClick: () => void }> = ({ item, onClick }) => {
  const isLowStock = item.quantity <= item.minStock;

  return (
    <li
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4 cursor-pointer hover:shadow-lg transition-shadow dark:border dark:border-gray-700"
    >
      {item.photo && (
        <img src={item.photo} alt={item.name} className="w-16 h-16 object-cover rounded-md bg-gray-200 dark:bg-gray-600" />
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
};

const InventoryPage: React.FC<InventoryPageProps> = ({ items, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    return items
      .filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, searchTerm]);

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

      {filteredItems.length > 0 ? (
        <ul className="space-y-3">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} onClick={() => onNavigate(Page.ITEM_DETAIL, { itemId: item.id })} />
          ))}
        </ul>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <h3 className="mt-2 text-sm font-medium">Nenhum item encontrado</h3>
          <p className="mt-1 text-sm">Comece adicionando um novo item.</p>
        </div>
      )}

      <button
        onClick={() => onNavigate(Page.ITEM_FORM, { isEditing: false })}
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