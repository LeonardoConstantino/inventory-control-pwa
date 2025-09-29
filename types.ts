export interface Item {
  id: string;
  name: string;
  description: string;
  category: string[];
  photo: string; // Base64 data URL
  quantity: number;
  minStock: number;
  price: number;
  createdAt: number; // timestamp
  locationId: string | null;
}

export enum MovementType {
  ENTRY = 'entry',
  EXIT = 'exit',
}

export interface Movement {
  id: string;
  itemId: string;
  type: MovementType;
  quantity: number;
  timestamp: number;
}

export enum Page {
  INVENTORY,
  ITEM_FORM,
  ITEM_DETAIL,
  HISTORY,
  REPORT,
  SETTINGS,
  TUTORIAL
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export type ImageQuality = 'high' | 'medium' | 'low';

export interface AppSettings {
  theme: Theme;
  defaultMinStock: number;
  isPriceEnabled: boolean;
  imageQuality: ImageQuality;
}

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  isVisible?: boolean;
}

// Tipos para ordenação
export type SortOption = 'name' | 'quantity' | 'recent';
export interface LocationWithChildren {
  id: string;
  name: string;
  children: LocationWithChildren[];
}

export interface Location {
  id: string;
  name: string;
  parentId: string | null;
  metadata?: Record<string, any>;
  createdAt: string; // ISO string
}

export interface LocationInitialData {
  success: boolean;
  data: {
    nodes: LocationWithChildren[];
    locationItems: Location[];
    exportedAt: string;
  };
}

export interface LocationManager {
  // Estado (apenas leitura)
  nodes: Location[];
  locationItems: Map<string, Set<string>>; // Mapa de locationId para conjunto de itemIds

  // Operações de localização
  addLocation: (
    id: string,
    name: string,
    parentId: string | null,
    metadata?: object
  ) => { success: boolean; error?: string };
  removeLocation: (id: string) => {
    success: boolean;
    error?: string;
    removedIds?: string[];
  };
  updateLocation: (
    id: string,
    updates: Partial<Pick<Location, 'name' | 'metadata'>>
  ) => { success: boolean; error?: string };
  moveLocation: (
    id: string,
    newParentId: string | null
  ) => { success: boolean; error?: string };
  getLocation: (id: string) => {
    success: boolean;
    location?: Location;
    error?: string;
  };
  getLocationPath: (id: string) => {
    success: boolean;
    path?: Location[];
    error?: string;
  };
  searchLocations: (searchTerm: string) => {
    success: boolean;
    results?: Location[];
    error?: string;
  };

  // Operações de itens
  addItemToLocation: (
    locationId: string,
    itemId: string
  ) => { success: boolean; error?: string };
  removeItemFromLocation: (
    locationId: string,
    itemId: string
  ) => { success: boolean; error?: string };
  moveItem: (
    itemId: string,
    fromLocationId: string | null,
    toLocationId: string | null
  ) => { success: boolean; error?: string };

  // IDs Curtos
  generateShortId: (
    locationId: string,
    options: { strategy?: 'sequential' | 'hash' | 'smart'; prefix?: string; length?: number }
  ) => { success: boolean; shortId?: string; error?: string };
  removeShortId: (shortId: string) => { success: boolean; error?: string; fullId?: string };
  getFullIdFromShort: (shortId: string) => {
    success: boolean;
    fullId?: string;
    error?: string;
  };
  getShortIdMapping: () => {
    success: boolean;
    mapping?: {
      [key: string]: {
        fullId: string;
        locationName: string;
        generated: boolean;
      };
    };
    error?: string;
  };
  clearShortIdCache: () => { success: true };

  // Dados computados
  rootLocations: LocationWithChildren[];
  treeStructure: LocationWithChildren[];
  statistics: {
    totalLocations: number;
    totalItems: number;
    rootLocationsCount: number;
    maxDepth: number;
    shortIdCacheSize: number;
  };
  exportData: () => LocationInitialData;
  importData: (data: LocationInitialData) => {
    success: boolean;
    error?: string;
  };
}
