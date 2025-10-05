import React, { useState, useCallback, useEffect, useRef } from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { HelpCircle, AlertTriangle } from '../components/Icons';

// Opções para customizar o diálogo
interface ConfirmOptions {
  title?: string;
  message: string;
  intent?: 'default' | 'danger';
  confirmText?: string;
  cancelText?: string;
}

// Tipo de retorno do hook (EXPLÍCITO)
interface UseConfirmReturn {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  ConfirmDialog: React.ReactNode;
}

/**
 * Hook customizado para exibir diálogos de confirmação programaticamente
 * 
 * @returns Objeto contendo função confirm e componente ConfirmDialog
 * 
 * @example
 * const { confirm, ConfirmDialog } = useConfirm();
 * const result = await confirm({ 
 *   message: 'Deseja continuar?',
 *   intent: 'danger'
 * });
 * if (result) {
 *   // Usuário confirmou
 * }
 */
const useConfirm = (): UseConfirmReturn => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  // Cleanup: resolve Promise pendente ao desmontar
  useEffect(() => {
    return () => {
      if (resolveRef.current) {
        resolveRef.current(false);
        resolveRef.current = null;
      }
    };
  }, []);

  // Função para abrir o diálogo e retornar uma Promise
  const confirm = useCallback((confirmOptions: ConfirmOptions): Promise<boolean> => {
    // Previne múltiplos diálogos simultâneos
    if (options !== null) {
      console.warn('Confirm dialog is already open');
      return Promise.resolve(false);
    }

    setOptions(confirmOptions);
    
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, [options]);

  // Resolve a Promise e fecha o diálogo
  const handleAction = useCallback((result: boolean) => {
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
    setOptions(null);
  }, []);
  
  const handleConfirm = useCallback(() => handleAction(true), [handleAction]);
  const handleCancel = useCallback(() => handleAction(false), [handleAction]);

  // Componente do diálogo (renderizado condicionalmente)
  const ConfirmDialog: React.ReactNode = options !== null ? (
    <Modal
      isOpen={true}
      onClose={handleCancel}
      title={options.title || (options.intent === 'danger' ? 'Atenção' : 'Confirmação')}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-start gap-4">
          {options.intent === 'danger' ? (
            <AlertTriangle className="h-8 w-8 text-error  flex-shrink-0 mt-1" />
          ) : (
            <HelpCircle className="h-8 w-8 text-secondary  flex-shrink-0 mt-1" />
          )}
          <p className="text-neutral-600 dark:text-neutral-300-dark">
            {options.message}
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button onClick={handleCancel} intent="secondary">
            {options.cancelText || 'Cancelar'}
          </Button>
          <Button
            onClick={handleConfirm}
            intent={options.intent === 'danger' ? 'danger' : 'primary'}
            autoFocus
          >
            {options.confirmText || 'OK'}
          </Button>
        </div>
      </div>
    </Modal>
  ) : null;

  // CRÍTICO: Retorno explícito do objeto
  return { 
    confirm, 
    ConfirmDialog 
  };
};

export default useConfirm;