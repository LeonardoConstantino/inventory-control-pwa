import React from 'react';
import { Page } from '../types';

interface BottomNavProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const InventoryIcon = ({ isActive }: { isActive: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  </svg>
);

const HistoryIcon = ({ isActive }: { isActive: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ReportIcon = ({ isActive }: { isActive: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);


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
        isActive ? 'bg-accent text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700'
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
        icon={<InventoryIcon isActive={currentPage === Page.INVENTORY} />}
        label="Inventário"
        isActive={currentPage === Page.INVENTORY}
        onClick={() => onNavigate(Page.INVENTORY)}
      />
      <NavItem
        icon={<HistoryIcon isActive={currentPage === Page.HISTORY} />}
        label="Histórico"
        isActive={currentPage === Page.HISTORY}
        onClick={() => onNavigate(Page.HISTORY)}
      />
       <NavItem
        icon={<ReportIcon isActive={currentPage === Page.REPORT} />}
        label="Relatório"
        isActive={currentPage === Page.REPORT}
        onClick={() => onNavigate(Page.REPORT)}
      />
    </nav>
  );
};

export default BottomNav;