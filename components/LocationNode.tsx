import React from 'react';
import { cva } from 'class-variance-authority';
import { LocationWithChildren } from '../types'; // Supondo um tipo que inclua os filhos
import {
  EditIcon,
  TrashIcon,
  Add,
  Tree,
  Package,
  BoxOpen,
  Tag,
  TagAdd,
  TagRemove,
} from './Icons'; // Ícones para as ações

interface LocationNodeProps {
  node: LocationWithChildren;
  onEdit: (node: LocationWithChildren) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  indentationLevel: number;
  shortIdMap: Record<string, { fullId: string; shortId: string }>;
  generateShortId: (
    locationId: string,
    options: {
      strategy?: 'sequential' | 'hash' | 'smart';
      prefix?: string;
      length?: number;
    }
  ) => { success: boolean; shortId?: string; error?: string };
  removeShortId: (shortId: string) => {
    success: boolean;
    error?: string;
    fullId?: string;
  };
  isLoading?: boolean;
}

const NodeBadges: React.FC<{
  node: LocationWithChildren;
  shortId?: string;
}> = ({ node, shortId }) => (
  <div className="flex items-center gap-1.5">
    <span
      className="inline-flex items-center gap-1 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium"
      title={`Contém ${node.items.length} item(s)`}
    >
      <Package className="w-3 h-3" />
      {node.items.length}
    </span>
    {node.children?.length > 0 && (
      <span
        className="inline-flex items-center gap-1 text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-medium"
        title={`Possui ${node.children.length} sub-local(is)`}
      >
        <Tree className="w-3 h-3" />
        {node.children.length}
      </span>
    )}
    {shortId && (
      <span
        className="inline-flex items-center gap-1 text-xs bg-neutral-200 dark:bg-neutral-700-dark text-neutral-600 dark:text-neutral-300-dark px-2 py-0.5 rounded-full font-mono"
        title={`ID Curto: ${shortId}`}
      >
        <Tag className="w-3 h-3" />
        {shortId}
      </span>
    )}
  </div>
);

const actionButtonStyles = cva(
  'p-2 rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      intent: {
        default:
          'text-neutral-500 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 focus-visible:ring-primary',
        add: 'text-neutral-500 hover:text-success hover:bg-success/10 dark:hover:bg-success/20 focus-visible:ring-success',
        tag: 'text-neutral-500 hover:text-warning hover:bg-warning/10 dark:hover:bg-warning/20 focus-visible:ring-warning',
        delete:
          'text-neutral-500 hover:text-error hover:bg-error/10 dark:hover:bg-error/20 focus-visible:ring-error',
      },
    },
    defaultVariants: {
      intent: 'default',
    },
  }
);

const NodeActions: React.FC<
  Omit<LocationNodeProps, 'indentationLevel' | 'shortIdMap'>
> = ({
  node,
  onEdit,
  onDelete,
  onAddChild,
  isLoading,
  generateShortId,
  removeShortId,
  shortIdMap
}) => {
  // Encontrar o shortId de forma mais eficiente usando Object.entries
  const shortIdEntry = Object.entries(shortIdMap.mapping).find(
    ([, value]) => value.fullId === node.id
  );
  const shortId = shortIdEntry ? shortIdEntry[0] : undefined;

  return (
    <div className="flex items-center transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
      <button
        onClick={() => onAddChild(node.id)}
        disabled={isLoading}
        title="Adicionar sub-local"
        className={actionButtonStyles({ intent: 'add' })}
      >
        <Add className="w-4 h-4" />
      </button>
      <button
        onClick={() => onEdit(node)}
        disabled={isLoading}
        title="Editar local"
        className={actionButtonStyles({ intent: 'default' })}
      >
        <EditIcon className="w-4 h-4" />
      </button>
      {shortId ? (
        <button
          onClick={() => removeShortId(shortId)}
          disabled={isLoading}
          title="Remover ID Curto"
          className={actionButtonStyles({ intent: 'tag' })}
        >
          <TagRemove className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => generateShortId(node.id)}
          disabled={isLoading}
          title="Gerar ID Curto"
          className={actionButtonStyles({ intent: 'tag' })}
        >
          <TagAdd className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={() => onDelete(node.id)}
        title="Excluir local"
        className={actionButtonStyles({ intent: 'delete' })}
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

const LocationNode: React.FC<LocationNodeProps> = (props) => {
  const { node, indentationLevel } = props;
  const shortIdEntry = Object.entries(props.shortIdMap.mapping).find(
    ([, value]) => value.fullId === node.id
  );
  const shortId = shortIdEntry ? shortIdEntry[0] : undefined;

  return (
    <li className="flex flex-col">
      <div
        className="group relative flex items-center justify-between rounded-lg pl-4 pr-2 py-2 transition-colors duration-200 hover:bg-neutral-100 dark:hover:bg-neutral-700-dark"
        style={{ marginLeft: `${indentationLevel * 24}px` }}
      >
        {/* Linha vertical da árvore */}
        <div className="absolute left-0 top-0 h-full w-px bg-neutral-200 dark:bg-neutral-700-dark -translate-x-3" />

        <div className="flex items-center gap-3">
          <BoxOpen className="w-5 h-5 text-secondary" />
          <span className="font-semibold text-neutral-600 dark:text-neutral-300-dark">
            {node.name}
          </span>
          <NodeBadges node={node} shortId={shortId} />
        </div>

        <NodeActions {...props} />
      </div>

      {node.children?.length > 0 && (
        <ul className="pt-1">
          {node.children.map((childNode) => (
            <LocationNode
              key={childNode.id}
              {...props}
              node={childNode}
              indentationLevel={indentationLevel + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

export default LocationNode;
