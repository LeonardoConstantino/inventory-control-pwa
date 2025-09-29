// components/ui/EmptyState.tsx (Revisado)
import React from 'react';

/**
 * Componente EmptyState - Exibe um estado vazio padronizado e reutilizável.
 * Permite a inclusão de elementos de ação (como botões) através da prop `children`.
 * 
 * @param {object} props - Propriedades do componente.
 * @param {React.ReactNode} props.icon - Elemento SVG do ícone a ser exibido.
 * @param {string} props.title - Título principal do estado vazio.
 * @param {string} props.message - Mensagem descritiva do estado vazio.
 * @param {React.ReactNode} [props.children] - Elementos filhos, como botões de call-to-action (opcional).
 * @param {string} [props.className] - Classes CSS adicionais para o container (opcional).
 */
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  message: string;
  className?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  message, 
  className = "",
  children,
}) => {
  return (
    // 1. Container com identidade visual (borda tracejada) e espaçamento generoso
    <div 
      className={`text-center p-8 border-2 border-dashed border-neutral-200 dark:border-neutral-700-dark rounded-lg flex flex-col justify-center items-center ${className}`}
    >
      {/* 2. Ícone com tamanho e cor ajustados */}
      <div className="h-12 w-12 text-neutral-400 dark:text-neutral-500">
        {icon}
      </div>
      
      {/* 3. Tipografia alinhada ao design system com hierarquia */}
      <h3 className="mt-4 text-lg font-semibold text-neutral-600 dark:text-neutral-300-dark">
        {title}
      </h3>
      <p className="mt-1 text-sm text-neutral-500">
        {message}
      </p>

      {/* 4. Slot para "children" (call-to-action) */}
      {children && (
        <div className="mt-6">
          {children}
        </div>
      )}
    </div>
  );
};

export default EmptyState;