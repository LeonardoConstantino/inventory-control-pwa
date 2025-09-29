import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import ProgressIndicator from './ProgressIndicator';
import Checkbox from './Checkbox';
import Alert from './Alert';
import RangeSlider from './RangeSlider';
import Button from './Button';
import { useToastHelpers } from '../hooks/useToastHelpers';
import { List, Check, Clipboard, ArrowLeft, ArrowRight } from './Icons';

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

  // --- RENDERIZAÇÃO ---  //

  const STEPS = [
    { id: 1, label: 'Sensibilidade' },
    { id: 2, label: 'Ajustes' },
    { id: 3, label: 'Revisão' },
  ];

  // Componente de Card para padronizar o visual das etapas
  const StepCard = ({ children }) => (
    <div className="p-4 mt-4 bg-neutral-100 dark:bg-neutral-800-dark border border-neutral-200 dark:border-neutral-700-dark rounded-lg">
      {children}
    </div>
  );

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
          <StepCard>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Sensibilidade do Alerta
            </label>
            <RangeSlider
              min="50"
              max="100"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
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
          </StepCard>
        );

      case 2: // Passo 2: Ajustes Finos
        return (
          <div className="space-y-6">
            <StepCard>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Margem de Reposição
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Adiciona uma porcentagem de segurança sobre o estoque mínimo.
              </p>
              <RangeSlider
                min="0"
                max="100"
                step="5"
                value={additionalPercentage}
                onChange={(e) =>
                  setAdditionalPercentage(Number(e.target.value))
                }
              />

              <div className="text-center font-semibold text-primary dark:text-accent mt-2">
                +{additionalPercentage}%
              </div>
            </StepCard>
            <Checkbox
              id="includeZeroStock"
              label="Incluir itens com estoque zerado"
              checked={includeZeroStock}
              onChange={(e) => setIncludeZeroStock(e.target.checked)}
            />
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
        <Alert intent="info" className="mt-6">
          <strong>{itemsNeedingRestock.length}</strong>{' '}
          {`ite${itemsNeedingRestock.length > 1 ? 'ns' : 'm'} ser${
            itemsNeedingRestock.length > 1 ? 'ão' : 'a'
          } incluíd${itemsNeedingRestock.length > 1 ? 'os' : 'o'} na
          lista.`}
        </Alert>
        <div className="flex items-center justify-between pt-6 border-t border-neutral-200 dark:border-neutral-700-dark">
          {/* Botão de Voltar */}
          <Button
            onClick={currentStep === 4 ? () => setCurrentStep(3) : prevStep}
            intent="secondary"
            className={currentStep === 1 ? 'invisible' : 'visible'}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>

          {/* Botão de Avançar / Gerar / Concluir */}
          {currentStep < 3 && (
            <Button onClick={nextStep} intent="primary">
              Avançar <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
          {currentStep === 3 && (
            <Button
              onClick={generateList}
              disabled={itemsNeedingRestock.length === 0}
              intent="success"
            >
              {' '}
              <List className="h-4 w-4 mr-2" /> Gerar Lista (
              {itemsNeedingRestock.length})
            </Button>
          )}
          {currentStep === 4 && (
            <Button onClick={closeModal} intent="primary">
              <Check className="h-4 w-4 mr-2" /> Concluir
            </Button>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <Button onClick={openModal} intent="primary">
        <List className="h-5 w-5 mr-2" /> Gerar Lista de Requisição
      </Button>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Gerador de Lista de Requisição"
      >
        {currentStep < 4 && (
          <ProgressIndicator steps={STEPS} currentStepId={currentStep} />
        )}
        <div className="min-h-[200px] my-6">{renderStepContent()}</div>
        {renderFooter()}
      </Modal>
    </>
  );
};

export default PurchaseRequestGenerator;
