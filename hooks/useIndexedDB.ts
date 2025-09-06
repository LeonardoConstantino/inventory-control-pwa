import { useState, useEffect, useCallback } from 'react';

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

        const valueToStore =
          newValue instanceof Function ? newValue(value) : newValue;

        await writeToDB(key, valueToStore);
        setValue(valueToStore);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Erro desconhecido';
        setError(errorMessage);
        console.error('Erro ao atualizar valor:', err);
      } finally {
        setLoading(false);
      }
    },
    [key, value, writeToDB]
  );

  /**
   * Carrega valor inicial do IndexedDB
   */
  useEffect(() => {
    const loadInitialValue = async () => {
      try {
        setError(null);
        setLoading(true);

        const storedValue = await readFromDB(key);

        if (storedValue !== null) {
          setValue(storedValue);
        } else {
          // Se não existe valor armazenado, salva o valor inicial
          await writeToDB(key, initialValue);
        }
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
  }, [key, initialValue, readFromDB, writeToDB]);

  /**
   * Listener para mudanças no IndexedDB (simulação de storage event)
   * Nota: IndexedDB não tem evento nativo como localStorage,
   * mas podemos simular usando BroadcastChannel para sincronização entre abas
   */
  useEffect(() => {
    const channel = new BroadcastChannel(`indexeddb-${key}`);

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'update' && event.data.key === key) {
        // Só atualiza se o valor realmente mudou
        setValue((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(event.data.value)) {
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
   */
  const setValueWithBroadcast = useCallback(
    async (newValue: T | ((prevValue: T) => T)): Promise<void> => {
      let finalValue: T;
      if (typeof newValue === 'function') {
        // Use o valor atual do estado
        finalValue = (newValue as (prevValue: T) => T)(value);
      } else {
        finalValue = newValue;
      }

      await updateValue(finalValue);

      // Notifica outras abas sobre a mudança
      const channel = new BroadcastChannel(`indexeddb-${key}`);
      channel.postMessage({
        type: 'update',
        key,
        value: finalValue,
      });
      channel.close();
    },
    [key, updateValue] // Removido value
  );

  return {
    value,
    setValue: setValueWithBroadcast,
    loading,
    error,
  };
}

export default useIndexedDB;

// Exemplo de uso:
// const { value: userData, setValue: setUserData, loading, error } = useIndexedDB('user', { name: '', age: 0 });
//
// if (loading) return <div>Carregando...</div>;
// if (error) return <div>Erro: {error}</div>;
//
// return (
//   <div>
//     <p>Nome: {userData.name}</p>
//     <button onClick={() => setUserData(prev => ({ ...prev, name: 'João' }))}>
//       Atualizar Nome
//     </button>
//   </div>
// );
