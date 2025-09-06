export interface Item {
  id: string;
  name: string;
  description: string;
  photo: string; // Base64 data URL
  quantity: number;
  minStock: number;
  price: number;
  createdAt: number; // timestamp
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
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

export interface AppSettings {
  theme: Theme;
  defaultMinStock: number;
  isPriceEnabled: boolean;
}

export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  isVisible?: boolean;
}