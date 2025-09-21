import React from 'react';

/**
 * Componente EmptyState - Exibe estado vazio reutilizável
 * 
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.icon - Elemento SVG do ícone
 * @param {string} props.title - Título principal do estado vazio
 * @param {string} props.message - Mensagem descritiva do estado vazio
 * @param {string} [props.className] - Classes CSS adicionais (opcional)
 */
const EmptyState = ({ 
  icon, 
  title, 
  message, 
  className = "" 
}: { icon: React.ReactNode; title: string; message: string; className?: string; }) => {
  return (
    <div className={`p-4 text-center text-gray-500 dark:text-gray-400 h-full flex flex-col justify-center items-center ${className}`}>
      {/* Renderização do ícone SVG */}
      <div className="h-16 w-16 text-gray-400">
        {icon}
      </div>
      
      {/* Título principal */}
      <h3 className="mt-4 text-lg font-medium">
        {title}
      </h3>
      
      {/* Mensagem descritiva */}
      <p className="mt-1 text-sm">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;