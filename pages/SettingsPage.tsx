import React, { useState, useEffect, useRef } from 'react';
import {
  AppSettings,
  Theme,
  ImageQuality,
  LocationManager,
  Page,
} from '../types';
import useConfirm from '../hooks/useConfirm';
import StatItem from '../components/StatItem';
import LocationFormModal from '../components/LocationFormModal';
import SettingsRow from '../components/SettingsRow';
import ToggleSwitch from '../components/ToggleSwitch';
import Button from '../components/Button';
import Alert from '../components/Alert';
import ProgressBar from '../components/ProgressBar';
import StatCard from '../components/StatCard';
import ActionCard from '../components/ActionCard';
import LoadingState from '../components/LoadingState';
import {
  LocationIcon,
  Sum,
  Moon,
  Desktop,
  Paintbrush,
  Box,
  CircleStack,
  ArrowPath,
  AlertTriangle,
  ArrowUpTray,
  ArrowDownTray,
  ChevronUp,
  Tree,
  Package,
  Layers,
  Tag,
} from '../components/Icons';
import { inputStyles } from '../styles/formStyles';
import { selectStyles } from '../styles/formStyles';
import { clsx } from 'clsx';
interface SettingsPageProps {
  currentSettings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
  onExportData: () => Promise<void>;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
  getStorageSize?: () => Promise<{
    used: number;
    quota: number;
    percentage: number;
  } | null>;
  locationManager: LocationManager;
  locationsLoading: boolean;
}

/**
 * Interface para dados de armazenamento
 */
interface StorageInfo {
  used: number;
  quota: number;
  percentage: number;
}

/**
 * Configurações de qualidade para exibição ao usuário
 * Incluem informações técnicas e estimativas de tamanho
 */
const IMAGE_QUALITY_OPTIONS = {
  high: {
    label: 'Alta Qualidade',
    description: 'Máxima resolução (1920×1080)',
    fileSize: '~200-400KB',
    usage: 'Melhor para detalhes finos, mas ocupa mais espaço',
  },
  medium: {
    label: 'Qualidade Média',
    description: 'Resolução balanceada (1280×720)',
    fileSize: '~100-200KB',
    usage: 'Bom equilíbrio entre qualidade e tamanho',
  },
  low: {
    label: 'Qualidade Básica',
    description: 'Resolução reduzida (854×480)',
    fileSize: '~50-100KB',
    usage: 'Economiza espaço, mas perde detalhes',
  },
} as const;

const SectionHeader: React.FC<{ title: String; icon: React.ElementType }> = ({
  title,
  Icon,
}): React.ElementType => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-neutral-600 dark:text-neutral-300-dark flex items-center gap-2">
        <Icon className="h-6 w-6 text-accent" />
        {title}
      </h2>
    </div>
  );
};

