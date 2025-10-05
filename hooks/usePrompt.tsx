import React, { useState, useCallback, useEffect, useRef } from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { inputStyles } from '../styles/formStyles';
import { ChatBubble } from '../components/Icons';

// Opções para customizar o prompt
interface PromptOptions {
  title?: string;
  message: string;
  defaultValue?: string;
  validator?: (value: string) => boolean | string; // true ou mensagem de erro
  required?: boolean; // Impede confirmação se vazio
  placeholder?: string;
  confirmText?: string;
  cancelText?: string;
}

// Tipo de retorno do hook (EXPLÍCITO)
interface UsePromptReturn {
  prompt: (options: PromptOptions) => Promise<string | null>;
  PromptDialog: React.ReactNode;
}

/**
 * Hook customizado para exibir prompts de entrada programaticamente
 * Substitui window.prompt com interface React customizável
 *
 * @returns Objeto contendo função prompt e componente PromptDialog
 *
 * @example
 * const { prompt, PromptDialog } = usePrompt();
 * const email = await prompt({
 *   message: 'Digite seu email:',
 *   required: true,
 *   validator: (value) => {
 *     if (!/\S+@\S+\.\S+/.test(value)) return 'Email inválido';
 *     return true;
 *   }
 * });
 */
const usePrompt = (): UsePromptReturn => {
  const [options, setOptions] = useState<PromptOptions | null>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const resolveRef = useRef<((value: string | null) => void) | null>(null);

  // Cleanup: resolve Promise pendente ao desmontar
  useEffect(() => {
    return () => {
      if (resolveRef.current) {
        resolveRef.current(null);
        resolveRef.current = null;
      }
    };
  }, []);

  // Função de validação centralizada
  const validateInput = useCallback(
    (value: string): string => {
      if (!options) return '';

      // 1. Validação de campo obrigatório
      if (options.required && value.trim() === '') {
        return 'Este campo é obrigatório';
      }

      // 2. Se não é obrigatório e está vazio, não valida
      if (!options.required && value.trim() === '') {
        return '';
      }

      // 3. Validação customizada (se fornecida e campo não está vazio)
      if (options.validator) {
        const validationResult = options.validator(value);

        // Se retornou string, é mensagem de erro
        if (typeof validationResult === 'string') {
          return validationResult;
        }

        // Se retornou false, é inválido (mensagem genérica)
        if (validationResult === false) {
          return 'Valor inválido';
        }
      }

      // 4. Validação passou
      return '';
    },
    [options]
  );

  // Verifica se o input atual é válido
  const isValid = useCallback((): boolean => {
    return validateInput(inputValue) === '';
  }, [inputValue, validateInput]);

  // Função para abrir o prompt e retornar uma Promise
  const prompt = useCallback(
    (promptOptions: PromptOptions): Promise<string | null> => {
      // Previne múltiplos prompts simultâneos
      if (options !== null) {
        console.warn('Prompt dialog is already open');
        return Promise.resolve(null);
      }

      setOptions(promptOptions);
      setInputValue(promptOptions.defaultValue || '');
      setErrorMessage(''); // Limpa erros anteriores

      return new Promise<string | null>((resolve) => {
        resolveRef.current = resolve;
      });
    },
    [options]
  );

  // Resolve a Promise e fecha o prompt
  const handleAction = useCallback((result: string | null) => {
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
    setOptions(null);
    setInputValue('');
    setErrorMessage('');
  }, []);

  // Handler de confirmação com validação
  const handleConfirm = useCallback(() => {
    const error = validateInput(inputValue);

    if (error) {
      setErrorMessage(error);
      return; // Não permite confirmação se inválido
    }

    handleAction(inputValue);
  }, [inputValue, validateInput, handleAction]);

  const handleCancel = useCallback(() => {
    handleAction(null);
  }, [handleAction]);

  // Handler para mudança de input (validação em tempo real)
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);

      // Validação em tempo real enquanto digita
      const error = validateInput(newValue);
      setErrorMessage(error);
    },
    [validateInput]
  );

  // Handler para teclas especiais (Enter e Escape)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleConfirm, handleCancel]
  );

  // Componente do prompt (renderizado condicionalmente)
  const PromptDialog: React.ReactNode =
    options !== null ? (
      <Modal
        isOpen={true}
        onClose={handleCancel}
        title={options.title || 'Entrada de Dados'}
      >
        <div className="flex flex-col gap-6">
          <div className="flex items-start gap-4">
            {/* Ícone e cores do sistema */}
            <ChatBubble className="h-8 w-8 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              {/* Tipografia do sistema */}
              <p
                id="prompt-message"
                className="text-gray-600 dark:text-gray-300 mb-4"
              >
                {options.message}
              </p>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={options.placeholder}
                aria-required={options.required}
                aria-invalid={errorMessage !== ''}
                // Estilos de input do sistema
                className={inputStyles({
                  className: errorMessage ? 'border-red-500' : '',
                })}
                autoFocus
                aria-describedby={
                  errorMessage ? 'prompt-error' : 'prompt-message'
                }
              />
              {/* Feedback de erro robusto */}
              {errorMessage && (
                <p
                  id="prompt-error"
                  className="mt-2 text-sm text-red-600"
                  role="alert"
                >
                  {errorMessage}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button onClick={handleCancel} intent="secondary">
              {options.cancelText || 'Cancelar'}
            </Button>
            <Button
              onClick={handleConfirm}
              intent="primary"
              disabled={!isValid()}
            >
              {options.confirmText || 'OK'}
            </Button>
          </div>
        </div>
      </Modal>
    ) : null;

  // CRÍTICO: Retorno explícito do objeto
  return {
    prompt,
    PromptDialog,
  };
};

export default usePrompt;
