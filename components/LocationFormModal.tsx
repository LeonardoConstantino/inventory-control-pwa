import React, { useState, useEffect } from 'react';
import { cva } from 'class-variance-authority';
import Modal from './Modal';
import Button from './Button';
import { LocationIcon, BoxOpen, Info, Save, ChevronUp } from './Icons';
import LocationSelector from './LocationSelector'; 
import { Location } from '../types';

export const inputStyles = cva(
  [
    'w-full px-3 py-2.5 text-sm rounded-lg shadow-sm border transition-all duration-200',
    'placeholder:text-neutral-500',
    'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent',
    
    // Tema Claro
    'bg-base border-neutral-300 text-neutral-600 hover:border-neutral-400',
    
    // Tema Escuro
    'dark:bg-neutral-800-dark dark:border-neutral-700-dark dark:text-neutral-300-dark dark:hover:border-neutral-500',

    // Desabilitado
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-100 dark:disabled:bg-neutral-800-dark/50'
  ]
);

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    id?: string;
    name: string;
    parentId: string | null;
  }) => void;
  initialData?: { id?: string; name: string; parentId: string | null };
  allLocations: Location[];
}

// Subcomponente para o preview para manter o principal mais limpo
const HierarchyPreview: React.FC<{ parentName: string; childName: string }> = ({ parentName, childName }) => (
  <div className="p-3 bg-neutral-100 dark:bg-neutral-800-dark rounded-lg border border-neutral-200 dark:border-neutral-700-dark">
    <div className="flex items-center text-sm text-neutral-500">
      <Info className="h-4 w-4 mr-2 text-info" />
      <span className="font-medium">Hierarquia Resultante:</span>
    </div>
    <div className="mt-2 flex items-center text-sm ml-6">
      <span className="text-neutral-600 dark:text-neutral-300-dark">
        {parentName}
      </span>
      <ChevronUp className="h-3 w-3 mx-2 text-neutral-400 rotate-90" />
      <span className="text-primary font-semibold">
        {childName}
      </span>
    </div>
  </div>
);

const LocationFormModal: React.FC<LocationFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  allLocations,
}) => {
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setParentId(initialData.parentId || null);
    } else {
      setName('');
      setParentId(null);
    }
  }, [initialData, isOpen]); // Resetar o form quando o modal abrir

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave({
        id: initialData?.id,
        name: name.trim(),
        parentId,
      });
      onClose();
    }
  };

  const title = initialData?.id ? 'Editar Localização' : 'Nova Localização';
  const parentLocationName = allLocations.find((loc) => loc.id === parentId)?.name;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Campo Nome */}
        <div>
          <label htmlFor="locationName" className="flex items-center text-sm font-semibold text-neutral-600 dark:text-neutral-300-dark mb-2">
            <LocationIcon className="h-4 w-4 mr-2 text-accent" />
            Nome da Localização
          </label>
          <input
            type="text"
            id="locationName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Sala Principal, Depósito A..."
            title="Digite um nome descritivo para a localização"
            className={inputStyles()} // Aplicando estilos padronizados
            required
            autoFocus
          />
        </div>

        {/* Campo Local Pai */}
        <div>
          <label htmlFor="parentId" className="flex items-center text-sm font-semibold text-neutral-600 dark:text-neutral-300-dark mb-2">
            <BoxOpen className="h-4 w-4 mr-2 text-accent" />
            Local Pai
            <span className="ml-1.5 text-xs text-neutral-500 font-normal">(Opcional)</span>
          </label>
          <LocationSelector
            allLocations={allLocations.filter((loc) => loc.id !== initialData?.id)}
            value={parentId}
            onChange={setParentId}
          />
          <p className="mt-2 text-xs text-neutral-500">
            Selecione um local existente para criar uma hierarquia.
          </p>
        </div>

        {/* Preview da hierarquia */}
        {parentId && parentLocationName && (
          <HierarchyPreview
            parentName={parentLocationName}
            childName={name.trim() || 'Nova localização'}
          />
        )}

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700-dark">
          <Button type="button" onClick={onClose} intent="secondary" title="Cancelar e fechar">
            Cancelar
          </Button>
          <Button
            type="submit"
            intent="primary"
            title={initialData?.id ? 'Salvar alterações' : 'Criar nova localização'}
            disabled={!name.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            {initialData?.id ? 'Salvar Alterações' : 'Criar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LocationFormModal;
