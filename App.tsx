import React, { useState, useEffect, useRef } from 'react';
import { Item, Movement, Page, MovementType, AppSettings, Theme } from './types';
import { LOCAL_STORAGE_ITEMS_KEY, LOCAL_STORAGE_MOVEMENTS_KEY, LOCAL_STORAGE_SETTINGS_KEY } from './constants';
import useIndexedDB from './hooks/useIndexedDB';
import { ToastProvider } from './contexts/ToastContext';
import { useToastHelpers } from './hooks/useToastHelpers';
import BottomNav from './components/BottomNav';
import InventoryPage from './pages/InventoryPage';
import ItemFormPage from './pages/ItemFormPage';
import ItemDetailPage from './pages/ItemDetailPage';
import HistoryPage from './pages/HistoryPage';
import ReportPage from './pages/ReportPage';
import SettingsPage from './pages/SettingsPage';
import ToastContainer from './components/ToastContainer';

const AppContent: React.FC = () => {
  // Hooks IndexedDB para persistência de dados
  const {
    value: items,
    setValue: setItems,
    loading: itemsLoading,
    error: itemsError
  } = useIndexedDB<Item[]>(LOCAL_STORAGE_ITEMS_KEY, []);

  const {
    value: movements,
    setValue: setMovements,
    loading: movementsLoading,
    error: movementsError
  } = useIndexedDB<Movement[]>(LOCAL_STORAGE_MOVEMENTS_KEY, []);

  const {
    value: settings,
    setValue: setSettings,
    loading: settingsLoading,
    error: settingsError
  } = useIndexedDB<AppSettings>(LOCAL_STORAGE_SETTINGS_KEY, {
    theme: Theme.SYSTEM,
    defaultMinStock: 1,
    isPriceEnabled: true,
  });

  const [currentPage, setCurrentPage] = useState<Page>(Page.INVENTORY);
  const [pageContext, setPageContext] = useState<any>(null);

  // Controle de primeira renderização usando useRef para evitar re-renders desnecessários
  const hasInitiallyLoadedRef = useRef(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Estados para operações assíncronas não-bloqueantes
  const [isOperationInProgress, setIsOperationInProgress] = useState(false);

  // Hook para mostrar toasts
  const { showSuccess, showError, showWarning, showInfo } = useToastHelpers();

  // Estado combinado de loading e error para facilitar verificações
  const isAnyDataLoading = itemsLoading || movementsLoading || settingsLoading;
  const hasError = itemsError || movementsError || settingsError;

  // Controle de loading inicial - executa apenas uma vez
  useEffect(() => {
    if (!hasInitiallyLoadedRef.current && !isAnyDataLoading) {
      hasInitiallyLoadedRef.current = true;
      setIsInitialLoading(false);
      // Toast de sucesso quando carregamento completo
      showSuccess('Sistema Pronto!', 'Dados carregados com sucesso');
    }
  }, [isAnyDataLoading]);

  // Gerenciamento de tema (mantém funcionalidade original)
  useEffect(() => {
    // Só executa quando settings não estão carregando
    if (settingsLoading) return;

    const root = window.document.documentElement;
    const isDark =
      settings.theme === Theme.DARK ||
      (settings.theme === Theme.SYSTEM && window.matchMedia('(prefers-color-scheme: dark)').matches);

    root.classList.toggle('dark', isDark);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (settings.theme === Theme.SYSTEM) {
        root.classList.toggle('dark', mediaQuery.matches);
      }
    }
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme, settingsLoading]);

  const handleNavigate = (page: Page, context: any = null) => {
    setPageContext(context);
    setCurrentPage(page);
  };

  // Wrapper para operações assíncronas não-bloqueantes
  const executeAsyncOperation = async (operation: () => Promise<void>, successMessage?: string) => {
    setIsOperationInProgress(true);
    try {
      await operation();
      if (successMessage) {
        showSuccess('Sucesso!', successMessage);
      }
    } catch (error) {
      console.error('Erro na operação:', error);
      showError('Erro!', 'Erro na operação. Tente novamente.');
    } finally {
      setIsOperationInProgress(false);
    }
  };

  const handleSaveItem = async (itemToSave: Item) => {
    const existingIndex = items.findIndex(i => i.id === itemToSave.id);
    await executeAsyncOperation(async () => {
      if (existingIndex > -1) {
        const newItems = [...items];
        newItems[existingIndex] = itemToSave;
        await setItems(newItems);
      } else {
        const newItems = [...items, itemToSave];
        await setItems(newItems);

        if (itemToSave.quantity > 0) {
          const initialMovement: Movement = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            itemId: itemToSave.id,
            type: MovementType.ENTRY,
            quantity: itemToSave.quantity,
            timestamp: itemToSave.createdAt,
          };
          await setMovements([...movements, initialMovement]);
        }
      }
      handleNavigate(Page.INVENTORY);
    }, existingIndex > -1 ? 'Item atualizado com sucesso!' : 'Item criado com sucesso!');
  };

  const handleDeleteItem = async (itemId: string) => {
    // Toast de confirmação antes de deletar
    showWarning('Atenção!', 'Item será excluído permanentemente');

    await executeAsyncOperation(async () => {
      const newItems = items.filter(i => i.id !== itemId);
      const newMovements = movements.filter(m => m.itemId !== itemId);

      await setItems(newItems);
      await setMovements(newMovements);
      handleNavigate(Page.INVENTORY);
    }, 'Item excluído com sucesso');
  };

  const handleUpdateStock = async (itemId: string, quantityChange: number, type: MovementType) => {
    await executeAsyncOperation(async () => {
      const itemIndex = items.findIndex(i => i.id === itemId);
      if (itemIndex > -1) {
        const newItems = [...items];
        const item = newItems[itemIndex];
        const newQuantity = type === MovementType.ENTRY ? item.quantity + quantityChange : item.quantity - quantityChange;

        if (newQuantity < 0) {
          throw new Error("Não é possível remover mais estoque do que o disponível.");
        }

        item.quantity = newQuantity;

        const newMovement: Movement = {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          itemId,
          type,
          quantity: quantityChange,
          timestamp: Date.now(),
        };

        // Atualiza ambos os estados
        await setItems(newItems);
        await setMovements([...movements, newMovement]);
      }
    }, `Estoque ${type === MovementType.ENTRY ? 'adicionado' : 'removido'} com sucesso!`);
  };

  const handleSettingsChange = async (newSettings: AppSettings) => {
    await executeAsyncOperation(async () => {
      await setSettings(newSettings);
    }, 'Configurações salvas com sucesso');
  };

  const handleExportData = async () => {
    try {
      // 1. Solicita um nome para o arquivo para personalização
      const inventoryName = window.prompt("Digite um nome para o seu inventário (ex: principal):", "inventario");
      if (!inventoryName) {
        showInfo('Operação Cancelada', 'A exportação foi cancelada pelo usuário.');
        return;
      }

      // 2. Coleta todos os dados em um único objeto
      const dataToExport = {
        items,
        movements,
        settings,
        exportDate: new Date().toISOString(), // Adiciona um metadado de data
      };

      // 3. Converte o objeto para uma string JSON formatada
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // 4. Cria o nome do arquivo com data e hora
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
      const filename = `${inventoryName}_${timestamp}.json`;

      // 5. Cria um link temporário e simula o clique para download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 6. Libera a memória do objeto URL
      URL.revokeObjectURL(url);

      showSuccess('Exportação Concluída!', `Arquivo ${filename} salvo com sucesso.`);

    } catch (error) {
      console.error("Falha na exportação:", error);
      showError('Erro na Exportação', 'Não foi possível exportar os dados.');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Usa a API FileReader para ler o arquivo
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error("Falha ao ler o conteúdo do arquivo.");
        }

        // 2. Converte o texto para JSON
        const importedData = JSON.parse(text);

        // 3. Valida a estrutura do arquivo JSON importado
        const hasItems = 'items' in importedData && Array.isArray(importedData.items);
        const hasMovements = 'movements' in importedData && Array.isArray(importedData.movements);
        const hasSettings = 'settings' in importedData && typeof importedData.settings === 'object';

        if (!hasItems || !hasMovements || !hasSettings) {
          throw new Error("O arquivo de importação possui uma estrutura inválida.");
        }

        // 4. Pede confirmação ao usuário para evitar sobreposição acidental
        const userConfirmed = window.confirm(
          "Você tem certeza? A importação substituirá TODOS os dados atuais. Esta ação não pode ser desfeita."
        );

        if (userConfirmed) {
          // 5. Atualiza os estados da aplicação com os dados importados
          await executeAsyncOperation(async () => {
            await setItems(importedData.items);
            await setMovements(importedData.movements);
            await setSettings(importedData.settings);
          }, 'Dados importados com sucesso!');
        } else {
          showInfo('Operação Cancelada', 'A importação foi cancelada pelo usuário.');
        }
      } catch (error) {
        console.error("Falha na importação:", error);
        showError('Erro na Importação', String(error instanceof Error ? error.message : "Erro desconhecido."));
      } finally {
        // Limpa o valor do input para permitir importar o mesmo arquivo novamente
        event.target.value = '';
      }
    };

    reader.onerror = () => {
      showError('Erro de Leitura', 'Não foi possível ler o arquivo selecionado.');
    };

    reader.readAsText(file);
  };

  const renderHeader = () => {
    const titles: { [key in Page]?: string } = {
      [Page.INVENTORY]: "Inventário",
      [Page.ITEM_FORM]: pageContext?.isEditing ? "Editar Item" : "Adicionar Novo Item",
      [Page.ITEM_DETAIL]: "Detalhes do Item",
      [Page.HISTORY]: "Histórico de Movimentações",
      [Page.REPORT]: "Relatório Detalhado",
      [Page.SETTINGS]: "Configurações",
    };

    const showBackButton = ![Page.INVENTORY, Page.HISTORY, Page.REPORT].includes(currentPage);
    const showSettingsButton = [Page.INVENTORY, Page.HISTORY, Page.REPORT].includes(currentPage);

    const backDestination = pageContext?.fromPage || (currentPage === Page.ITEM_FORM && pageContext?.itemId ? Page.ITEM_DETAIL : Page.INVENTORY);

    return (
      <header className="bg-primary text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center">
          {showBackButton && (
            <button
              onClick={() => handleNavigate(backDestination, { itemId: pageContext?.itemId })}
              className="mr-4"
              disabled={false} // Removido bloqueio por loading
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <h1 className="text-xl font-bold flex items-center">
            {titles[currentPage]}
            {/* Indicador visual não-intrusivo para operações em andamento */}
            {isOperationInProgress && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
          </h1>
        </div>
        {showSettingsButton && (
          <button
            onClick={() => handleNavigate(Page.SETTINGS)}
            aria-label="Configurações"
            disabled={false} // Removido bloqueio por loading
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </header>
    );
  };

  const renderLoadingScreen = () => (
    <div className="h-screen w-screen bg-neutral dark:bg-gray-900 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando dados...</p>
    </div>
  );

  const renderErrorScreen = () => (
    <div className="h-screen w-screen bg-neutral dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-red-500 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Erro ao Carregar Dados</h2>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
        {String(hasError) || 'Ocorreu um erro inesperado ao carregar os dados.'}
      </p>
      <button
        onClick={() => {
          showInfo('Recarregando...', 'Tentando carregar dados novamente');
          window.location.reload();
        }}
        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
      >
        Tentar Novamente
      </button>
    </div>
  );

  const renderPage = () => {
    switch (currentPage) {
      case Page.INVENTORY:
        return <InventoryPage items={items} onNavigate={handleNavigate} />;
      case Page.ITEM_FORM:
        const itemToEdit = pageContext?.isEditing ? items.find(i => i.id === pageContext.itemId) : null;
        return <ItemFormPage
          itemToEdit={itemToEdit}
          onSave={handleSaveItem}
          onDelete={handleDeleteItem}
          onCancel={() => handleNavigate(itemToEdit ? Page.ITEM_DETAIL : Page.INVENTORY, { itemId: itemToEdit?.id })}
          defaultMinStock={settings.defaultMinStock}
          isPriceEnabled={settings.isPriceEnabled}
        />;
      case Page.ITEM_DETAIL:
        const item = items.find(i => i.id === pageContext.itemId);
        if (!item) {
          // Item might have been deleted, go back to inventory
          setTimeout(() => handleNavigate(Page.INVENTORY), 0);
          return null;
        }
        return <ItemDetailPage
          item={item}
          onNavigate={(page, context) => handleNavigate(page, { ...context, fromPage: Page.ITEM_DETAIL })}
          onUpdateStock={handleUpdateStock}
          onDeleteItem={handleDeleteItem}
          isPriceEnabled={settings.isPriceEnabled} />;
      case Page.HISTORY:
        return <HistoryPage items={items} movements={movements} />;
      case Page.REPORT:
        return <ReportPage items={items} movements={movements} />;
      case Page.SETTINGS:
        return <SettingsPage
          currentSettings={settings}
          onSettingsChange={handleSettingsChange} 
          onExportData={handleExportData}
          onImportData={handleImportData}
        />;
      default:
        return <InventoryPage items={items} onNavigate={handleNavigate} />;
    }
  };

  // Renderiza tela de carregamento APENAS durante inicialização
  if (isInitialLoading) {
    return renderLoadingScreen();
  }

  // Renderiza tela de erro se houver problemas com IndexedDB
  if (hasError) {
    return renderErrorScreen();
  }

  return (
    <div className="h-screen w-screen bg-neutral dark:bg-gray-900 flex flex-col font-sans">
      {renderHeader()}
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
      {[Page.INVENTORY, Page.HISTORY, Page.REPORT].includes(currentPage) && (
        <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
      )}
    </div>
  );
};

// Componente principal que envolve tudo no ToastProvider
const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
      <ToastContainer />
    </ToastProvider>
  );
};

export default App;