// components/Modal.tsx (Refatorado sem bibliotecas extras)
import React, { useEffect, useRef, useState } from 'react';
import { Close } from './Icons'; // Ícone consistente

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${React.useId()}`; // Gera um ID único para o título

  // 2. Efeito para fechar com a tecla 'Escape'
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // 1. Efeito para prender o foco (Focus Trapping)
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const FOCUSABLE_SELECTOR = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
    ].join(', ');

    const focusableElements =
      modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Foca o primeiro elemento ao abrir o modal
    if (focusableElements.length === 0) {
      // Se não há elementos focáveis, foca o próprio container do modal
      modalRef.current?.setAttribute('tabindex', '-1');
      modalRef.current?.focus();
    }

    const handleTabKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    modalRef.current?.addEventListener('keydown', handleTabKeyPress);
    return () => {
      modalRef.current?.removeEventListener('keydown', handleTabKeyPress);
    };
  }, [isOpen]);

  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300); // Duração da animação
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  return (
    // 4. Estilos do Design System para o overlay
    <div
      className={`transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      } fixed inset-0 bg-neutral-900-dark/50 z-40 flex justify-center items-center backdrop-blur-sm`}
      onClick={onClose}
    >
      {/* 3. Atributos ARIA e Ref para o container do modal */}
      <div
        ref={modalRef}
        className="w-11/12 max-w-md rounded-lg bg-base dark:bg-neutral-800-dark shadow-lg border-2 border-neutral-200 dark:border-neutral-700-dark"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {/* Cabeçalho com estilos coesos */}
        <header className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700-dark">
          <h3
            id={titleId}
            className="text-xl font-semibold text-neutral-600 dark:text-neutral-300-dark"
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label="Fechar modal"
          >
            <Close className="w-6 h-6 text-neutral-500" />
          </button>
        </header>

        {/* Corpo do modal com espaçamento padronizado */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
};

export default Modal;
