import { cva } from 'class-variance-authority';

export const inputStyles = cva(
  [
    'w-full px-3 py-2.5 text-sm rounded-lg shadow-sm border transition-all duration-200',
    'placeholder:text-neutral-500',
    'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent',
    
    // Tema Claro
    'bg-base border-neutral-300 text-neutral-600 hover:border-neutral-400',
    
    // Tema Escuro
    'dark:bg-neutral-800-dark dark:border-neutral-700-dark dark:text-neutral-300-dark dark:hover:border-neutral-500',

    // Desabilitado
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-100 dark:disabled:bg-neutral-800-dark/50'
  ]
);



// 1. Lógica de estilo encapsulada com CVA
export const selectStyles = cva(
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