const SettingsPage: React.FC<SettingsPageProps> = ({
  currentSettings,
  onSettingsChange,
  onExportData,
  onImportData,
  getStorageSize,
  locationManager,
  onNavigate,
  locationsLoading,
}) => {
  // Estados para informações de armazenamento
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [storageLoading, setStorageLoading] = useState<boolean>(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);

  const { confirm, ConfirmDialog } = useConfirm();

  const handleOpenModal = (data: any = null) => {
    setEditingLocation(data);
    setIsModalOpen(true);
  };

  const handleAddChild = (parentId: string) => {
    handleOpenModal({ parentId });
  };

  const handleAddRoot = () => {
    handleOpenModal({ parentId: null });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
  };

  const handleSaveLocation = (data: {
    id?: string;
    name: string;
    parentId: string | null;
  }) => {
    if (data.id) {
      // Editando
      const originalNode = locationManager.nodes.find((n) => n.id === data.id);
      if (!originalNode) return;

      if (originalNode.parentId !== data.parentId) {
        locationManager.moveLocation(data.id, data.parentId);
      }
      // NOTA: A lógica para renomear precisará de uma função `updateLocation` no hook.
      // Por enquanto, focamos em mover e criar.
    } else {
      // Criando um novo
      const newId = `loc-${Date.now()}-${crypto.randomUUID()}`;
      locationManager.addLocation(newId, data.name, data.parentId);
    }
  };

  /**
   * Formata bytes para uma representação legível
   */
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Busca informações atualizadas de armazenamento
   */
  const fetchStorageInfo = async () => {
    if (!getStorageSize) return;

    setStorageLoading(true);
    setStorageError(null);

    try {
      const info = await getStorageSize();
      setStorageInfo(info);
    } catch (error) {
      setStorageError('Erro ao obter informações de armazenamento');
      console.error('Erro ao buscar storage info:', error);
    } finally {
      setStorageLoading(false);
    }
  };

  /**
   * Carrega informações de storage na inicialização
   */
  useEffect(() => {
    if (getStorageSize) {
      fetchStorageInfo();
    }
  }, [getStorageSize]);

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

  /**
   * Manipula mudanças na configuração de qualidade de imagem
   * Atualiza as configurações globais do aplicativo
   */
  const handleImageQualityChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onSettingsChange({
      ...currentSettings,
      imageQuality: e.target.value as ImageQuality,
    });
  };

  const handleImportClick = async () => {
    const result = await confirm({
      message:
        'Esta ação substituirá todos os dados atuais e não pode ser desfeita. Deseja continuar?',
      intent: 'danger',
      title: 'ATENÇÃO!',
      confirmText: 'Sim',
      cancelText: 'Não',
    });
    if (
      result
      // window.confirm(
      //   'ATENÇÃO: Esta ação substituirá todos os dados atuais e não pode ser desfeita. Deseja continuar?'
      // )
    ) {
      fileInputRef.current?.click();
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedQuality =
    IMAGE_QUALITY_OPTIONS[currentSettings.imageQuality] ||
    IMAGE_QUALITY_OPTIONS['medium'];

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-12">
      {/* Seção de Aparência */}
      <section className="space-y-4">
        <SectionHeader title="Aparência" Icon={Paintbrush}/>

        {/* Card com estilos padronizados */}
        <div className="bg-base dark:bg-neutral-800-dark p-6 rounded-lg shadow-card border border-neutral-200 dark:border-neutral-700-dark">
          {/* Linha de Configuração com layout flexível */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Rótulo e descrição, agora com ícones */}
            <div>
              <label
                htmlFor="theme-select"
                className="flex items-center text-sm font-semibold text-neutral-600 dark:text-neutral-300-dark"
              >
                {/* Ícone dinâmico baseado no tema selecionado */}
                {currentSettings.theme === Theme.LIGHT && (
                  <Sum className="h-5 w-5 mr-2 text-warning" />
                )}
                {currentSettings.theme === Theme.DARK && (
                  <Moon className="h-5 w-5 mr-2 text-info" />
                )}
                {currentSettings.theme === Theme.SYSTEM && (
                  <Desktop className="h-5 w-5 mr-2 text-secondary" />
                )}
                Tema da Interface
              </label>
              <p className="mt-1 text-xs text-neutral-500">
                O tema "Sistema" se adapta à preferência do seu dispositivo.
              </p>
            </div>

            {/* Seletor usando nosso estilo padronizado */}
            <select
              id="theme-select"
              value={currentSettings.theme}
              onChange={handleThemeChange}
              className={clsx(selectStyles(), 'sm:w-52')} // Aplicando estilos e definindo uma largura para telas maiores
            >
              <option value={Theme.LIGHT}>Claro</option>
              <option value={Theme.DARK}>Escuro</option>
              <option value={Theme.SYSTEM}>Padrão do Sistema</option>
            </select>
          </div>
        </div>
      </section>

      {/* Seção de Itens com Qualidade de Imagem */}
      <section className="space-y-4">
        <SectionHeader title="Itens" Icon={Box}/>

        {/* Card padronizado, usando `divide` com cores do design system */}
        <div className="bg-base dark:bg-neutral-800-dark px-6 rounded-lg shadow-card border border-neutral-200 dark:border-neutral-700-dark divide-y divide-neutral-200 dark:divide-neutral-700-dark">
          <SettingsRow
            label="Estoque Mínimo Padrão"
            description="Este valor será usado como padrão ao criar um novo item."
          >
            <input
              type="number"
              id="default-min-stock"
              value={currentSettings.defaultMinStock}
              onChange={handleMinStockChange}
              min="0"
              className={inputStyles({ className: 'w-24 text-center' })} // Reutilizando e adicionando classes
            />
          </SettingsRow>

          <SettingsRow
            label="Habilitar Campo de Preço"
            description="Exibe ou oculta o campo de preço no formulário de itens."
          >
            <ToggleSwitch
              id="price-enabled-toggle"
              checked={currentSettings.isPriceEnabled}
              onChange={handlePriceToggleChange}
            />
          </SettingsRow>

          <SettingsRow
            label="Qualidade das Fotos"
            description="Afeta o tamanho do arquivo e a nitidez das fotos dos itens."
          >
            <select
              id="image-quality-select"
              value={currentSettings.imageQuality}
              onChange={handleImageQualityChange}
              className={selectStyles({ className: 'w-full' })} // Reutilizando
            >
              {Object.entries(IMAGE_QUALITY_OPTIONS).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </SettingsRow>

          {/* Info Box fora da linha para ocupar a largura total */}
          <div className="py-4">
            <div className="p-3 bg-neutral-100 dark:bg-neutral-700-dark/50 rounded-md border border-neutral-200 dark:border-neutral-700-dark">
              <div className="font-semibold text-sm mb-1 text-neutral-600 dark:text-neutral-300-dark">
                {selectedQuality.label}
              </div>
              <div className="text-xs text-neutral-500 space-y-1">
                <div>
                  <span className="mr-2">📐</span>
                  {selectedQuality.description}
                </div>
                <div>
                  <span className="mr-2">📁</span>Tamanho:{' '}
                  {selectedQuality.fileSize}
                </div>
                <div>
                  <span className="mr-2">💡</span>
                  {selectedQuality.usage}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Gerenciamento de Locais - O Ponto de Entrada Final */}
      <section className="space-y-4">
        <SectionHeader title="Gerenciar Locais de Armazenamento" Icon={LocationIcon}/>

        {/* 2. Usando o ActionCard como um "portal" */}
        <ActionCard
          // O título e a descrição agora vivem dentro do nosso componente padronizado
          title="Estrutura do Inventário"
          description="Organize seu espaço físico criando uma hierarquia de locais para encontrar seus itens facilmente."
          actionSlot={
            // 3. O "botão" agora é uma linha de status clicável e informativa
            <button
              onClick={() => onNavigate(Page.LOCATION_MANAGER)}
              className="group w-full flex items-center justify-between p-4 bg-neutral-100 dark:bg-neutral-700-dark/50 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700-dark transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={`Abrir gerenciador de locais. ${locationManager.statistics.totalLocations} locais cadastrados.`}
            >
              {locationsLoading ? (
                <LoadingState />
              ) : (
                <>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-neutral-600 dark:text-neutral-300-dark">
                      Abrir Gerenciador
                    </span>
                    {/* --- SEÇÃO DE ESTATÍSTICAS REVISADA --- */}
                    <div className="flex items-center gap-4 overflow-x-auto scrollbar-hidden mt-2">
                      <StatItem
                        icon={Tree}
                        value={locationManager.statistics.totalLocations}
                        label="Total de Localizações"
                      />
                      <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700-dark flex-shrink-0" />
                      <StatItem
                        icon={Layers}
                        value={locationManager.statistics.maxDepth}
                        label="Profundidade Máxima"
                      />
                      <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700-dark flex-shrink-0" />
                      <StatItem
                        icon={Package}
                        value={locationManager.statistics.totalItems}
                        label="Total de Itens"
                      />
                      <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700-dark flex-shrink-0" />
                      <StatItem
                        icon={Tag}
                        value={locationManager.statistics.shortIdCacheSize}
                        label="IDs Curtos"
                      />
                    </div>
                  </div>
                  <ChevronUp className="h-6 w-6 text-neutral-400 group-hover:translate-x-1 transition-transform duration-200 rotate-90" />
                </>
              )}
            </button>
          }
        />
      </section>

      {/* Informações de Armazenamento */}
      <section className="space-y-4">
        <SectionHeader title="Armazenamento de Dados" Icon={CircleStack}/>

        <div className="bg-base dark:bg-neutral-800-dark p-6 rounded-lg shadow-card border border-neutral-200 dark:border-neutral-700-dark">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-md font-semibold text-neutral-600 dark:text-neutral-300-dark">
              Uso do Espaço Local
            </h3>
            <Button
              onClick={fetchStorageInfo}
              disabled={storageLoading || !getStorageSize}
              intent="secondary"
              size="sm"
            >
              <ArrowPath
                className={`h-4 w-4 mr-2 ${
                  storageLoading ? 'animate-spin' : ''
                }`}
              />
              {storageLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>

          {/* Conteúdo dinâmico com componentes padronizados */}
          {!getStorageSize ? (
            <Alert intent="info">
              A função de monitoramento de armazenamento não está disponível.
            </Alert>
          ) : storageError ? (
            <Alert intent="error">
              {storageError}{' '}
              <button
                onClick={fetchStorageInfo}
                className="font-semibold underline ml-2"
              >
                Tentar novamente
              </button>
            </Alert>
          ) : storageLoading ? (
            <LoadingState text="Carregando informações..." />
          ) : storageInfo ? (
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm text-neutral-500 mb-2">
                  <span>Espaço utilizado</span>
                  <span className="font-semibold">
                    {storageInfo.percentage}%
                  </span>
                </div>
                <ProgressBar percentage={storageInfo.percentage} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <StatCard
                  label="Espaço Usado"
                  value={formatBytes(storageInfo.used)}
                  intent="primary"
                />
                <StatCard
                  label="Espaço Total"
                  value={formatBytes(storageInfo.quota)}
                  intent="neutral"
                />
              </div>

              {storageInfo.percentage > 90 && (
                <Alert intent="error">
                  Espaço de armazenamento quase esgotado! Considere fazer
                  limpeza dos dados.
                </Alert>
              )}
              {storageInfo.percentage > 70 && storageInfo.percentage <= 90 && (
                <Alert intent="warning">
                  Espaço de armazenamento está ficando limitado. Monitore o uso.
                </Alert>
              )}

              <p className="text-xs text-neutral-500 pt-2 border-t border-neutral-200 dark:border-neutral-700-dark">
                O armazenamento local inclui todos os dados da aplicação, como
                itens e fotos, e fica salvo apenas no seu dispositivo.
              </p>
            </div>
          ) : null}
        </div>
      </section>

      {/* Seção de Gerenciamento de Dados */}
      <section className="space-y-4">
        <SectionHeader title="Gerenciamento de Dados" Icon={CircleStack}/>

        <div className="space-y-6 bg-base dark:bg-neutral-800-dark p-6 rounded-lg shadow-card border border-neutral-200 dark:border-neutral-700-dark">
          {/* Card de Exportação (seguro) */}
          <ActionCard
            intent="default"
            title="Exportar Dados"
            description="Salve uma cópia de segurança de todos os seus itens, movimentações e configurações em um arquivo JSON."
            actionSlot={
              <Button
                onClick={onExportData}
                intent="secondary"
                className="w-full sm:w-auto"
              >
                <ArrowDownTray className="h-5 w-5 mr-2" />
                Exportar Agora
              </Button>
            }
          />

          {/* Card de Importação (perigoso) */}
          <ActionCard
            intent="danger"
            title="Importar Dados"
            description={
              <>
                Restaure dados a partir de um arquivo JSON.
                <strong className="mt-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />
                  Esta ação substituirá todos os dados atuais.
                </strong>
              </>
            }
            actionSlot={
              <>
                <input
                  type="file"
                  id="file-import-input"
                  accept=".json"
                  onChange={onImportData}
                  ref={fileInputRef}
                  className="hidden"
                />
                <Button
                  onClick={handleImportClick}
                  intent="danger"
                  className="w-full sm:w-auto"
                >
                  <ArrowUpTray className="h-5 w-5 mr-2" />
                  Importar de Arquivo
                </Button>
              </>
            }
          />
        </div>
      </section>

      <LocationFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveLocation}
        initialData={editingLocation}
        allLocations={locationManager.nodes}
      />
      {ConfirmDialog}
    </div>
  );
};

export default SettingsPage;
