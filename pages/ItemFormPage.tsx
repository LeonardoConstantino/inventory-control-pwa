import React, { useState, useCallback, useRef } from 'react';
import { Item, AppSettings, Location } from '../types';
import CameraCapture from '../components/CameraCapture';
import LocationSelector from '../components/LocationSelector';
import Modal from '../components/Modal';

interface ItemFormPageProps {
  itemToEdit?: Item | null;
  onSave: (item: Item) => void;
  onDelete?: (itemId: string) => void;
  onCancel: () => void;
  currentSettings: AppSettings;
  allLocations: Location[];
}

// Hook customizado para debounce
const useDebounce = (callback: Function, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
};

const ItemFormPage: React.FC<ItemFormPageProps> = ({
  itemToEdit,
  onSave,
  onDelete,
  onCancel,
  currentSettings,
  allLocations,
}) => {
  const { isPriceEnabled, imageQuality, defaultMinStock } = currentSettings;
  const [form, setForm] = useState(() => {
    if (itemToEdit) {
      return {
        name: itemToEdit.name,
        description: itemToEdit.description,
        // CORREÇÃO: Converter array para string na inicialização, removendo duplicatas
        category: Array.isArray(itemToEdit.category)
          ? [...new Set(itemToEdit.category)].join(', ')
          : itemToEdit.category || '',
        minStock: itemToEdit.minStock,
        price: itemToEdit.price || 0,
        initialQuantity: itemToEdit.quantity,
        photo: itemToEdit.photo,
      };
    }
    return {
      name: '',
      description: '',
      // CORREÇÃO: Inicializar como string vazia em vez de array
      category: '',
      minStock: defaultMinStock,
      price: 0,
      initialQuantity: 0,
      photo: null,
    };
  });

  const [error, setError] = useState('');
  const [categoryWarning, setCategoryWarning] = useState('');
  const [rawCategory, setRawCategory] = useState(form.category); // Estado separado para input
  const [locationId, setLocationId] = useState<string | null>(itemToEdit?.locationId || null);

  const isEditing = Boolean(itemToEdit);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Função para processar e validar categorias únicas
  const processCategories = (categoryString: string): string => {
    if (!categoryString.trim()) return '';

    // Divide por vírgula, remove espaços, filtra vazias e remove duplicatas
    const categories = categoryString
      .split(',')
      .map((cat) => cat.trim())
      .filter((cat) => cat.length > 0);

    const uniqueCategories = [
      ...new Set(categories.map((cat) => cat.toLowerCase())),
    ].map((cat) => {
      // Encontra a categoria original com a capitalização correta
      const originalCategory = categories.find(
        (orig) => orig.toLowerCase() === cat
      );
      return originalCategory || cat;
    });

    // Verifica se houve duplicatas removidas
    if (categories.length > uniqueCategories.length) {
      setCategoryWarning(
        'Categorias duplicadas foram removidas automaticamente.'
      );
      // Remove o warning após 3 segundos
      setTimeout(() => setCategoryWarning(''), 3000);
    } else {
      setCategoryWarning('');
    }

    return uniqueCategories.join(', ');
  };

  // Função debounced para processar categorias
  const debouncedProcessCategories = useDebounce((value: string) => {
    const processedValue = processCategories(value);
    if (processedValue !== value) {
      setForm((prev) => ({ ...prev, category: processedValue }));
      setRawCategory(processedValue);
    }
  }, 1000); // Processa após 1 segundo de inatividade

  // Handler para input de categoria
  const handleCategoryChange = (value: string) => {
    setRawCategory(value);
    setForm((prev) => ({ ...prev, category: value }));

    // Só processa se não estiver digitando vírgula ou espaço no final
    if (!value.endsWith(',') && !value.endsWith(', ')) {
      debouncedProcessCategories(value);
    }
  };

  const updateField = (field: keyof typeof form, value: any) => {
    // Processamento especial para categorias
    if (field === 'category') {
      const processedValue = processCategories(value);
      setForm((prev) => ({ ...prev, [field]: processedValue }));
    } else {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

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
      // CORREÇÃO: Converter string para array no submit, com validação adicional de duplicatas
      category: form.category
        ? [
            ...new Set(
              form.category
                .split(',')
                .map((cat) => cat.trim())
                .filter((cat) => cat.length > 0)
                .map((cat) => cat.toLowerCase())
            ),
          ].map((cat) => {
            // Restaura capitalização original
            const originalCat = form.category
              .split(',')
              .map((c) => c.trim())
              .find((orig) => orig.toLowerCase() === cat);
            return originalCat || cat;
          })
        : [],
      photo: form.photo,
      minStock: parseInt(form.minStock || '0', 10),
      price: isPriceEnabled ? parseFloat(form.price || '0') : 0,
      quantity: isEditing
        ? itemToEdit!.quantity
        : parseInt(form.initialQuantity || '0', 10),
      createdAt: isEditing ? itemToEdit!.createdAt : Date.now(),
      locationId: locationId || undefined, // Adiciona o ID ou undefined se for null
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

        {/* Componente de Captura de Foto */}
        <CameraCapture
          onCapture={(img) => updateField('photo', img)}
          initialImage={form.photo}
          imageQuality={imageQuality}
        />

        {/* Campo Nome */}
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

        {/* Campo Descrição */}
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

        {/* Campo Categoria */}
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Categoria
          </label>
          <input
            type="text"
            id="category"
            placeholder="Categorias (separadas por vírgula)"
            title="Separe múltiplas categorias com vírgulas. Duplicatas serão removidas automaticamente."
            value={rawCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          {categoryWarning && (
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
              {categoryWarning}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Exemplo: Eletrônicos, Casa, Jardim
          </p>
        </div>

        {/* Campo Localização */}
        <div>
          <label
            htmlFor="location-selector"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Localização
          </label>
          <LocationSelector
            allLocations={allLocations}
            value={locationId}
            onChange={setLocationId} // Passa a função de atualização do estado
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Opcional: Onde este item está armazenado fisicamente.
          </p>
        </div>

        {/* Campo Preço */}
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

        {/* Campo Quantidade Inicial - Apenas ao adicionar novo item */}
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

        {/* Campo Estoque Mínimo */}
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

        {/* Botões de Ação */}
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
