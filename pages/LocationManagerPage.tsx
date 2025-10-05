import React, { useState, useMemo } from 'react';
import useConfirm from '../hooks/useConfirm';
import { LocationManager } from '../types';
import HeaderIconButton from '../components/HeaderIconButton';
import LocationListItem from '../components/LocationListItem';
import LocationFormModal from '../components/LocationFormModal';
import LocationTreeViewer from '../components/LocationTreeViewer';
import EmptyState from '../components/EmptyState';
import { Add, BoxOpen, ArrowLeft, Tree, Close } from '../components/Icons';

interface LocationManagerPageProps {
  locationManager: LocationManager;
  onNavigateBack: () => void;
}

const LocationManagerPage: React.FC<LocationManagerPageProps> = ({
  locationManager,
  onNavigateBack,
}) => {
  // Estado para controlar o nível atual da hierarquia. `null` significa a raiz.
  const [currentParentId, setCurrentParentId] = useState<string | null>(null);

  // Estado para o modal de Adicionar/Editar
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const [isTreeViewer, setIsTreeViewer] = useState<boolean>(false);

  // Filtra as localizações para mostrar apenas os filhos do nível atual
  const currentLocations = useMemo(
    () =>
      locationManager.nodes
        .filter((node) => node.parentId === currentParentId)
        .sort((a, b) => a.name.localeCompare(b.name)),
    [currentParentId, locationManager.nodes]
  );

  // Gera os breadcrumbs para a navegação
  const breadcrumbs = useMemo(() => {
    if (!currentParentId) return [{ id: null, name: 'Raiz' }];
    const result = locationManager.getLocationPath(currentParentId);
    if (result.success && result.path) {
      return [{ id: null, name: 'Raiz' }, ...result.path];
    }
    return [{ id: null, name: 'Raiz' }];
  }, [currentParentId, locationManager]);

  const currentParent = locationManager.nodes.find(
    (n) => n.id === currentParentId
  );

  const { confirm, ConfirmDialog } = useConfirm();

  // --- Funções de Navegação e Ações ---

  const navigateToChildren = (locationId: string) => {
    setCurrentParentId(locationId);
  };

  const navigateToBreadcrumb = (locationId: string | null) => {
    setCurrentParentId(locationId);
  };

  const handleOpenAddModal = () => {
    setEditingLocation({ parentId: currentParentId });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (location: Location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
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
      locationManager.updateLocation(data.id, { name: data.name });
    } else {
      // Criando
      const newId = `loc-${Date.now()}`;
      locationManager.addLocation(newId, data.name, data.parentId);
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    const result = await confirm({
      message:
        'Isso removerá esta localização e TODAS as suas sub-localizações.',
      intent: 'danger',
      title: 'Tem certeza?',
      confirmText: 'Sim, excluir',
      cancelText: 'Não, manter',
    });
    if (result) {
      locationManager.removeLocation(locationId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full bg-neutral dark:bg-gray-900">
      {/* Header Fixo - simulado aqui, deve ser melhorado */}
      <header className="bg-primary text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-10">
        <div className="flex items-center min-w-0">
          <HeaderIconButton
            onClick={
              isTreeViewer
                ? () => setIsTreeViewer(!isTreeViewer)
                : currentParentId
                ? () => navigateToBreadcrumb(currentParent?.parentId || null)
                : onNavigateBack
            }
            className="mr-2" // Ajustado o espaçamento
            aria-label="Voltar"
          >
            <ArrowLeft className="h-6 w-6" />
          </HeaderIconButton>
          <h1 className="text-xl font-bold truncate select-none">
            {currentParent?.name || 'Localizações'}
          </h1>
        </div>

        {currentLocations.length !== 0 && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <HeaderIconButton
              onClick={() => {
                setIsTreeViewer(!isTreeViewer);
                setCurrentParentId(null);
              }}
              aria-label="Visualizar arvore"
            >
              {isTreeViewer ? (
                <Close className="h-6 w-6" />
              ) : (
                <Tree className="h-6 w-6" />
              )}
            </HeaderIconButton>
          </div>
        )}
      </header>

      {isTreeViewer ? (
        <LocationTreeViewer locations={locationManager.treeStructure} />
      ) : (
        <>
          {/* Breadcrumbs Navegáveis */}
          <div className="p-3 bg-base dark:bg-neutral-800-dark border-b border-neutral-200 dark:border-neutral-700-dark text-sm overflow-x-auto whitespace-nowrap">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.id || 'root'}>
                <button
                  onClick={() => navigateToBreadcrumb(crumb.id)}
                  className={`${
                    index === breadcrumbs.length - 1
                      ? 'font-semibold text-neutral-600 dark:text-neutral-300-dark'
                      : 'hover:underline text-neutral-500 cursor-pointer'
                  }`}
                  disabled={index === breadcrumbs.length - 1}
                >
                  {crumb.name}
                </button>
                {index < breadcrumbs.length - 1 && (
                  <ArrowLeft className="h-4 w-4 inline-block mx-1 text-neutral-400 rotate-180" />
                )}
              </span>
            ))}
          </div>

          {/* Lista de Localizações */}
          <main className="flex-1 overflow-y-auto p-2">
            {currentLocations.length > 0 ? (
              <ul className="space-y-2">
                {currentLocations.map((location) => {
                  const node = locationManager.nodes.filter(
                    (n) => n.parentId === location.id
                  );

                  return (
                    <LocationListItem
                      key={location.id}
                      location={location}
                      childCount={node.length}
                      onNavigate={() => navigateToChildren(location.id)}
                      onEdit={() => handleOpenEditModal(location)}
                      onDelete={() => handleDeleteLocation(location.id)}
                      onRemoveShortId={() =>
                        locationManager.removeShortId(location.metadata.shortId)
                      }
                      onGenerateShortId={() =>
                        locationManager.generateShortId(location.id)
                      }
                      itens={locationManager.locationItems[location.id]}
                    />
                  );
                })}
              </ul>
            ) : (
              <EmptyState
                icon={<BoxOpen className="mx-auto h-16 w-16 text-gray-400" />}
                title="Nenhum sub-local aqui"
                message="Adicione um novo local neste nível usando o botão abaixo."
              />
            )}
          </main>

          {/* Botão Flutuante (FAB) */}
          <button
            onClick={handleOpenAddModal}
            className="fixed bottom-4 right-4 
             
             // 1. Identidade visual coesa
             bg-primary text-white rounded-full p-4 shadow-fab
             hover:bg-primary-dark
             
             // 2. Microinterações refinadas
             transition-all duration-200 ease-in-out transform
             hover:scale-105 active:scale-95
             
             // 3. Acessibilidade
             focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
          >
            <Add className="h-8 w-8 transition-transform duration-200" />
          </button>

          {/* Modal de Formulário */}
          <LocationFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveLocation}
            initialData={editingLocation}
            allLocations={locationManager.nodes} // Passado para o seletor de pai dentro do modal
          />
          {ConfirmDialog}
        </>
      )}
    </div>
  );
};

export default LocationManagerPage;
