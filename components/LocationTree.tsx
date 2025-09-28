import React from 'react';
import LocationNode from './LocationNode';
import Button from './Button';
import StatItem from './StatItem';
import { LocationIcon, Add, TagClear, Tree as TreeIcon, Package, Layers, Tag } from './Icons';
import { LocationWithChildren, LocationManager } from '../types';

interface LocationTreeProps {
  locationManager: LocationManager;
  onEdit: (node: LocationWithChildren) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  onAddRoot: () => void;
  isLoading?: boolean;
}

// Subcomponente para o estado vazio para manter o principal limpo
const EmptyState: React.FC<{ onAddRoot: () => void; isLoading?: boolean }> = ({
  onAddRoot,
  isLoading,
}) => (
  <div className="text-center rounded-lg border-2 border-dashed border-neutral-200 dark:border-neutral-700-dark p-8">
    <LocationIcon className="h-12 w-12 text-neutral-500 mx-auto mb-3" />
    <p className="font-semibold text-neutral-600 dark:text-neutral-300-dark">
      Nenhuma localização cadastrada
    </p>
    <p className="text-sm text-neutral-500 mt-1 mb-6">
      Crie sua primeira localização para organizar seu inventário
    </p>
    <Button
      onClick={onAddRoot}
      disabled={isLoading}
      title="Criar a primeira localização do sistema"
      intent="primary"
      size="lg"
    >
      <Add className="h-5 w-5 mr-2" />
      Criar Primeira Localização
    </Button>
  </div>
);

const LocationTree: React.FC<LocationTreeProps> = ({
  locationManager,
  onEdit,
  onDelete,
  onAddChild,
  onAddRoot,
  isLoading,
  clearShortIdCache,
}) => {
  const { treeStructure: tree, statistics } = locationManager;

  if (tree.length === 0) {
    return <EmptyState onAddRoot={onAddRoot} isLoading={isLoading} />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Container da Árvore */}
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700-dark bg-base dark:bg-neutral-800-dark overflow-hidden">
        {/* Usamos apenas `ul` pois LocationNode já renderiza um `li` */}
        <ul>
          {tree.map((node) => (
            <LocationNode
              key={node.id}
              node={node}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              indentationLevel={0}
              isLoading={isLoading}
              shortIdMap={locationManager.getShortIdMapping()}
              generateShortId={locationManager.generateShortId}
              removeShortId={locationManager.removeShortId}
            />
          ))}
        </ul>
      </div>

      {/* Ações Globais */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700-dark">
        {/* --- SEÇÃO DE ESTATÍSTICAS REVISADA --- */}
        <div className="flex items-center gap-4">
          <StatItem
            icon={TreeIcon}
            value={statistics.totalLocations}
            label="Total de Localizações"
          />
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700-dark" />{' '}
          {/* Divisor vertical sutil */}
          <StatItem
            icon={Package}
            value={statistics.totalItems}
            label="Total de Itens"
          />
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700-dark" />
          <StatItem
            icon={Layers}
            value={statistics.maxDepth}
            label="Profundidade Máxima"
          />
          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700-dark" />
          <StatItem
            icon={Tag}
            value={statistics.shortIdCacheSize}
            label="IDs Curtos em Cache"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (
                window.confirm(
                  'Tem certeza que deseja resetar todas as localizações? Esta ação não pode ser desfeita.'
                )
              ) {
                clearShortIdCache();
              }
            }}
            disabled={isLoading}
            intent="danger"
            size="sm"
            title="Limpar todos os IDs curtos"
          >
            <TagClear className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Limpar IDs</span>
          </Button>
          <Button
            onClick={onAddRoot}
            disabled={isLoading}
            intent="secondary"
            title="Adicionar uma nova localização de nível raiz"
          >
            <Add className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">Adicionar Raiz</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationTree;
