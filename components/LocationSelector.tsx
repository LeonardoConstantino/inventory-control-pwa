import { useMemo } from 'react';
import { cva } from 'class-variance-authority';
import { clsx } from 'clsx';

// 1. Lógica de estilo encapsulada com CVA
const selectStyles = cva(
  // Estilos base aplicados a todas as variantes
  [
    'w-full px-3 py-2.5 text-sm rounded-lg shadow-sm',
    'border transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent',

    // Cores do tema claro
    'bg-base border-neutral-300 text-neutral-600 hover:border-neutral-400',

    // Cores do tema escuro
    'dark:bg-neutral-800-dark dark:border-neutral-700-dark dark:text-neutral-300-dark dark:hover:border-neutral-500',
  ],
  {
    variants: {
      disabled: {
        true: [
          'opacity-50 cursor-not-allowed',
          'bg-neutral-100 dark:bg-neutral-800-dark/50',
        ],
      },
    },
  }
);

// Função auxiliar para criar a lista indentada
const buildIndentedList = (nodes, parentId = null, indent = 0) => {
  let list = [];
  nodes
    .filter((n) => n.parentId === parentId)
    .forEach((node) => {
      list.push({ ...node, indent });
      list = list.concat(buildIndentedList(nodes, node.id, indent + 1));
    });
  return list;
};

const LocationSelector = ({
  allLocations,
  value,
  onChange,
  placeholder = 'Sem Localização',
  className = '',
  disabled = false,
  title = 'Selecione uma localização para o item',
}) => {
  const indentedList = useMemo(
    () => buildIndentedList(allLocations),
    [allLocations]
  );

  // Função para gerar o prefixo visual baseado na indentação
  const getIndentPrefix = (indent) => {
    if (indent === 0) return '';
    if (indent === 1) return '├─ ';
    return '│  '.repeat(indent - 1) + '├─ ';
  };

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      title={title}
      // 2. Aplicação dos estilos de forma declarativa
      className={clsx(selectStyles({ disabled }), className)}
    >
      {/* 3. Estilos das opções também alinhados ao design system */}
      <option value="" className="text-neutral-500">
        {placeholder}
      </option>
      {indentedList.map((loc) => (
        <option
          key={loc.id}
          value={loc.id}
          className="text-neutral-600 dark:text-neutral-300-dark"
          title={`Localização: ${loc.name}${
            loc.indent > 0 ? ` (Nível ${loc.indent + 1})` : ''
          }`}
        >
          {getIndentPrefix(loc.indent)}
          {loc.name}
        </option>
      ))}
    </select>
  );
};

export default LocationSelector;
