import React, { useState, useEffect } from 'react';
import { Item, Page } from '../types';
import CameraCapture from '../components/CameraCapture';

interface ItemFormPageProps {
  itemToEdit?: Item | null;
  onSave: (item: Item) => void;
  onDelete?: (itemId: string) => void;
  onCancel: () => void;
  defaultMinStock: number;
  isPriceEnabled: boolean;
}

const ItemFormPage: React.FC<ItemFormPageProps> = ({ itemToEdit, onSave, onDelete, onCancel, defaultMinStock, isPriceEnabled }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minStock, setMinStock] = useState(String(defaultMinStock || '1'));
  const [price, setPrice] = useState('0');
  const [initialQuantity, setInitialQuantity] = useState('0');
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState('');

  const isEditing = !!itemToEdit;

  useEffect(() => {
    if (isEditing && itemToEdit) {
      setName(itemToEdit.name);
      setDescription(itemToEdit.description);
      setMinStock(String(itemToEdit.minStock));
      setPrice(String(itemToEdit.price || '0'));
      setPhoto(itemToEdit.photo);
    } else {
      setMinStock(String(defaultMinStock || '1'));
    }
  }, [isEditing, itemToEdit, defaultMinStock]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !minStock || (isPriceEnabled && !price)) {
      setError('Por favor, preencha todos os campos obrigatórios e tire uma foto.');
      return;
    }
    const newItem: Item = {
      id: isEditing ? itemToEdit.id : Date.now().toString(36) + Math.random().toString(36).substr(2),
      name,
      description,
      photo,
      minStock: parseInt(minStock, 10) || 0,
      price: isPriceEnabled ? parseFloat(price) || 0 : 0,
      quantity: isEditing ? itemToEdit.quantity : parseInt(initialQuantity, 10) || 0,
      createdAt: isEditing ? itemToEdit.createdAt : Date.now(),
    };
    onSave(newItem);
  };

  const handleDelete = () => {
    if (isEditing && itemToEdit && onDelete && window.confirm(`Tem certeza que deseja excluir ${itemToEdit.name}? Esta ação não pode ser desfeita.`)) {
      onDelete(itemToEdit.id);
    }
  }

  return (
    <div className="p-4 pb-20">
      <form onSubmit={handleSubmit} className="space-y-6">
        <CameraCapture onCapture={setPhoto} initialImage={photo} />

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome do Item</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descrição</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {isPriceEnabled && (
           <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preço (R$)</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Ex: 25.50"
            />
          </div>
        )}
       
        {!isEditing && (
            <div>
              <label htmlFor="initialQuantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade Inicial</label>
              <input
                type="number"
                id="initialQuantity"
                value={initialQuantity}
                onChange={(e) => setInitialQuantity(e.target.value)}
                min="0"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
        )}

        <div>
          <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estoque Mínimo</label>
          <input
            type="number"
            id="minStock"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            min="0"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col space-y-3">
            <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold shadow-md hover:bg-secondary transition-colors">
              {isEditing ? 'Salvar Alterações' : 'Adicionar Item'}
            </button>
             <button type="button" onClick={onCancel} className="w-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
              Cancelar
            </button>
            {isEditing && onDelete && (
                <button type="button" onClick={handleDelete} className="w-full bg-error text-white py-3 rounded-lg font-semibold shadow-md hover:bg-red-700 transition-colors">
                    Excluir Item
                </button>
            )}
        </div>
      </form>
    </div>
  );
};

export default ItemFormPage;