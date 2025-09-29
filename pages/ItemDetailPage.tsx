import React, { useState, useEffect } from 'react';
import { Item, Page, MovementType } from '../types';
import CategoryBadge from '../components/CategoryBadge'
import EmptyState from '../components/EmptyState';
import {
  NoPhoto,
  EditIcon,
  LocationIcon,
  AlertTriangle,
} from '../components/Icons';
import Modal from '../components/Modal';

interface ItemDetailPageProps {
  item: Item;
  onNavigate: (page: Page, context?: any) => void;
  onUpdateStock: (
    itemId: string,
    quantityChange: number,
    type: MovementType
  ) => void;
  onDeleteItem: (itemId: string) => void;
  isPriceEnabled: boolean;
  getLocationPath: (id: string) => {
    success: boolean;
    path?: { name: string }[];
  };
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
        <label
          htmlFor="quantity"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Quantidade para{' '}
          {type === MovementType.ENTRY ? 'Adicionar' : 'Remover'}
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
        {type === MovementType.EXIT && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Disponível: {item.quantity}
          </p>
        )}
      </div>
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className={`px-4 py-2 rounded-lg text-white ${
            type === MovementType.ENTRY
              ? 'bg-success hover:bg-green-700'
              : 'bg-warning hover:bg-amber-500'
          }`}
        >
          Confirmar
        </button>
      </div>
    </form>
  );
};

const ItemDetailPage: React.FC<ItemDetailPageProps> = ({
  item,
  onNavigate,
  onUpdateStock,
  isPriceEnabled,
  getLocationPath,
}) => {
  const [modalType, setModalType] = useState<MovementType | null>(null);
  const [locationPath, setLocationPath] = useState<string | null>(null);

  if (!item) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Item não encontrado. Pode ter sido excluído.
      </div>
    );
  }

  useEffect(() => {
    if (item.locationId) {
      const result = getLocationPath(item.locationId);
      const lastPath = result.path?.at(-1) || null;
      
      if (result.success && result.path) {
        const breadcrumb = `${result.path.map((p: { name: string }) => p.name).join(' > ')}${lastPath?.metadata?.shortId ? ' > 🏷️' + lastPath.metadata.shortId : ''}`;
        setLocationPath(breadcrumb);
      } else {
        setLocationPath('Localização não encontrada');
      }
    } else {
      setLocationPath(null); // Limpa o caminho se não houver locationId
    }
  }, [item.locationId, getLocationPath]);

  const handleStockUpdate = (quantity: number) => {
    if (modalType) {
      onUpdateStock(item.id, quantity, modalType);
    }
    setModalType(null);
  };

  const isLowStock = item.quantity <= item.minStock;

  return (
    <div className="pb-20">
      {/* Imagem do item ou placeholder */}
      {item.photo ? (
        <img
          src={item.photo}
          alt={item.name}
          className="w-full h-64 object-cover bg-gray-200 dark:bg-gray-700"
          draggable="false"
        />
      ) : (
        <EmptyState
          icon={<NoPhoto className="h-16 w-16 text-gray-400" />}
          title={"Item sem Foto"}
          message={"Clique em editar para adicionar uma"}
        />
        // <div className="text-gray-500 dark:text-gray-400 flex flex-col items-center">
        //   <NoPhoto className="w-16 h-16 mt-8" />
        //   <span className="mt-2">Item sem Foto</span>
        // </div>
      )}

      {/* Detalhes do item */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            {item.name}
          </h1>
          <button
            onClick={() =>
              onNavigate(Page.ITEM_FORM, { isEditing: true, itemId: item.id })
            }
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2"
          >
            <EditIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Descrição */}
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {item.description}
        </p>

        {/* Seção de Categorias - Nova adição */}
        {item.category && item.category.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Categorias
            </h3>
            <div className="flex flex-wrap">
              {item.category.map((category, index) => (
                <CategoryBadge
                  key={`${category}-${index}`}
                  category={category}
                />
              ))}
            </div>
          </div>
        )}

        {/* Seção de Localização */}
        {locationPath && (
          <div className="flex items-start justify-between gap-3 mt-4 p-3 bg-neutral/30 dark:bg-gray-800/50 rounded-lg border border-neutral/40 dark:border-gray-700/50">
            <div className="flex items-center gap-2 flex-shrink-0">
              <LocationIcon className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Localização:
              </span>
            </div>
            <div className="text-right min-w-0 flex-1">
              {locationPath === 'Localização não encontrada' ? (
                <span className="text-sm font-medium text-error dark:text-error flex items-center gap-1 justify-end">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-warning/70" />
                  <span className="truncate" title={locationPath}>
                    {locationPath}
                  </span>
                </span>
              ) : (
                <span
                  className="text-sm font-medium text-gray-800 dark:text-gray-200 block truncate"
                  title={locationPath}
                >
                  {locationPath}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md divide-y divide-gray-200 dark:divide-gray-700">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Detalhes do Estoque
          </h2>
          {isPriceEnabled && (
            <>
              <div className="py-2 flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Valor Unitário:
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {(item.price || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
              <div className="py-2 flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Valor em Estoque:
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-100">
                  {((item.price || 0) * item.quantity).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
            </>
          )}
          <div className="pt-2 flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">
              Estoque Atual:
            </span>
            <span className="text-4xl font-extrabold text-primary dark:text-accent">
              {item.quantity}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-400">
              Estoque Mínimo:
            </span>
            <span
              className={`font-semibold ${
                isLowStock ? 'text-red-500' : 'text-gray-800 dark:text-gray-100'
              }`}
            >
              {item.minStock}
            </span>
          </div>
          {isLowStock && (
            <p className="text-center mt-3 p-2 bg-red-100 text-red-700 rounded-md text-sm font-semibold dark:bg-red-900 dark:text-red-200">
              Atenção: Nível de estoque baixo.
            </p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button
            onClick={() => setModalType(MovementType.ENTRY)}
            className="bg-success text-white py-3 rounded-lg font-semibold shadow hover:bg-green-700 transition-colors"
          >
            Adicionar (Entrada)
          </button>
          <button
            onClick={() => setModalType(MovementType.EXIT)}
            className="bg-warning text-white py-3 rounded-lg font-semibold shadow hover:bg-amber-500 transition-colors"
            disabled={item.quantity === 0}
          >
            Remover (Saída)
          </button>
        </div>
      </div>

      <Modal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={
          modalType === MovementType.ENTRY
            ? 'Entrada de Estoque'
            : 'Saída de Estoque'
        }
      >
        {modalType && (
          <StockMovementModal
            item={item}
            type={modalType}
            onClose={() => setModalType(null)}
            onConfirm={handleStockUpdate}
          />
        )}
      </Modal>
    </div>
  );
};

export default ItemDetailPage;
