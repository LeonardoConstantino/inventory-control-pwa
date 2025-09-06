import React, { useState } from 'react';
import { Item, Page, Movement, MovementType } from '../types';
import Modal from '../components/Modal';

interface ItemDetailPageProps {
  item: Item;
  onNavigate: (page: Page, context?: any) => void;
  onUpdateStock: (itemId: string, quantityChange: number, type: MovementType) => void;
  onDeleteItem: (itemId: string) => void;
  isPriceEnabled: boolean;
}

const StockMovementModal: React.FC<{
  item: Item;
  type: MovementType;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
}> = ({ item, type, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState('');
  const maxQuantity = type === MovementType.EXIT ? item.quantity : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numQuantity = parseInt(quantity, 10);
    if (numQuantity > 0) {
      onConfirm(numQuantity);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Quantidade para {type === MovementType.ENTRY ? 'Adicionar' : 'Remover'}
        </label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          max={maxQuantity}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
          autoFocus
        />
        {type === MovementType.EXIT && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Disponível: {item.quantity}</p>}
      </div>
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500">Cancelar</button>
        <button type="submit" className={`px-4 py-2 rounded-lg text-white ${type === MovementType.ENTRY ? 'bg-success hover:bg-green-700' : 'bg-warning hover:bg-amber-500'}`}>
          Confirmar
        </button>
      </div>
    </form>
  );
};

const ItemDetailPage: React.FC<ItemDetailPageProps> = ({ item, onNavigate, onUpdateStock, onDeleteItem, isPriceEnabled }) => {
  const [modalType, setModalType] = useState<MovementType | null>(null);

  if (!item) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Item não encontrado. Pode ter sido excluído.
      </div>
    );
  }

  const handleStockUpdate = (quantity: number) => {
    if (modalType) {
      onUpdateStock(item.id, quantity, modalType);
    }
    setModalType(null);
  };

  const isLowStock = item.quantity <= item.minStock;

  return (
    <div className="pb-20">
      {item.photo ? (
        <img src={item.photo} alt={item.name} className="w-full h-64 object-cover bg-gray-200 dark:bg-gray-700" />
      ) :
        (
          <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center">
            <svg className="h-12 w-12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#ddd" stroke="#ddd"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M7.828 5l-1-1H22v15.172l-1-1v-.69l-3.116-3.117-.395.296-.714-.714.854-.64a.503.503 0 0 1 .657.046L21 16.067V5zM3 20v-.519l2.947-2.947a1.506 1.506 0 0 0 .677.163 1.403 1.403 0 0 0 .997-.415l2.916-2.916-.706-.707-2.916 2.916a.474.474 0 0 1-.678-.048.503.503 0 0 0-.704.007L3 18.067V5.828l-1-1V21h16.172l-1-1zM17 8.5A1.5 1.5 0 1 1 15.5 7 1.5 1.5 0 0 1 17 8.5zm-1 0a.5.5 0 1 0-.5.5.5.5 0 0 0 .5-.5zm5.646 13.854l.707-.707-20-20-.707.707z"></path><path fill="none" d="M0 0h24v24H0z"></path></g></svg>
            <span className="mt-2">Item sem Foto</span>
          </div>
        )
      }

      <div className="p-4">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">{item.name}</h1>
          <button onClick={() => onNavigate(Page.ITEM_FORM, { isEditing: true, itemId: item.id })} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>
          </button>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{item.description}</p>

        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md divide-y divide-gray-200 dark:divide-gray-700">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">Detalhes do Estoque</h2>
          {isPriceEnabled && (
            <>
              <div className="py-2 flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Valor Unitário:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {(item.price || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Valor em Estoque:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {((item.price || 0) * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </>
          )}
          <div className="pt-2 flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Estoque Atual:</span>
            <span className="text-4xl font-extrabold text-primary dark:text-accent">{item.quantity}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">Estoque Mínimo:</span>
            <span className={`font-semibold ${isLowStock ? 'text-red-500' : 'text-gray-800 dark:text-gray-100'}`}>{item.minStock}</span>
          </div>
          {isLowStock && <p className="text-center mt-3 p-2 bg-red-100 text-red-700 rounded-md text-sm font-semibold dark:bg-red-900 dark:text-red-200">Atenção: Nível de estoque baixo.</p>}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button onClick={() => setModalType(MovementType.ENTRY)} className="bg-success text-white py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition-colors">
            Adicionar (Entrada)
          </button>
          <button onClick={() => setModalType(MovementType.EXIT)} className="bg-warning text-white py-3 rounded-lg font-semibold shadow hover:bg-amber-500 transition-colors" disabled={item.quantity === 0}>
            Remover (Saída)
          </button>
        </div>
      </div>

      <Modal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={modalType === MovementType.ENTRY ? 'Entrada de Estoque' : 'Saída de Estoque'}
      >
        {modalType && <StockMovementModal item={item} type={modalType} onClose={() => setModalType(null)} onConfirm={handleStockUpdate} />}
      </Modal>

    </div>
  );
};

export default ItemDetailPage;