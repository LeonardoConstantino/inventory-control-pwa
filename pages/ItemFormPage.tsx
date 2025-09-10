import React, { useState, useEffect } from 'react';
import { Item, Page } from '../types';
import CameraCapture from '../components/CameraCapture';
import Modal from '../components/Modal';

interface ItemFormPageProps {
  itemToEdit?: Item | null;
  onSave: (item: Item) => void;
  onDelete?: (itemId: string) => void;
  onCancel: () => void;
  defaultMinStock: number;
  isPriceEnabled: boolean;
}

const ItemFormPage: React.FC<ItemFormPageProps> = ({
  itemToEdit,
  onSave,
  onDelete,
  onCancel,
  defaultMinStock,
  isPriceEnabled,
}) => {
  const [form, setForm] = useState(() => {
    if (itemToEdit) {
      return {
        name: itemToEdit.name,
        description: itemToEdit.description,
        minStock: itemToEdit.minStock,
        price: itemToEdit.price || 0,
        initialQuantity: itemToEdit.quantity,
        photo: itemToEdit.photo,
      };
    }
    return {
      name: '',
      description: '',
      minStock: defaultMinStock,
      price: 0,
      initialQuantity: 0,
      photo: null,
    };
  });

  const [error, setError] = useState('');

  const isEditing = Boolean(itemToEdit);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const updateField = (field: keyof typeof form, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const errors: string[] = [];

    if (!form.name) errors.push('Nome do item');
    if (!form.minStock) errors.push('Estoque mínimo');
    if (isPriceEnabled && (form.price === null || form.price === '')) {
      errors.push('Preço');
    }

    if (errors.length > 0) {
      return setError(`Preencha corretamente: ${errors.join(', ')}.`);
    }

    const newItem: Item = {
      id: isEditing ? itemToEdit!.id : crypto.randomUUID(),
      name: form.name,
      description: form.description,
      photo: form.photo,
      minStock: parseInt(form.minStock || '0', 10),
      price: isPriceEnabled ? parseFloat(form.price || '0') : 0,
      quantity: isEditing
        ? itemToEdit!.quantity
        : parseInt(form.initialQuantity || '0', 10),
      createdAt: isEditing ? itemToEdit!.createdAt : Date.now(),
    };
    onSave(newItem);
  };

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id);
    setIsConfirmOpen(true);
  };

  return (
    <div className="p-4 pb-20">
      <form onSubmit={handleSubmit} className="space-y-6">
        <CameraCapture
          onCapture={(img) => updateField('photo', img)}
          initialImage={form.photo}
        />

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Nome do Item
          </label>
          <input
            type="text"
            id="name"
            placeholder="Nome do Item"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Descrição
          </label>
          <textarea
            id="description"
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {isPriceEnabled && (
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Preço (R$)
            </label>
            <input
              type="number"
              id="price"
              placeholder="Preço (R$) Ex: 25.50"
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              min="0"
              step="0.01"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        )}

        {!isEditing && (
          <div>
            <label
              htmlFor="initialQuantity"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Quantidade Inicial
            </label>
            <input
              type="number"
              id="initialQuantity"
              placeholder="Quantidade Inicial"
              value={form.initialQuantity}
              onChange={(e) => updateField('initialQuantity', e.target.value)}
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            />
          </div>
        )}

        <div>
          <label
            htmlFor="minStock"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Estoque Mínimo
          </label>
          <input
            type="number"
            id="minStock"
            placeholder="Estoque Mínimo"
            value={form.minStock}
            onChange={(e) => updateField('minStock', e.target.value)}
            min={0}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex flex-col space-y-3">
          <button
            type="submit"
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold shadow-md hover:bg-secondary transition-colors"
          >
            {isEditing ? 'Salvar Alterações' : 'Adicionar Item'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          {isEditing && onDelete && (
            <button
              type="button"
              onClick={handleDeleteClick.bind(null, itemToEdit.id)}
              className="w-full bg-error text-white py-3 rounded-lg font-semibold shadow-md hover:bg-red-700 transition-colors"
            >
              Excluir Item
            </button>
          )}
        </div>
      </form>
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Confirmar exclusão"
      >
        <p className="text-md text-gray-500 dark:text-gray-400">
          Deseja realmente excluir este item?
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-3 py-1 bg-gray-300 rounded"
            onClick={() => setIsConfirmOpen(false)}
          >
            Cancelar
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded"
            onClick={() => {
              if (itemToDelete) onDelete(itemToDelete);
              setIsConfirmOpen(false);
              setItemToDelete(null);
            }}
          >
            Excluir
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ItemFormPage;
