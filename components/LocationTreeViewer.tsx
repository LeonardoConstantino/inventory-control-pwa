// LocationTreeViewer.tsx (Com Cores do Design System)
import React, { useState } from 'react';
import {
  ChevronUp,
  LocationIcon,
  Package,
  BoxOpen,
  Box,
  Calendar,
  EditIcon,
} from './Icons';

// Componente recursivo para cada nó da árvore
const LocationNode = (props) => {
  const { node, level } = props;
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const itemCount = node.items?.length || 0;

  // Formatar data de forma compacta (mantido)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  // Cores por nível (Adaptado para tokens do sistema + modo escuro)
  const getLevelColor = (lvl) => {
    const colors = [
      // Nível 0 (Azul -> Primary)
      'bg-primary/10 border-primary/30 dark:bg-primary/5 dark:border-primary/20',
      // Nível 1 (Verde -> Success)
      'bg-success/10 border-success/30 dark:bg-success/5 dark:border-success/20',
      // Nível 2 (Roxo -> Usando cor do tema)
      'bg-purple-100 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700',
      // Nível 3 (Laranja -> Warning)
      'bg-warning/10 border-warning/30 dark:bg-warning/5 dark:border-warning/20',
    ];
    return colors[lvl % colors.length];
  };

  const getIconColor = (lvl) => {
    const colors = [
      'text-primary dark:text-primary',
      'text-success dark:text-success',
      'text-purple-600 dark:text-purple-400',
      'text-warning dark:text-warning',
    ];
    return colors[lvl % colors.length];
  };

  // Estilo de indentação responsivo (mantido)
  const indentStyle = {
    marginLeft: level === 0 ? '0' : `${level * 16}px`,
  };

  return (
    <div className="mb-2 sm:mb-3" style={indentStyle}>
      {/* Nó principal */}
      <div
        className={`border-2 rounded-lg ${getLevelColor(
          level
        )} active:scale-98 transition-transform duration-150`}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {/* Linha principal */}
        <div className="flex items-center gap-2 p-3 sm:p-3">
          {/* Botão de expansão */}
          <button
            className="flex-shrink-0 p-1 -m-1 active:bg-neutral-200 dark:active:bg-neutral-700-dark rounded transition-colors hover:bg-neutral-100/50 dark:hover:bg-neutral-800-dark/50" // Tokenizado
            onClick={(e) => {
              e.stopPropagation();
              hasChildren && setIsExpanded(!isExpanded);
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronUp
                  className={`${getIconColor(level)} w-8 h-8 rotate-180`}
                />
              ) : (
                <ChevronUp
                  className={`${getIconColor(level)} w-8 h-8 rotate-90`}
                />
              )
            ) : (
              <div className="w-5" />
            )}
          </button>

          {/* Ícone de tipo */}
          <div className="flex-shrink-0">
            {hasChildren ? (
              isExpanded ? (
                <BoxOpen className={`${getIconColor(level)} w-8 h-8`} />
              ) : (
                <Package className={`${getIconColor(level)} w-8 h-8`} />
              )
            ) : (
              <LocationIcon className={`${getIconColor(level)} w-6 h-6`} />
            )}
          </div>

          {/* Nome e código */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {/* Tokenizado o texto */}
            <h3 className="font-semibold text-neutral-700 dark:text-neutral-300-dark text-sm sm:text-base truncate">
              {node.name}
            </h3>

            {node.metadata?.shortId && (
              // Tokenizado o fundo e texto do ID
              <span className="flex-shrink-0 px-2 py-1 bg-neutral-700 dark:bg-neutral-600 text-white text-xs rounded font-mono">
                {node.metadata.shortId}
              </span>
            )}
          </div>
        </div>

        {/* Linha de informações - Badges e contadores */}
        <div className="px-3 pb-3 sm:px-3 sm:pb-3 flex flex-wrap gap-1.5 sm:gap-2">
          {hasChildren && (
            // Badge de Sub-locais (Azul -> Primary)
            <span className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light text-xs rounded-full">
              <Box className="mr-1 w-3 h-3" />
              {node.children.length}
            </span>
          )}

          {itemCount > 0 && (
            // Badge de Itens (Verde -> Success)
            <span className="inline-flex items-center px-2 py-1 bg-success/10 text-success dark:bg-success/20 dark:text-success-light text-xs rounded-full">
              <Box className="mr-1 w-3 h-3" />
              {itemCount}
            </span>
          )}

          {node.createdAt && (
            // Badge de Data (Slate -> Neutral)
            <span className="inline-flex items-center px-2 py-1 bg-neutral-100 text-neutral-600 dark:bg-neutral-700-dark dark:text-neutral-300-dark text-xs rounded-full">
              <Calendar className="mr-1 w-3 h-3" />
              {formatDate(node.createdAt)}
            </span>
          )}

          {node.updatedAt && node.updatedAt !== node.createdAt && (
            // Badge de Edição (Amber -> Warning)
            <span className="inline-flex items-center px-2 py-1 bg-warning/10 text-warning dark:bg-warning/20 dark:text-warning-light text-xs rounded-full">
              <EditIcon className="mr-1 w-3 h-3" />
              {formatDate(node.updatedAt)}
            </span>
          )}
        </div>

        {/* ID compacto - Tokenizado */}
        <div className="px-3 pb-2 sm:px-3 sm:pb-2">
          <span className="text-xs text-neutral-500 dark:text-neutral-600 font-mono">
            #{node.id}
          </span>
        </div>
      </div>

      {/* Filhos (Tokenizado a borda) */}
      {isExpanded && hasChildren && (
        <div className="mt-2 border-l-2 border-neutral-200 dark:border-neutral-700-dark ml-2 sm:ml-3 pl-2 sm:pl-3">
          {node.children.map((child) => (
            <LocationNode
              key={child.id}
              {...props}
              node={child}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Componente principal (Tokenizado fundos, textos, bordas e sombras)
const LocationTreeViewer = ({ locations }) => {
  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-base dark:bg-neutral-800-dark rounded-lg shadow-card overflow-hidden">
          {/* Header fixo e responsivo */}
          <div className="bg-base dark:bg-neutral-800-dark border-b border-neutral-200 dark:border-neutral-700-dark p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <LocationIcon className="text-primary flex-shrink-0 w-12 h-12" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-neutral-700 dark:text-neutral-300-dark truncate">
                  Localizações
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500">
                  Estrutura hierárquica
                </p>
              </div>
            </div>
          </div>

          {/* Área de conteúdo com scroll */}
          <div className="p-3 sm:p-6 overflow-x-auto">
            <div className="min-w-max sm:min-w-0">
              {locations.map((location) => (
                <LocationNode key={location.id} node={location} level={0} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationTreeViewer;
