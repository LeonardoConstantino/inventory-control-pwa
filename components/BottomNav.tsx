// BottomNav.tsx (Revisado)
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Inventory, History, Report } from './Icons';
import { Page } from '../types';

// 1. Definindo as variantes do NavItem com CVA
const navItemStyles = cva(
  // Estilos base, aplicados a todas as variantes
  'group flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  {
    variants: {
      active: {
        true: [
          // Estilos para o estado ATIVO
          'bg-accent text-white rounded-t-lg', // Adicionado um leve rounded para um toque moderno
        ],
        false: [
          // Estilos para o estado INATIVO
          'text-neutral-600 dark:text-neutral-300-dark',
          'hover:bg-neutral-100 dark:hover:bg-neutral-700-dark',
        ],
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

// 2. Definindo as variantes do ÍCONE com CVA
const iconStyles = cva('h-6 w-6 transition-colors duration-200', {
  variants: {
    active: {
      true: 'text-white',
      false:
        'text-neutral-500 group-hover:text-primary dark:group-hover:text-accent',
    },
  },
  defaultVariants: {
    active: false,
  },
});

interface NavItemProps extends VariantProps<typeof navItemStyles> {
  icon: React.ElementType; // Passar o componente do ícone em vez do nó
  label: string;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({
  icon: Icon,
  label,
  active,
  onClick,
}) => {
  return (
    <button onClick={onClick} className={navItemStyles({ active })}>
      <Icon className={iconStyles({ active })} />
      <span className="mt-1">{label}</span>
    </button>
  );
};

// 3. Componente principal usando os tokens de design
interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { page: Page.INVENTORY, label: 'Inventário', icon: Inventory },
    { page: Page.HISTORY, label: 'Histórico', icon: History },
    { page: Page.REPORT, label: 'Relatório', icon: Report },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 flex h-16 justify-around border-t border-neutral-200 bg-base shadow-top-md dark:border-neutral-700-dark dark:bg-neutral-800-dark">
      {navItems.map((item) => (
        <NavItem
          key={item.page}
          label={item.label}
          icon={item.icon}
          active={currentPage === item.page}
          onClick={() => onNavigate(item.page)}
        />
      ))}
    </nav>
  );
};

export default BottomNav;
