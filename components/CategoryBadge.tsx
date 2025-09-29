import React from 'react';

// Função para gerar cor única baseada na categoria
const getCategoryColor = (category: string) => {
  const colors = [
    {
      bg: 'bg-blue-100 dark:bg-blue-900',
      text: 'text-blue-800 dark:text-blue-200',
    },
    {
      bg: 'bg-green-100 dark:bg-green-900',
      text: 'text-green-800 dark:text-green-200',
    },
    {
      bg: 'bg-purple-100 dark:bg-purple-900',
      text: 'text-purple-800 dark:text-purple-200',
    },
    {
      bg: 'bg-pink-100 dark:bg-pink-900',
      text: 'text-pink-800 dark:text-pink-200',
    },
    {
      bg: 'bg-yellow-100 dark:bg-yellow-900',
      text: 'text-yellow-800 dark:text-yellow-200',
    },
    {
      bg: 'bg-indigo-100 dark:bg-indigo-900',
      text: 'text-indigo-800 dark:text-indigo-200',
    },
    {
      bg: 'bg-red-100 dark:bg-red-900',
      text: 'text-red-800 dark:text-red-200',
    },
    {
      bg: 'bg-teal-100 dark:bg-teal-900',
      text: 'text-teal-800 dark:text-teal-200',
    },
    {
      bg: 'bg-orange-100 dark:bg-orange-900',
      text: 'text-orange-800 dark:text-orange-200',
    },
    {
      bg: 'bg-cyan-100 dark:bg-cyan-900',
      text: 'text-cyan-800 dark:text-cyan-200',
    },
  ];

  // Hash simples para garantir cor consistente por categoria
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = ((hash << 5) - hash + category.charCodeAt(i)) & 0xffffffff;
  }
  return colors[Math.abs(hash) % colors.length];
};

// Componente de badge para categorias - reutilizável e performático
const CategoryBadge: React.FC<{ category: string }> = React.memo(
  ({ category }) => {
    const colors = getCategoryColor(category);
    return (
      <span
        className={`inline-block ${colors.bg} ${colors.text} text-xs px-2 py-1 rounded-full font-medium mr-1 mb-1`}
      >
        {category}
      </span>
    );
  }
);

export default CategoryBadge;
