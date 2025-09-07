import React from 'react';
import { AppSettings, Theme } from '../types';

interface SettingsPageProps {
  currentSettings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
  onExportData: () => Promise<void>;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ currentSettings, onSettingsChange, onExportData, onImportData }) => {
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onSettingsChange({
      ...currentSettings,
      theme: e.target.value as Theme,
    });
  };

  const handleMinStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    onSettingsChange({
      ...currentSettings,
      defaultMinStock: isNaN(value) ? 0 : value,
    });
  };

  const handlePriceToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({
      ...currentSettings,
      isPriceEnabled: e.target.checked,
    });
  };

  return (
    <div className="p-4 space-y-8">
      {/* Seção de Aparência (Inalterada) */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Aparência</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <label htmlFor="theme-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tema
          </label>
          <select
            id="theme-select"
            value={currentSettings.theme}
            onChange={handleThemeChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value={Theme.LIGHT}>Claro</option>
            <option value={Theme.DARK}>Escuro</option>
            <option value={Theme.SYSTEM}>Padrão do Sistema</option>
          </select>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            O tema "Padrão do Sistema" usará a preferência do seu dispositivo.
          </p>
        </div>
      </section>

      {/* Seção de Itens (Inalterada) */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Itens</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md divide-y divide-gray-200 dark:divide-gray-700">
          <div>
            <label htmlFor="default-min-stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estoque Mínimo Padrão
            </label>
            <input
              type="number"
              id="default-min-stock"
              value={currentSettings.defaultMinStock}
              onChange={handleMinStockChange}
              min="0"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
              Este valor será usado ao criar um novo item.
            </p>
          </div>
          <div className="pt-4">
              <div className="flex justify-between items-center">
                <label htmlFor="price-enabled-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300 pr-4">
                  Habilitar campo de preço
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                        type="checkbox"
                        name="price-enabled-toggle"
                        id="price-enabled-toggle"
                        checked={currentSettings.isPriceEnabled}
                        onChange={handlePriceToggleChange}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label htmlFor="price-enabled-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 dark:bg-gray-600 cursor-pointer"></label>
                </div>
              </div>
               <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Exibe ou oculta o campo de preço no formulário de itens.
               </p>
                <style>{`
                    .toggle-checkbox:checked {
                        right: 0;
                        border-color: #3B82F6; /* accent color */
                    }
                    .toggle-checkbox:checked + .toggle-label {
                        background-color: #3B82F6; /* accent color */
                    }
                `}</style>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Gerenciamento de Dados</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md divide-y divide-gray-200 dark:divide-gray-700">
          
          {/* Sub-seção para Exportação */}
          <div className="pb-4">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Exportar Dados</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 my-2">
              Salve uma cópia de segurança de todos os seus itens, movimentações e configurações em um arquivo JSON.
            </p>
            <button
              onClick={onExportData}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Exportar Agora
            </button>
          </div>

          {/* Sub-seção para Importação */}
          <div className="pt-4">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">Importar Dados</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 my-2">
              Restaure dados a partir de um arquivo JSON. 
              <span className="block font-bold text-red-500 mt-1">
                Atenção: Esta ação substituirá todos os dados atuais e não pode ser desfeita.
              </span>
            </p>
            {/* Input de arquivo oculto, que será acionado pelo label */}
            <input 
              type="file" 
              id="file-import-input"
              accept=".json"
              onChange={onImportData}
              className="hidden" 
            />
            {/* O label é estilizado como um botão e ativa o input quando clicado */}
            <label
              htmlFor="file-import-input"
              className="w-full cursor-pointer text-center block bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Importar de Arquivo
            </label>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;