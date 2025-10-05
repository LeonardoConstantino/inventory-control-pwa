import React from 'react';
import { Package, Tree, Tag } from './Icons';

const NodeBadges: React.FC<{
  node: Location;
}> = ({ itens, node }) => {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="inline-flex items-center gap-1 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full font-medium"
        title={`Contém ${itens?.length || 0} item(s)`}
      >
        <Package className="w-3 h-3" />
        {itens?.length || 0}
      </span>
      {node.children?.size > 0 && (
        <span
          className="inline-flex items-center gap-1 text-xs bg-secondary/20 text-secondary px-2 py-0.5 rounded-full font-medium"
          title={`Possui ${node.children.size} sub-local(is)`}
        >
          <Tree className="w-3 h-3" />
          {node.children.size}
        </span>
      )}
      {node.metadata.shortId && (
        <span
          className="inline-flex items-center gap-1 text-xs bg-neutral-200 dark:bg-neutral-700-dark text-neutral-600 dark:text-neutral-300-dark px-2 py-0.5 rounded-full font-mono"
          title={`ID Curto: ${node.metadata.shortId}`}
        >
          <Tag className="w-3 h-3" />
          {node.metadata.shortId}
        </span>
      )}
    </div>
  );
};

export default NodeBadges;
