import React, { useState, useMemo } from 'react';
import Modal from './Modal'; // Importa o novo componente de Modal
import { useToastHelpers } from '../hooks/useToastHelpers';

import {
  List,
  Check,
  HelpCircle,
  Info,
  Clipboard,
  ArrowLeft,
  ArrowRight,
} from './Icons';

// Componente de indicador de progresso
const ProgressIndicator = ({ currentStep, totalSteps }) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  return (
    <div className="flex items-center space-x-4 mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="flex items-center space-x-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentStep >= step
                  ? 'bg-primary text-white'
                  : 'bg-neutral dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {currentStep > step ? <Check className="w-5 h-5" /> : step}
            </div>
            <span
              className={`font-medium ${
                currentStep >= step
                  ? 'text-primary dark:text-accent'
                  : 'text-gray-500'
              }`}
            >
              {['Sensibilidade', 'Ajustes', 'Revisão'][index]}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div className="flex-1 h-0.5 bg-neutral dark:bg-gray-700">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: currentStep > step ? '100%' : '0%' }}
              ></div>
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const PurchaseRequestGenerator = ({ items = [] }) => {
  // --- ESTADO DO COMPONENTE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [threshold, setThreshold] = useState(80);
  const [includeZeroStock, setIncludeZeroStock] = useState(true);
  const [additionalPercentage, setAdditionalPercentage] = useState(10);
  const [generatedList, setGeneratedList] = useState('');

  const { showSuccess } = useToastHelpers();

  // --- LÓGICA DE CÁLCULO (sem alterações) ---
  const itemsNeedingRestock = useMemo(() => {
    return items
      .filter((item) => {
        const stockPercentage =
          item.minStock > 0 ? (item.quantity / item.minStock) * 100 : 0;
        return (
          stockPercentage <= threshold ||
          (includeZeroStock && item.quantity === 0)
        );
      })
      .map((item) => {
        const additionalStock = Math.ceil(
          item.minStock * (additionalPercentage / 100)
        );
        const targetStock = item.minStock + additionalStock;
        const suggestedQuantity = Math.max(targetStock - item.quantity, 1);
        return { ...item, suggestedQuantity };
      })
      .sort((a, b) => a.quantity / a.minStock - b.quantity / b.minStock);
  }, [items, threshold, includeZeroStock, additionalPercentage]);

  // --- FUNÇÕES DE AÇÃO ---
  const openModal = () => {
    setCurrentStep(1); // Sempre reseta para o passo 1 ao abrir
    setGeneratedList(''); // Limpa a lista anterior
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const nextStep = () => setCurrentStep((prev) => prev + 1);
  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const generateList = () => {
    const listText = itemsNeedingRestock
      .map((item) => `${item.suggestedQuantity} uni. - ${item.name}`)
      .join('\n');
    setGeneratedList(listText);
    nextStep(); // Avança para a etapa final (passo 4)
  };

  const copyToClipboard = async () => {
    if (!generatedList) return;
    try {
      await navigator.clipboard.writeText(generatedList);
      showSuccess('Copiado!', 'Lista copiada para a área de transferência.');
    } catch (err) {
      console.error('Erro ao copiar:', err);
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = generatedList;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showSuccess('Copiado!', 'Lista copiada para a área de transferência.');
    }
  };

  // --- RENDERIZAÇÃO ---

  const getSensitivityLabel = (value) => {
    if (value >= 90) return { text: 'Muito Sensível', color: 'text-red-600' };
    if (value >= 75) return { text: 'Sensível', color: 'text-yellow-600' };
    return { text: 'Conservador', color: 'text-green-600' };
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Passo 1: Sensibilidade
        const sensitivity = getSensitivityLabel(threshold);
        return (
          <div className="bg-neutral/50 dark:bg-gray-700/30 p-4 rounded-lg border border-neutral dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Sensibilidade do Alerta
              </label>
              <span className={`text-sm font-medium ${sensitivity.color}`}>
                {sensitivity.text}
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full h-2 bg-neutral dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>Conservador</span>
              <span className="font-semibold text-primary dark:text-accent">
                {threshold}%
              </span>
              <span>Sensível</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">
              Define o quão baixo o estoque deve estar (em % do mínimo) para um
              item ser incluído na lista.
            </p>
          </div>
        );

      case 2: // Passo 2: Ajustes Finos
        return (
          <div className="space-y-6">
            <div className="bg-neutral/50 dark:bg-gray-700/30 p-4 rounded-lg border border-neutral dark:border-gray-700">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Margem de Reposição
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Adiciona uma porcentagem de segurança sobre o estoque mínimo.
              </p>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={additionalPercentage}
                onChange={(e) =>
                  setAdditionalPercentage(Number(e.target.value))
                }
                className="w-full h-2 bg-neutral dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="text-center font-semibold text-primary dark:text-accent mt-2">
                +{additionalPercentage}%
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-warning/10 rounded-lg border border-warning/20">
              <input
                type="checkbox"
                id="includeZeroStock"
                checked={includeZeroStock}
                onChange={(e) => setIncludeZeroStock(e.target.checked)}
                className="h-4 w-4 text-primary bg-neutral border-gray-300 rounded focus:ring-accent"
              />
              <label
                htmlFor="includeZeroStock"
                className="text-sm font-medium text-gray-800 dark:text-neutral cursor-pointer"
              >
                Incluir itens com estoque zerado
              </label>
            </div>
          </div>
        );

      case 3: // Passo 3: Revisão
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-neutral/30 dark:bg-gray-900/20 space-y-4">
              <h3 className="font-semibold text-gray-800 dark:text-neutral border-b pb-2 mb-2">
                Resumo da Configuração
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Sensibilidade:
                </span>
                <span className="font-medium text-right text-gray-400 dark:text-gray-200">
                  {threshold}%
                </span>

                <span className="text-gray-600 dark:text-gray-400">
                  Margem Adicional:
                </span>
                <span className="font-medium text-right text-gray-400 dark:text-gray-200">
                  +{additionalPercentage}%
                </span>

                <span className="text-gray-600 dark:text-gray-400">
                  Incluir Zerados:
                </span>
                <span className="font-medium text-right text-gray-400 dark:text-gray-200">
                  {includeZeroStock ? 'Sim' : 'Não'}
                </span>
              </div>
            </div>

            {/* Prévia dos itens */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {itemsNeedingRestock.length} itens serão incluídos na lista
            </p>
            {itemsNeedingRestock.length > 0 && (
              <div className="max-h-20 overflow-y-auto text-xs text-gray-500 dark:text-gray-400">
                {itemsNeedingRestock.slice(0, 3).map((item) => (
                  <div key={item.id}>
                    {item.suggestedQuantity} uni. - {item.name}
                  </div>
                ))}
                {itemsNeedingRestock.length > 3 && (
                  <div>... e mais {itemsNeedingRestock.length - 3} itens</div>
                )}
              </div>
            )}
          </div>
          </div>
        );

      case 4: // Passo 4: Lista Gerada
        return (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                📋 Lista de Requisição Gerada:
              </label>
              <button
                onClick={copyToClipboard}
                className="text-primary hover:text-secondary text-sm flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-primary/10 transition-colors"
              >
                <Clipboard className="h-4 w-4" />
                <span>Copiar</span>
              </button>
            </div>
            <textarea
              value={generatedList}
              readOnly
              rows={10}
              className="w-full p-3 border border-gray-300 rounded-md font-mono text-sm bg-neutral/50 dark:border-gray-600 dark:bg-gray-700 dark:text-neutral focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderFooter = () => {
    return (
      <>
        <div className="!mt-6 p-3 bg-info/10 rounded border border-info/20">
          <p className="text-sm text-center text-info">
            <strong className="font-bold">{itemsNeedingRestock.length}</strong>{' '}
            itens serão incluídos na lista de requisição.
          </p>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-neutral dark:border-gray-700">
          {/* Botão de Voltar */}
          <button
            onClick={currentStep === 4 ? () => setCurrentStep(3) : prevStep}
            className={`bg-neutral dark:bg-gray-700 text-gray-800 dark:text-neutral hover:bg-gray-200 dark:hover:bg-gray-600 py-2 px-4 rounded-md transition-colors flex items-center space-x-2
            ${currentStep === 1 ? 'invisible' : 'visible'} 
          `}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </button>

          {/* Botão de Avançar / Gerar / Concluir */}
          {currentStep < 3 && (
            <button
              onClick={nextStep}
              className="bg-primary hover:bg-secondary text-white py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
            >
              <span>Avançar</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
          {currentStep === 3 && (
            <button
              onClick={generateList}
              disabled={itemsNeedingRestock.length === 0}
              className="bg-success hover:bg-green-600 disabled:bg-gray-300 text-white py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
            >
              <List className="h-4 w-4" />
              <span>Gerar Lista ({itemsNeedingRestock.length})</span>
            </button>
          )}
          {currentStep === 4 && (
            <button
              onClick={closeModal}
              className="bg-primary hover:bg-secondary text-white py-2 px-4 rounded-md transition-colors flex items-center space-x-2"
            >
              <Check className="h-4 w-4" />
              <span>Concluir</span>
            </button>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <button
        onClick={openModal}
        className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all duration-200 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent"
      >
        <List className="h-5 w-5" />
        <span>Gerar Lista de Requisição</span>
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Gerador de Lista de Requisição"
      >
        {currentStep < 4 && (
          <ProgressIndicator currentStep={currentStep} totalSteps={3} />
        )}
        <div className="min-h-[200px]">{renderStepContent()}</div>
        {renderFooter()}
      </Modal>
    </>
  );
};

export default PurchaseRequestGenerator;
