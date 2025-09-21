// src/pwa-register.ts
import { registerSW } from 'virtual:pwa-register';

/**
 * Classe para gerenciar notificações visuais do PWA
 * Utiliza apenas recursos nativos do DOM
 */
class PWANotificationManager {
  private readonly styles = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .pwa-notification {
      animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .pwa-notification.removing {
      animation: slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
  `;

  private styleSheet: HTMLStyleElement | null = null;

  constructor() {
    this.injectStyles();
  }

  /**
   * Injeta estilos CSS no documento
   */
  private injectStyles(): void {
    if (this.styleSheet) return;

    this.styleSheet = document.createElement('style');
    this.styleSheet.textContent = this.styles;
    document.head.appendChild(this.styleSheet);
  }

  // Método auxiliar para ícones
  private getIconForType(type: string): string {
    const iconMap = {
      default: '📱',
      update: '🔄',
      offline: '📡',
      error: '❌',
      success: '✅',
      warning: '⚠️',
    };

    return iconMap[type] || iconMap.default;
  }

  /**
   * Cria e exibe uma notificação visual
   */
  private createNotification(
    type: 'update' | 'offline' | 'error',
    title: string,
    message: string,
    actions?: Array<{ text: string; action: () => void; primary?: boolean }>
  ): HTMLElement {
    const notification = document.createElement('div');

    // Classes base usando Tailwind e o esquema de cores
    const baseClasses =
      'pwa-notification fixed top-5 right-5 max-w-sm p-5 rounded-xl shadow-2xl z-50 font-sans text-sm leading-relaxed backdrop-blur-lg border border-white/10';

    // Classes específicas por tipo usando suas cores personalizadas
    const typeClasses = {
      default: 'bg-gradient-to-br from-primary to-secondary text-white',
      update: 'bg-gradient-to-br from-info to-accent text-white',
      offline: 'bg-gradient-to-br from-success to-accent text-white',
      error: 'bg-gradient-to-br from-error to-warning text-white',
      success: 'bg-gradient-to-br from-success/90 to-success text-white',
      warning: 'bg-gradient-to-br from-warning to-error text-white',
    };

    notification.className = `${baseClasses} ${
      typeClasses[type] || typeClasses.default
    }`;

    notification.innerHTML = `
    <button class="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 text-lg font-light" 
            aria-label="Fechar">&times;</button>
    
    <div class="flex items-center gap-2.5 mb-3 font-semibold">
      <div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
        ${this.getIconForType(type)}
      </div>
      <div>${title}</div>
    </div>
    
    <div class="mb-4 opacity-90">
      ${message}
    </div>
    
    ${
      actions
        ? `
      <div class="flex gap-2.5 justify-end">
        ${actions
          .map(
            (action) => `
          <button class="${
            action.primary
              ? 'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 bg-white/90 text-gray-800 hover:bg-white hover:-translate-y-0.5 shadow-sm'
              : 'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 bg-white/20 text-white backdrop-blur-sm hover:bg-white/30 hover:-translate-y-0.5'
          }">
            ${action.text}
          </button>
        `
          )
          .join('')}
      </div>
    `
        : ''
    }
  `;

    // Event listeners para ações
    if (actions) {
      const buttons = notification.querySelectorAll('.pwa-btn');
      buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
          actions[index].action();
          this.removeNotification(notification);
        });
      });
    }

    // Event listener para fechar
    const closeBtn = notification.querySelector('.pwa-close');
    closeBtn?.addEventListener('click', () =>
      this.removeNotification(notification)
    );

    // Auto-remove após 10 segundos (se não tiver ações)
    if (!actions) {
      setTimeout(() => this.removeNotification(notification), 10000);
    }

    document.body.appendChild(notification);
    return notification;
  }

  /**
   * Remove notificação com animação
   */
  private removeNotification(notification: HTMLElement): void {
    notification.classList.add('removing');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Exibe notificação de atualização disponível
   */
  showUpdateNotification(onUpdate: () => void): void {
    this.createNotification(
      'update',
      '🚀 Atualização Disponível',
      'Uma nova versão do aplicativo está disponível. Recomendamos atualizar para obter as melhorias mais recentes.',
      [
        {
          text: 'Mais Tarde',
          action: () => console.log('Update postponed'),
        },
        {
          text: 'Atualizar Agora',
          action: onUpdate,
          primary: true,
        },
      ]
    );
  }

  /**
   * Exibe notificação de modo offline
   */
  showOfflineNotification(): void {
    this.createNotification(
      'offline',
      '📱 Pronto para Offline',
      'O aplicativo foi instalado com sucesso e está pronto para funcionar sem conexão com a internet.'
    );
  }

  /**
   * Exibe notificação de erro
   */
  showErrorNotification(error: string): void {
    this.createNotification(
      'error',
      '❌ Erro no Service Worker',
      `Ocorreu um erro durante o registro: ${error}`
    );
  }
}

// Instância global do gerenciador de notificações
const notificationManager = new PWANotificationManager();

/**
 * Função para exibir notificação de atualização com interface visual
 */
const showUpdateNotification = (): void => {
  notificationManager.showUpdateNotification(() => {
    window.location.reload();
  });
};

/**
 * Função para exibir notificação de offline com interface visual
 */
const showOfflineNotification = (): void => {
  notificationManager.showOfflineNotification();
  console.log('App está pronto para funcionar offline');
};

/**
 * Função para exibir notificação de erro com interface visual
 */
const showErrorNotification = (error: string): void => {
  notificationManager.showErrorNotification(error);
  console.error('Erro ao registrar Service Worker:', error);
};

// Registra o Service Worker com callbacks visuais aprimorados
const updateSW = registerSW({
  // Registra imediatamente
  immediate: true,

  // Callback quando uma nova versão está disponível
  onNeedRefresh() {
    showUpdateNotification();
  },

  // Callback quando o app está pronto para funcionar offline
  onOfflineReady() {
    showOfflineNotification();
  },

  // Callback quando o SW foi registrado com sucesso
  onRegistered(registration) {
    console.log('✅ Service Worker registrado com sucesso:', registration);
  },

  // Callback para erros de registro
  onRegisterError(error) {
    showErrorNotification(error.message);
  },
});

/**
 * Exporta função para forçar atualização
 */
export const forceUpdate = (): void => {
  updateSW(true);
};

/**
 * Exporta instância do gerenciador de notificações para uso externo
 */
export { notificationManager };

// Auto-executa o registro
export default updateSW;
