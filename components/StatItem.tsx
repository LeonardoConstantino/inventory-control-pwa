import React from 'react';

interface StatItemProps {
  icon: React.ElementType;
  value: number | string;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon: Icon, value, label }) => {
  return (
    <div className="group relative flex items-center gap-1.5" title={label}>
      <Icon className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
      <span className="font-mono text-sm font-medium text-neutral-600 dark:text-neutral-300-dark">
        {value}
      </span>
      {/* Tooltip (opcional, mas recomendado) */}
      <div className="absolute bottom-full mb-2 hidden group-hover:block px-2 py-1 bg-neutral-800-dark text-white text-xs rounded-md whitespace-nowrap">
        {label}
      </div>
    </div>
  );
};

export default StatItem;