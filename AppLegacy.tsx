import React, { useState, useEffect } from 'react';
import { Item, Movement, Page, MovementType, AppSettings, Theme } from './types';
import { LOCAL_STORAGE_ITEMS_KEY, LOCAL_STORAGE_MOVEMENTS_KEY, LOCAL_STORAGE_SETTINGS_KEY } from './constants';
import useLocalStorage from './hooks/useLocalStorage';
import BottomNav from './components/BottomNav';
import InventoryPage from './pages/InventoryPage';
import ItemFormPage from './pages/ItemFormPage';
import ItemDetailPage from './pages/ItemDetailPage';
import HistoryPage from './pages/HistoryPage';
import ReportPage from './pages/ReportPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  const [items, setItems] = useLocalStorage<Item[]>(LOCAL_STORAGE_ITEMS_KEY, []);
  const [movements, setMovements] = useLocalStorage<Movement[]>(LOCAL_STORAGE_MOVEMENTS_KEY, []);
  const [settings, setSettings] = useLocalStorage<AppSettings>(LOCAL_STORAGE_SETTINGS_KEY, {
    theme: Theme.SYSTEM,
    defaultMinStock: 1,
    isPriceEnabled: true,
  });
  
  const [currentPage, setCurrentPage] = useState<Page>(Page.INVENTORY);
  const [pageContext, setPageContext] = useState<any>(null);

  useEffect(() => {
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
  }, [settings.theme]);


  const handleNavigate = (page: Page, context: any = null) => {
    setPageContext(context);
    setCurrentPage(page);
  };

  const handleSaveItem = (itemToSave: Item) => {
    const existingIndex = items.findIndex(i => i.id === itemToSave.id);
    if (existingIndex > -1) {
      // It's an update
      const newItems = [...items];
      newItems[existingIndex] = itemToSave;
      setItems(newItems);
    } else {
      // It's a new item
      setItems(prevItems => [...prevItems, itemToSave]);
      
      // If there's an initial quantity, log it as the first movement
      if (itemToSave.quantity > 0) {
        const initialMovement: Movement = {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          itemId: itemToSave.id,
          type: MovementType.ENTRY,
          quantity: itemToSave.quantity,
          timestamp: itemToSave.createdAt, // Use item creation time for the initial entry
        };
        setMovements(prevMovements => [...prevMovements, initialMovement]);
      }
    }
    handleNavigate(Page.INVENTORY);
  };
  
  const handleDeleteItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
    // Also remove associated movements
    setMovements(movements.filter(m => m.itemId !== itemId));
    handleNavigate(Page.INVENTORY);
  };
  
  const handleUpdateStock = (itemId: string, quantityChange: number, type: MovementType) => {
    const itemIndex = items.findIndex(i => i.id === itemId);
    if (itemIndex > -1) {
      const newItems = [...items];
      const item = newItems[itemIndex];
      const newQuantity = type === MovementType.ENTRY ? item.quantity + quantityChange : item.quantity - quantityChange;
      
      if(newQuantity < 0) {
        alert("Não é possível remover mais estoque do que o disponível.");
        return;
      }
      
      item.quantity = newQuantity;
      setItems(newItems);
      
      const newMovement: Movement = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        itemId,
        type,
        quantity: quantityChange,
        timestamp: Date.now(),
      };
      setMovements([...movements, newMovement]);
    }
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
                  <button onClick={() => handleNavigate(backDestination, {itemId: pageContext?.itemId})} className="mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                  </button>
              )}
              <h1 className="text-xl font-bold">{titles[currentPage]}</h1>
            </div>
            {showSettingsButton && (
              <button onClick={() => handleNavigate(Page.SETTINGS)} aria-label="Configurações">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}
        </header>
    );
  };

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
        if(!item) {
            // Item might have been deleted, go back to inventory
            setTimeout(() => handleNavigate(Page.INVENTORY), 0);
            return null;
        }
        return <ItemDetailPage 
            item={item} 
            onNavigate={(page, context) => handleNavigate(page, {...context, fromPage: Page.ITEM_DETAIL})}
            onUpdateStock={handleUpdateStock}
            onDeleteItem={handleDeleteItem} />;
      case Page.HISTORY:
        return <HistoryPage items={items} movements={movements} />;
      case Page.REPORT:
        return <ReportPage items={items} movements={movements} />;
      case Page.SETTINGS:
        return <SettingsPage currentSettings={settings} onSettingsChange={setSettings} />;
      default:
        return <InventoryPage items={items} onNavigate={handleNavigate} />;
    }
  };

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

export default App;