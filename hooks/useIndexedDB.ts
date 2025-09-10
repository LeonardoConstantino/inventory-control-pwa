import { useState, useEffect, useCallback, useRef } from 'react';

// Configurações do IndexedDB
const DB_NAME = 'AppStorage';
const DB_VERSION = 1;
const STORE_NAME = 'keyValueStore';

// Interface para tipagem do hook
interface IndexedDBHook<T> {
  value: T;
  setValue: (value: T | ((prevValue: T) => T)) => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook customizado para usar IndexedDB como storage persistente
 * @param key - Chave única para identificar o valor no storage
 * @param initialValue - Valor inicial caso não exista no storage
 * @returns Objeto com value, setValue, loading e error
 */
function useIndexedDB<T>(key: string, initialValue: T): IndexedDBHook<T> {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use useRef para evitar recriação de funções desnecessariamente
  const initialValueRef = useRef(initialValue);
  const hasInitialized = useRef(false);

  /**
   * Abre conexão com IndexedDB
   * Cria object store se não existir
   */
  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Erro ao abrir IndexedDB'));
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
    });
  }, []);

  /**
   * Lê valor do IndexedDB
   * @param key - Chave do valor a ser lido
   */
  const readFromDB = useCallback(
    async (key: string): Promise<T | null> => {
      try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
          const request = store.get(key);

          request.onerror = () => {
            reject(new Error('Erro ao ler do IndexedDB'));
          };

          request.onsuccess = () => {
            resolve(request.result !== undefined ? request.result : null);
          };
        });
      } catch (err) {
        console.error('Erro ao ler do IndexedDB:', err);
        return null;
      }
    },
    [openDB]
  );

  /**
   * Escreve valor no IndexedDB
   * @param key - Chave do valor
   * @param value - Valor a ser armazenado
   */
  const writeToDB = useCallback(
    async (key: string, value: T): Promise<void> => {
      try {
        const db = await openDB();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        return new Promise((resolve, reject) => {
          const request = store.put(value, key);

          request.onerror = () => {
            reject(new Error('Erro ao escrever no IndexedDB'));
          };

          request.onsuccess = () => {
            resolve();
          };
        });
      } catch (err) {
        throw new Error(`Erro ao escrever no IndexedDB: ${err}`);
      }
    },
    [openDB]
  );

  /**
   * Função para atualizar valor
   * Suporta tanto valor direto quanto função de atualização
   */
  const updateValue = useCallback(
    async (newValue: T | ((prevValue: T) => T)): Promise<void> => {
      try {
        setError(null);
        setLoading(true);

        // Use setValue funcional para obter o valor mais atual
        let valueToStore: T;

        if (typeof newValue === 'function') {
          setValue((currentValue) => {
            valueToStore = (newValue as (prevValue: T) => T)(currentValue);
            return valueToStore;
          });
        } else {
          valueToStore = newValue;
          setValue(valueToStore);
        }

        await writeToDB(key, valueToStore);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro ao atualizar valor:', err);
      } finally {
        setLoading(false);
      }
    },
    [key, writeToDB] // CORREÇÃO: Removido 'value' das dependências
  );

  /**
   * Carrega valor inicial do IndexedDB
   * CORREÇÃO: Usar useRef para evitar loop infinito
   */
  useEffect(() => {
    // Evita execução múltipla
    if (hasInitialized.current) return;

    const loadInitialValue = async () => {
      try {
        setError(null);
        setLoading(true);

        const storedValue = await readFromDB(key);

        if (storedValue !== null) {
          setValue(storedValue);
        } else {
          // Se não existe valor armazenado, salva o valor inicial
          await writeToDB(key, initialValueRef.current);
          setValue(initialValueRef.current);
        }

        hasInitialized.current = true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro ao carregar valor inicial';
        setError(errorMessage);
        console.error('Erro ao carregar valor inicial:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialValue();
  }, [key, readFromDB, writeToDB]); // CORREÇÃO: Removido initialValue das dependências

  /**
   * Listener para mudanças no IndexedDB (simulação de storage event)
   */
  useEffect(() => {
    const channel = new BroadcastChannel(`indexeddb-${key}`);

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'update' && event.data.key === key) {
        setValue((prev) => {
          // Comparação mais segura para evitar updates desnecessários
          const prevStr = JSON.stringify(prev);
          const newStr = JSON.stringify(event.data.value);

          if (prevStr !== newStr) {
            return event.data.value;
          }
          return prev;
        });
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [key]);

  /**
   * Função wrapper que também notifica outras abas via BroadcastChannel
   * CORREÇÃO: Simplificada para evitar problemas de dependência
   */
  const setValueWithBroadcast = useCallback(
    async (newValue: T | ((prevValue: T) => T)): Promise<void> => {
      await updateValue(newValue);

      // Notifica outras abas usando o valor mais atual
      setValue((currentValue) => {
        const channel = new BroadcastChannel(`indexeddb-${key}`);
        channel.postMessage({
          type: 'update',
          key,
          value: currentValue,
        });
        channel.close();
        return currentValue; // Não modifica o valor, apenas notifica
      });
    },
    [key, updateValue] // CORREÇÃO: Dependências corretas
  );

  // Atualizar initialValueRef se initialValue mudar
  useEffect(() => {
    initialValueRef.current = initialValue;
  }, [initialValue]);

  return {
    value,
    setValue: setValueWithBroadcast,
    loading,
    error,
  };
}

export default useIndexedDB;
