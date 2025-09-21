import React, { useEffect, useState } from 'react';
import { Check, ErrorIcon, AlertTriangle, Info, Close } from './Icons';
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
    const baseStyles = 'border-l-4 shadow-lg rounded-r-md';

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
        return 'text-green-600 dark:text-green-400';
      case ToastTypeEnum.ERROR:
        return 'text-red-600 dark:text-red-400';
      case ToastTypeEnum.WARNING:
        return 'text-yellow-600 dark:text-yellow-400';
      case ToastTypeEnum.INFO:
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getTextStyles = () => {
    switch (toast.type) {
      case ToastTypeEnum.SUCCESS:
        return 'text-green-800 dark:text-green-100';
      case ToastTypeEnum.ERROR:
        return 'text-red-800 dark:text-red-100';
      case ToastTypeEnum.WARNING:
        return 'text-yellow-800 dark:text-yellow-100';
      case ToastTypeEnum.INFO:
      default:
        return 'text-blue-800 dark:text-blue-100';
    }
  };

  const renderIcon = () => {
    const iconClass = `h-5 w-5 ${getIconStyles()}`;

    switch (toast.type) {
      case ToastTypeEnum.SUCCESS:
        return <Check className={iconClass} />;
      case ToastTypeEnum.ERROR:
        return <ErrorIcon className={iconClass} />;
      case ToastTypeEnum.WARNING:
        return <AlertTriangle className={iconClass} />;
      case ToastTypeEnum.INFO:
      default:
        return <Info className={iconClass} />;
    }
  };

  return (
    <div
      className={`
        ${getToastStyles()}
        transform transition-all duration-300 ease-in-out
        ${
          isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
        }
        ${toast.isVisible ? 'animate-slide-in-right' : ''}
        p-4 mb-3 max-w-sm w-full pointer-events-auto
      `}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{renderIcon()}</div>
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
          <Close className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
