import React, { useEffect, useState } from 'react';
import { Toast as ToastType, ToastType as ToastTypeEnum } from '../types';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = () => {
    setIsLeaving(true);
    // Aguarda animação antes de remover
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  // Auto-close quando hover sair (se tiver duração)
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(handleClose, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const getToastStyles = () => {
    const baseStyles = "border-l-4 shadow-lg rounded-r-md";
    
    switch (toast.type) {
      case ToastTypeEnum.SUCCESS:
        return `${baseStyles} bg-green-50 border-green-500 dark:bg-green-900/20 dark:border-green-400`;
      case ToastTypeEnum.ERROR:
        return `${baseStyles} bg-red-50 border-red-500 dark:bg-red-900/20 dark:border-red-400`;
      case ToastTypeEnum.WARNING:
        return `${baseStyles} bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20 dark:border-yellow-400`;
      case ToastTypeEnum.INFO:
      default:
        return `${baseStyles} bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-400`;
    }
  };

  const getIconStyles = () => {
    switch (toast.type) {
      case ToastTypeEnum.SUCCESS:
        return "text-green-600 dark:text-green-400";
      case ToastTypeEnum.ERROR:
        return "text-red-600 dark:text-red-400";
      case ToastTypeEnum.WARNING:
        return "text-yellow-600 dark:text-yellow-400";
      case ToastTypeEnum.INFO:
      default:
        return "text-blue-600 dark:text-blue-400";
    }
  };

  const getTextStyles = () => {
    switch (toast.type) {
      case ToastTypeEnum.SUCCESS:
        return "text-green-800 dark:text-green-100";
      case ToastTypeEnum.ERROR:
        return "text-red-800 dark:text-red-100";
      case ToastTypeEnum.WARNING:
        return "text-yellow-800 dark:text-yellow-100";
      case ToastTypeEnum.INFO:
      default:
        return "text-blue-800 dark:text-blue-100";
    }
  };

  const renderIcon = () => {
    const iconClass = `h-5 w-5 ${getIconStyles()}`;
    
    switch (toast.type) {
      case ToastTypeEnum.SUCCESS:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case ToastTypeEnum.ERROR:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case ToastTypeEnum.WARNING:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case ToastTypeEnum.INFO:
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`
        ${getToastStyles()}
        transform transition-all duration-300 ease-in-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        ${toast.isVisible ? 'animate-slide-in-right' : ''}
        p-4 mb-3 max-w-sm w-full pointer-events-auto
      `}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {renderIcon()}
        </div>
        <div className="ml-3 flex-1">
          <h4 className={`text-sm font-medium ${getTextStyles()}`}>
            {toast.title}
          </h4>
          {toast.message && (
            <p className={`mt-1 text-sm ${getTextStyles()} opacity-90`}>
              {toast.message}
            </p>
          )}
        </div>
        <button
          onClick={handleClose}
          className={`
            ml-4 flex-shrink-0 rounded-md p-1.5 hover:bg-black/10 dark:hover:bg-white/10
            focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors
            ${getIconStyles()}
          `}
          aria-label="Fechar notificação"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;