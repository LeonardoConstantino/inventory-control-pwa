import React from 'react';
import { Inventory, History, Report } from './Icons';
import { Page } from '../types';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`group flex-1 flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors duration-200 ${
        isActive
          ? 'bg-accent text-white'
          : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
      }`}
    >
      {icon}
      <span className="mt-1">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.5)] flex justify-around h-16 border-t border-gray-200 dark:border-gray-700">
      <NavItem
        icon={
          <Inventory
            className={`h-6 w-6 ${
              currentPage === Page.INVENTORY
                ? 'text-white'
                : 'text-gray-400 group-hover:text-blue-500'
            }`}
          />
        }
        label="Inventário"
        isActive={currentPage === Page.INVENTORY}
        onClick={() => onNavigate(Page.INVENTORY)}
      />
      <NavItem
        icon={
          <History
            className={`h-6 w-6 ${
              currentPage === Page.HISTORY
                ? 'text-white'
                : 'text-gray-400 group-hover:text-blue-500'
            }`}
          />
        }
        label="Histórico"
        isActive={currentPage === Page.HISTORY}
        onClick={() => onNavigate(Page.HISTORY)}
      />
      <NavItem
        icon={
          <Report
            className={`h-6 w-6 ${
              currentPage === Page.REPORT
                ? 'text-white'
                : 'text-gray-400 group-hover:text-blue-500'
            }`}
          />
        }
        label="Relatório"
        isActive={currentPage === Page.REPORT}
        onClick={() => onNavigate(Page.REPORT)}
      />
    </nav>
  );
};

export default BottomNav;
