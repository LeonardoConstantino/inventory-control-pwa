import { useToast } from '../contexts/ToastContext';
import { ToastType } from '../types';

export const useToastHelpers = () => {
  const { showToast } = useToast();

  const showSuccess = (title: string, message?: string, duration?: number) => {
    showToast({
      type: ToastType.SUCCESS,
      title,
      message,
      duration
    });
  };

  const showError = (title: string, message?: string, duration?: number) => {
    showToast({
      type: ToastType.ERROR,
      title,
      message,
      duration: duration || 6000 // Erros ficam mais tempo
    });
  };

  const showWarning = (title: string, message?: string, duration?: number) => {
    showToast({
      type: ToastType.WARNING,
      title,
      message,
      duration
    });
  };

  const showInfo = (title: string, message?: string, duration?: number) => {
    showToast({
      type: ToastType.INFO,
      title,
      message,
      duration
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};