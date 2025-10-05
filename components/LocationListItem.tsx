import React, { useState, useRef } from 'react';
import { Location } from '../types';
import { useSwipeable } from '../hooks/useSwipeable';
import NodeBadges from './NodeBadges';
import {
  ChevronUp,
  EditIcon,
  TrashIcon,
  TagRemove,
  TagAdd,
  BoxOpen,
  EllipsisVertical,
  Close,
} from '../components/Icons';

interface LocationListItemProps {
  location: Location;
  childCount: number;
  onNavigate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRemoveShortId: () => void;
  onGenerateShortId: () => void;
  itens?: { size: number };
}

const LocationListItem: React.FC<LocationListItemProps> = ({
  location,
  childCount,
  onNavigate,
  onEdit,
  onDelete,
  onRemoveShortId,
  onGenerateShortId,
  itens,
}) => {
  const threshold = -240;
  // 1. Usando nosso hook! O componente agora é muito mais simples.
  const {
    translateX,
    handlers,
    isSwipeActive,
    isSwiped,
    setTranslateX,
    resetPosition,
  } = useSwipeable({
    threshold,
    enableMouse: true,
  });

  const handleDesktopMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    translateX !== 0 ? resetPosition() : setTranslateX(threshold);
  };
  const handleEdit = () => {
    onEdit();
    resetPosition();
  };
  const handleDelete = () => {
    onDelete();
    resetPosition();
  };

  const handleShortId = () => {
    if (location.metadata.shortId) {
      onRemoveShortId();
    } else {
      onGenerateShortId();
    }

    resetPosition();
  };

  return (
    <li className="relative bg-base dark:bg-neutral-800-dark rounded-lg shadow-card overflow-hidden">
      {/* 1. Painel de Ações Polido */}
      <div className="absolute top-0 right-0 h-full flex items-center z-0">
        <button
          onClick={handleEdit}
          className="h-full w-20 flex flex-col items-center justify-center bg-primary text-white transition-colors hover:bg-primary-dark"
          title="Editar"
        >
          <EditIcon className="w-5 h-5" />
          <span className="text-xs mt-1">Editar</span>
        </button>
        <button
          onClick={handleShortId}
          className="h-full w-20 flex flex-col items-center justify-center bg-warning text-white transition-colors hover:bg-warning-dark"
          title={
            location.metadata.shortId ? 'Remover ID Curto' : 'Gerar ID Curto'
          }
        >
          {location.metadata.shortId ? (
            <TagRemove className="w-5 h-5" />
          ) : (
            <TagAdd className="w-5 h-5" />
          )}
          <span className="text-xs mt-1">
            {location.metadata.shortId ? 'Remover ID' : 'Gerar ID'}
          </span>
        </button>
        <button
          onClick={handleDelete}
          className="h-full w-20 flex flex-col items-center justify-center bg-error text-white transition-colors hover:bg-error-dark"
          title="Excluir"
        >
          <TrashIcon className="w-5 h-5" />
          <span className="text-xs mt-1">Excluir</span>
        </button>
      </div>

      {/* 2. Conteúdo Visível com Hierarquia e Feedback Aprimorados */}
      <div
        className={`relative z-10 flex items-center justify-between p-4 w-full bg-base dark:bg-neutral-800-dark cursor-pointer transition-all duration-200 ease-out
                   ${translateX !== 0 ? 'shadow-lg' : ''}`} // Sombra sutil quando deslizado
        style={{ transform: `translateX(${translateX}px)` }}
        {...handlers}
        onClick={() => (isSwiped ? resetPosition() : onNavigate())}
      >
        <div className="flex items-center min-w-0">
          <BoxOpen className="h-8 w-8 text-secondary mr-4 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-neutral-600 dark:text-neutral-300-dark truncate">
              {location.name}
            </p>
            <div className="mt-1.5">
              <NodeBadges itens={itens} node={location} />
            </div>
          </div>
        </div>

        <div className="flex items-center flex-shrink-0 ml-4">
          {/* Botão de Menu para DESKTOP */}
          <button
            onClick={handleDesktopMenuToggle}
            className="hidden md:flex items-center justify-center p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-700-dark z-20"
            aria-label="Ações"
          >
            {translateX !== 0 ? (
              <Close className="w-5 h-5 text-neutral-500" />
            ) : (
              <EllipsisVertical className="w-5 h-5 text-neutral-500" />
            )}
          </button>

          {/* Seta de Navegação para MOBILE */}
          <ChevronUp className="w-6 h-6 text-neutral-400 md:hidden rotate-90" />
        </div>
      </div>
    </li>
  );
};

export default LocationListItem;
