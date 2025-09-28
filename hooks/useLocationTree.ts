import { useState, useCallback, useMemo, useRef } from 'react';

let debug = 0;
const debugLevel = [ 'log', 'warn', 'error' ];
const Debugger = {
  log: (...args) => {
    if (debug === 0) {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (debug >= 1) {
      console.warn(...args);
    }
  },
  error: (...args) => {
    if (debug >= 2) {
      console.error(...args);
    }
  },
};

interface LocationNode {
  id: string;
  name: string;
  metadata?: Record<string, any>;
  updatedAt: string;
  // outras propriedades, se necessário
}

/**
 * Hook para gerenciamento de árvore de localizações físicas
 * Cada nó representa uma localização que pode conter itens e ter nós filhos
 *
 * PERFORMANCE: Utiliza Maps para acesso O(1) e caches para operações custosas
 * INVARIANT: A árvore nunca terá ciclos e mantém consistência pai-filho bidirecional
 */
const useLocationTree = (initialData = null) => {
  // Estados principais: armazena todos os nós da árvore
  const [nodes, setNodes] = useState(() => {
    if (initialData) return initialData;
    return new Map(); // Map<id, node> para acesso O(1)
  });

  // Estado para itens associados a cada localização
  const [locationItems, setLocationItems] = useState(() => {
    return new Map(); // Map<locationId, Set<itemId>>
  });

  // Caches para otimização de performance
  const pathCache = useRef(new Map()); // Cache para caminhos computados
  const depthCache = useRef(new Map()); // Cache para profundidades
  const cacheVersion = useRef(0); // Versão do cache para invalidação

  // Cache para IDs curtos gerados (evita duplicatas e melhora performance)
  const shortIdCache = useRef(new Map()); // Map<shortId, fullId>
  const shortIdCounter = useRef(new Map()); // Map<prefix, counter> para sequencial
  const [shortIdCacheVersion, setShortIdCacheVersion] = useState(0);

  // =============================================================================
  // MÉTODOS PRIVADOS - Utilitários e operações internas
  // =============================================================================

  /**
   * Invalida todos os caches quando a estrutura da árvore muda
   * PERFORMANCE: O(1) - apenas incrementa versão ao invés de limpar Maps
   */
  const _invalidateCache = useCallback(() => {
    cacheVersion.current += 1;
    pathCache.current.clear();
    depthCache.current.clear();
  }, []);

  /**
   * Valida se um ID é válido (string não vazia)
   * @param {*} id - ID a ser validado
   * @returns {Object} - {isValid: boolean, error?: string}
   */
  const _validateId = useCallback((id) => {
    if (typeof id !== 'string' || id.trim() === '') {
      return { isValid: false, error: 'ID deve ser uma string não vazia' };
    }
    return { isValid: true };
  }, []);

  /**
   * Valida se um nome é válido
   * @param {*} name - Nome a ser validado
   * @returns {Object} - {isValid: boolean, error?: string}
   */
  const _validateName = useCallback((name) => {
    if (typeof name !== 'string' || name.trim() === '') {
      return { isValid: false, error: 'Nome deve ser uma string não vazia' };
    }
    return { isValid: true };
  }, []);

  /**
   * Verifica se um nó é descendente de outro (para prevenir ciclos)
   * PERFORMANCE: O(depth) onde depth é a profundidade máxima
   * @param {string} ancestorId - ID do possível ancestral
   * @param {string} descendantId - ID do possível descendente
   * @param {Map} nodesMap - Map de nós atual
   * @returns {boolean} - true se for descendente
   */
  const _isDescendant = useCallback((ancestorId, descendantId, nodesMap) => {
    if (!descendantId || ancestorId === descendantId) return false;

    let currentId = descendantId;
    const visited = new Set(); // Proteção contra ciclos existentes

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const node = nodesMap.get(currentId);
      if (!node) break;
      if (node.parentId === ancestorId) return true;
      currentId = node.parentId;
    }

    return false;
  }, []);

  /**
   * Remove recursivamente um nó e todos os seus descendentes
   * PERFORMANCE: O(descendants) onde descendants é o número total de descendentes
   * @param {string} nodeId - ID do nó a ser removido
   * @param {Map} nodesMap - Map de nós (será modificado)
   * @param {Set} removedIds - Set para coletar IDs removidos
   */
  const _removeNodeRecursive = useCallback((nodeId, nodesMap, removedIds) => {
    const node = nodesMap.get(nodeId);
    if (!node) return;

    // Remove todos os filhos recursivamente
    const childrenArray = Array.from(node.children);
    childrenArray.forEach((childId) => {
      _removeNodeRecursive(childId, nodesMap, removedIds);
    });

    // Remove o nó atual
    nodesMap.delete(nodeId);
    removedIds.add(nodeId);
  }, []);

  /**
   * Atualiza as referências pai-filho de forma consistente
   * PERFORMANCE: O(1) - operações diretas no Map
   * @param {Map} nodesMap - Map de nós
   * @param {string} childId - ID do nó filho
   * @param {string|null} oldParentId - ID do pai anterior
   * @param {string|null} newParentId - ID do novo pai
   */
  const _updateParentChildReferences = useCallback(
    (nodesMap, childId, oldParentId, newParentId) => {
      // Remove do pai anterior
      if (oldParentId) {
        const oldParent = nodesMap.get(oldParentId);
        if (oldParent) {
          const newChildren = new Set(oldParent.children);
          newChildren.delete(childId);
          nodesMap.set(oldParentId, { ...oldParent, children: newChildren });
        }
      }

      // Adiciona ao novo pai
      if (newParentId) {
        const newParent = nodesMap.get(newParentId);
        if (newParent) {
          const newChildren = new Set(newParent.children);
          newChildren.add(childId);
          nodesMap.set(newParentId, { ...newParent, children: newChildren });
        }
      }
    },
    []
  );

  /**
   * Computa o caminho de um nó com cache para otimização
   * PERFORMANCE: O(1) se cacheado, O(depth) no primeiro cálculo
   * @param {string} nodeId - ID do nó
   * @param {Map} nodesMap - Map de nós
   * @returns {Array} - Array com o caminho completo
   */
  const _computePath = useCallback((nodeId, nodesMap) => {
    const cacheKey = `${cacheVersion.current}-${nodeId}`;

    if (pathCache.current.has(cacheKey)) {
      return pathCache.current.get(cacheKey);
    }

    const path = [];
    let currentId = nodeId;
    const visited = new Set(); // Proteção contra ciclos

    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const node = nodesMap.get(currentId);
      if (!node) break;
      path.unshift(node);
      currentId = node.parentId;
    }

    pathCache.current.set(cacheKey, path);
    return path;
  }, []);

  /**
   * Computa a profundidade de um nó com cache
   * PERFORMANCE: O(1) se cacheado, O(depth) no primeiro cálculo
   * @param {string} nodeId - ID do nó
   * @param {Map} nodesMap - Map de nós
   * @returns {number} - Profundidade do nó (raiz = 1)
   */
  const _computeDepth = useCallback(
    (nodeId, nodesMap) => {
      const cacheKey = `${cacheVersion.current}-${nodeId}`;

      if (depthCache.current.has(cacheKey)) {
        return depthCache.current.get(cacheKey);
      }

      const path = _computePath(nodeId, nodesMap);
      const depth = path.length;

      depthCache.current.set(cacheKey, depth);
      return depth;
    },
    [_computePath]
  );

  /**
   * Constrói árvore hierárquica recursivamente com otimizações
   * PERFORMANCE: O(n) onde n é o número de nós
   * @param {string|null} parentId - ID do pai (null para raiz)
   * @param {Map} nodesMap - Map de nós
   * @param {Map} itemsMap - Map de itens
   * @returns {Array} - Array de nós filhos
   */
  const _buildTreeStructure = useCallback((parentId, nodesMap, itemsMap) => {
    const children = [];

    // Itera sobre todos os nós e filtra por parentId
    // PERFORMANCE: Poderia ser otimizado com índice reverso, mas mantém simplicidade
    nodesMap.forEach((node) => {
      if (node.parentId === parentId) {
        children.push({
          ...node,
          children: _buildTreeStructure(node.id, nodesMap, itemsMap),
          items: Array.from(itemsMap.get(node.id) || []),
        });
      }
    });

    return children;
  }, []);

  /**
   * Gera um ID curto para identificação visual rápida
   * PERFORMANCE: O(1) com cache, O(log n) para verificação de unicidade
   * FORMATO: [PREFIXO][SEQUENCIAL] ou [HASH_CURTO]
   *
   * @param {string} fullId - ID completo da localização
   * @param {Object} options - Opções de geração
   * @param {string} options.strategy - 'sequential' | 'hash' | 'smart' (default: 'smart')
   * @param {string} options.prefix - Prefixo personalizado (apenas para sequential)
   * @param {number} options.length - Tamanho do ID gerado (default: 4)
   * @returns {string} - ID curto único
   */
  const _generateShortId = useCallback(
    (
      fullId: string,
      options: { strategy?: string; prefix?: string; length?: number } = {}
    ): string => {
      const { strategy = 'smart', prefix = 'L', length = 4 } = options;

      // Verifica se já existe um ID curto para este fullId
      for (const [shortId, cachedFullId] of shortIdCache.current) {
        if (cachedFullId === fullId) {
          return shortId;
        }
      }

      let shortId;

      switch (strategy) {
        case 'sequential':
          // Formato: L001, L002, etc.
          const currentCount = shortIdCounter.current.get(prefix) || 0;
          const newCount = currentCount + 1;
          shortIdCounter.current.set(prefix, newCount);
          shortId = `${prefix}${newCount
            .toString()
            .padStart(length - prefix.length, '0')}`;
          break;

        case 'hash':
          // Formato: Hash dos primeiros caracteres do ID
          shortId = fullId
            .split('')
            .reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0)
            .toString(36)
            .substr(0, length)
            .toUpperCase();
          break;

        case 'smart':
        default:
          // Estratégia inteligente: usa iniciais do nome + sequencial determinístico
          const node = nodes.get(fullId);
          if (node && node.name) {
            // Extrai iniciais do nome (máximo 2 caracteres)
            const nameInitials = node.name
              .split(' ')
              .map((word) => word.charAt(0).toUpperCase())
              .join('')
              .substr(0, 2);

            // Usa implementação sequencial para garantir determinismo
            const smartPrefix = nameInitials;
            const currentSmartCount =
              shortIdCounter.current.get(smartPrefix) || 0;
            const newSmartCount = currentSmartCount + 1;
            shortIdCounter.current.set(smartPrefix, newSmartCount);

            // Calcula o tamanho disponível para o número sequencial
            const availableLength = length - smartPrefix.length;
            const sequentialPart = newSmartCount
              .toString()
              .padStart(Math.max(availableLength, 1), '0');

            shortId = `${smartPrefix}${sequentialPart}`;
          } else {
            // Fallback: usa estratégia sequential padrão se não houver nome
            const fallbackPrefix = 'N'; // N de "No name"
            const currentFallbackCount =
              shortIdCounter.current.get(fallbackPrefix) || 0;
            const newFallbackCount = currentFallbackCount + 1;
            shortIdCounter.current.set(fallbackPrefix, newFallbackCount);
            shortId = `${fallbackPrefix}${newFallbackCount
              .toString()
              .padStart(length - fallbackPrefix.length, '0')}`;
          }
          break;
      }

      // Garante unicidade (backup de segurança, não deveria ser necessário com sequencial)
      let counter = 1;
      let originalShortId = shortId;
      while (shortIdCache.current.has(shortId)) {
        shortId = `${originalShortId.slice(0, -1)}${counter}`;
        counter++;
      }

      // Armazena no cache
      shortIdCache.current.set(shortId, fullId);
      return shortId;
    },
    [nodes]
  );

  // =============================================================================
  // MÉTODOS PÚBLICOS - API externa do hook
  // =============================================================================

  /**
   * Cria um novo nó de localização
   * PERFORMANCE: O(1) - operações diretas no Map
   * @param {string} id - ID único do nó
   * @param {string} name - Nome da localização
   * @param {string|null} parentId - ID do nó pai (null para raiz)
   * @param {Object} metadata - Dados adicionais (opcional)
   * @returns {Object} - {success: boolean, error?: string}
   */
  const addLocation = useCallback(
    (id, name, parentId = null, metadata = {}) => {
      // Validações de entrada
      const idValidation = _validateId(id);
      if (!idValidation.isValid) {
        Debugger.warn(`addLocation: ${idValidation.error}`);
        return { success: false, error: idValidation.error };
      }

      const nameValidation = _validateName(name);
      if (!nameValidation.isValid) {
        Debugger.warn(`addLocation: ${nameValidation.error}`);
        return { success: false, error: nameValidation.error };
      }

      // Validação de parentId se fornecido
      if (parentId) {
        const parentValidation = _validateId(parentId);
        if (!parentValidation.isValid) {
          Debugger.warn(`addLocation: Parent ${parentValidation.error}`);
          return { success: false, error: `Parent ${parentValidation.error}` };
        }
      }

      let operationError = null;

      setNodes((prevNodes) => {
        // Verifica se o ID já existe
        if (prevNodes.has(id)) {
          operationError = `Localização com ID '${id}' já existe`;
          Debugger.warn(`addLocation: ${operationError}`);
          return prevNodes;
        }

        // Verifica se o pai existe (se especificado)
        if (parentId && !prevNodes.has(parentId)) {
          operationError = `Localização pai '${parentId}' não encontrada`;
          Debugger.warn(`addLocation: ${operationError}`);
          return prevNodes;
        }

        const newNodes = new Map(prevNodes);

        // Cria o novo nó
        const newNode = {
          id,
          name: name.trim(),
          parentId,
          children: new Set(),
          metadata: { ...metadata },
          createdAt: new Date().toISOString(),
        };

        // Adiciona o nó ao mapa
        newNodes.set(id, newNode);

        // Atualiza as referências pai-filho
        _updateParentChildReferences(newNodes, id, null, parentId);

        _invalidateCache();
        return newNodes;
      });

      // Inicializa a lista de itens para esta localização
      setLocationItems((prevItems) => {
        const newItems = new Map(prevItems);
        if (!newItems.has(id)) {
          newItems.set(id, new Set());
        }
        return newItems;
      });

      if (operationError) {
        return { success: false, error: operationError };
      }

      return { success: true };
    },
    [_validateId, _validateName, _updateParentChildReferences, _invalidateCache]
  );

  /**
   * Remove uma localização e todos os seus filhos
   * PERFORMANCE: O(descendants) onde descendants é o número de descendentes
   * @param {string} id - ID da localização a ser removida
   * @returns {Object} - {success: boolean, error?: string, removedIds?: string[]}
   */
  const removeLocation = useCallback(
    (id) => {
      const idValidation = _validateId(id);
      if (!idValidation.isValid) {
        Debugger.warn(`removeLocation: ${idValidation.error}`);
        return { success: false, error: idValidation.error };
      }

      let operationError = null;
      const removedIds = new Set();

      setNodes((prevNodes) => {
        const nodeToRemove = prevNodes.get(id);

        const shortId = Array.from(shortIdCache.current.entries()).find(
          ([, fullId]) => fullId === id
        )?.[0];

        if (shortId) {
          const result = removeShortId(shortId || '');
          if (!result.success) {
            operationError = result.error || 'Erro ao remover shortId';
            Debugger.warn(`removeLocation: ${operationError}`);
            return prevNodes;
          }
        }

        if (!nodeToRemove) {
          operationError = `Localização '${id}' não encontrada`;
          Debugger.warn(`removeLocation: ${operationError}`);
          return prevNodes;
        }

        if (!nodeToRemove) {
          operationError = `Localização '${id}' não encontrada`;
          Debugger.warn(`removeLocation: ${operationError}`);
          return prevNodes;
        }

        const newNodes = new Map(prevNodes);

        // Remove recursivamente todos os filhos
        _removeNodeRecursive(id, newNodes, removedIds);

        // Atualiza referências do pai
        _updateParentChildReferences(newNodes, id, nodeToRemove.parentId, null);

        _invalidateCache();
        return newNodes;
      });

      // Remove os itens associados a todos os nós removidos
      setLocationItems((prevItems) => {
        const newItems = new Map(prevItems);
        removedIds.forEach((removedId) => {
          newItems.delete(removedId);
        });
        return newItems;
      });

      if (operationError) {
        return { success: false, error: operationError };
      }

      return { success: true, removedIds: Array.from(removedIds) };
    },
    [
      _validateId,
      _removeNodeRecursive,
      _updateParentChildReferences,
      _invalidateCache,
    ]
  );

  /**
   * Atualiza os dados de uma localização existente
   * @param {string} id - ID da localização a ser atualizada
   * @param {Object} updates - Objeto com os campos a serem atualizados
   * @param {string} updates.name - Novo nome da localização (opcional)
   * @param {Object} updates.metadata - Novos metadados (opcional, será mesclado)
   * @returns {Object} - {success: boolean, error?: string}
   */
  const updateLocation = useCallback(
    (id: string, updates: Partial<Pick<LocationNode, 'name' | 'metadata'>>) => {
      let operationError = null;
      setNodes((prevNodes) => {
        const newNodes = new Map<string, LocationNode>(prevNodes);
        const existingNode = newNodes.get(id);

        if (!existingNode) {
          operationError = `Localização '${id}' não encontrada`;
          Debugger.warn(`Localização '${id}' não encontrada para atualização`);
          return prevNodes;
        }

        if (typeof existingNode === 'object' && 'name' in existingNode) {
          const updatedNode: LocationNode = {
            ...existingNode,
            ...(updates.name && { name: updates.name }),
            ...(updates.metadata &&
              existingNode?.metadata && {
                metadata: { ...existingNode.metadata, ...updates.metadata },
              }),
            updatedAt: new Date().toISOString(),
          };

          newNodes.set(id, updatedNode);
          return newNodes;
        }
      });

      if (operationError) {
        return { success: false, error: operationError };
      }

      return { success: true };
    },
    []
  );

  /**
   * Move uma localização para outro pai
   * PERFORMANCE: O(depth) para verificação de ciclos
   * @param {string} locationId - ID da localização a ser movida
   * @param {string|null} newParentId - ID do novo pai (null para raiz)
   * @returns {Object} - {success: boolean, error?: string}
   */
  const moveLocation = useCallback(
    (locationId, newParentId) => {
      const idValidation = _validateId(locationId);
      if (!idValidation.isValid) {
        Debugger.warn(`moveLocation: Location ${idValidation.error}`);
        return { success: false, error: `Location ${idValidation.error}` };
      }

      if (newParentId) {
        const parentValidation = _validateId(newParentId);
        if (!parentValidation.isValid) {
          Debugger.warn(`moveLocation: Parent ${parentValidation.error}`);
          return { success: false, error: `Parent ${parentValidation.error}` };
        }
      }

      let operationError = null;

      setNodes((prevNodes) => {
        const locationToMove = prevNodes.get(locationId);

        if (!locationToMove) {
          operationError = `Localização '${locationId}' não encontrada`;
          Debugger.warn(`moveLocation: ${operationError}`);
          return prevNodes;
        }

        // Verifica se o novo pai existe
        if (newParentId && !prevNodes.has(newParentId)) {
          operationError = `Nova localização pai '${newParentId}' não encontrada`;
          Debugger.warn(`moveLocation: ${operationError}`);
          return prevNodes;
        }

        // Evita movimento para si mesmo
        if (locationId === newParentId) {
          operationError = 'Localização não pode ser pai de si mesma';
          Debugger.warn(`moveLocation: ${operationError}`);
          return prevNodes;
        }

        // Evita ciclos: verifica se o novo pai não é descendente da localização
        if (newParentId && _isDescendant(locationId, newParentId, prevNodes)) {
          operationError = 'Movimento criaria um ciclo na árvore';
          Debugger.warn(`moveLocation: ${operationError}`);
          return prevNodes;
        }

        const newNodes = new Map(prevNodes);

        // Atualiza as referências pai-filho
        _updateParentChildReferences(
          newNodes,
          locationId,
          locationToMove.parentId,
          newParentId
        );

        // Atualiza o nó movido
        const updatedNode = { ...locationToMove, parentId: newParentId };
        newNodes.set(locationId, updatedNode);

        _invalidateCache();
        return newNodes;
      });

      if (operationError) {
        return { success: false, error: operationError };
      }

      return { success: true };
    },
    [_validateId, _isDescendant, _updateParentChildReferences, _invalidateCache]
  );

  /**
   * Adiciona um item a uma localização
   * PERFORMANCE: O(1) - operação direta no Set
   * @param {string} locationId - ID da localização
   * @param {string} itemId - ID do item
   * @returns {Object} - {success: boolean, error?: string}
   */
  const addItemToLocation = useCallback(
    (locationId, itemId) => {
      const locationValidation = _validateId(locationId);
      if (!locationValidation.isValid) {
        Debugger.warn(`addItemToLocation: Location ${locationValidation.error}`);
        return {
          success: false,
          error: `Location ${locationValidation.error}`,
        };
      }

      const itemValidation = _validateId(itemId);
      if (!itemValidation.isValid) {
        Debugger.warn(`addItemToLocation: Item ${itemValidation.error}`);
        return { success: false, error: `Item ${itemValidation.error}` };
      }

      if (!nodes.has(locationId)) {
        const error = `Localização '${locationId}' não encontrada`;
        Debugger.warn(`addItemToLocation: ${error}`);
        return { success: false, error };
      }

      setLocationItems((prevItems) => {
        const newItems = new Map<string, Set<string>>(prevItems);
        const locationItemSet = newItems.get(locationId) || new Set();

        // Evita recriação desnecessária se o item já existe
        if (locationItemSet.has(itemId)) {
          return prevItems;
        }

        const newSet = new Set(locationItemSet);
        newSet.add(itemId);
        newItems.set(locationId, newSet);
        return newItems;
      });

      return { success: true };
    },
    [_validateId, nodes]
  );

  /**
   * Remove um item de uma localização
   * PERFORMANCE: O(1) - operação direta no Set
   * @param {string} locationId - ID da localização
   * @param {string} itemId - ID do item
   * @returns {Object} - {success: boolean, error?: string}
   */
  const removeItemFromLocation = useCallback(
    (locationId, itemId) => {
      const locationValidation = _validateId(locationId);
      if (!locationValidation.isValid) {
        Debugger.warn(
          `removeItemFromLocation: Location ${locationValidation.error}`
        );
        return {
          success: false,
          error: `Location ${locationValidation.error}`,
        };
      }

      const itemValidation = _validateId(itemId);
      if (!itemValidation.isValid) {
        Debugger.warn(`removeItemFromLocation: Item ${itemValidation.error}`);
        return { success: false, error: `Item ${itemValidation.error}` };
      }

      let itemRemoved = false;

      setLocationItems((prevItems) => {
        const newItems = new Map<string, Set<string>>(prevItems);
        const locationItemSet = newItems.get(locationId);

        if (locationItemSet && locationItemSet.has(itemId)) {
          const newSet = new Set(locationItemSet);
          newSet.delete(itemId);
          newItems.set(locationId, newSet);
          itemRemoved = true;
          return newItems;
        }

        return prevItems;
      });

      if (!itemRemoved) {
        const error = `Item '${itemId}' não encontrado na localização '${locationId}'`;
        Debugger.warn(`removeItemFromLocation: ${error}`);
        return { success: false, error };
      }

      return { success: true };
    },
    [_validateId]
  );

  /**
   * Move um item de uma localização para outra
   * PERFORMANCE: O(1) - operações diretas nos Sets
   * @param {string} itemId - ID do item
   * @param {string} fromLocationId - ID da localização origem
   * @param {string} toLocationId - ID da localização destino
   * @returns {Object} - {success: boolean, error?: string}
   */
  const moveItem = useCallback(
    (itemId, fromLocationId, toLocationId) => {
      const itemValidation = _validateId(itemId);
      if (!itemValidation.isValid) {
        Debugger.warn(`moveItem: Item ${itemValidation.error}`);
        return { success: false, error: `Item ${itemValidation.error}` };
      }

      if (fromLocationId) {
        const fromValidation = _validateId(fromLocationId);
        if (!fromValidation.isValid) {
          Debugger.warn(`moveItem: From location ${fromValidation.error}`);
          return {
            success: false,
            error: `From location ${fromValidation.error}`,
          };
        }
      }

      const toValidation = _validateId(toLocationId);
      if (!toValidation.isValid) {
        Debugger.warn(`moveItem: To location ${toValidation.error}`);
        return { success: false, error: `To location ${toValidation.error}` };
      }

      if (!nodes.has(toLocationId)) {
        const error = `Localização destino '${toLocationId}' não encontrada`;
        Debugger.warn(`moveItem: ${error}`);
        return { success: false, error };
      }

      let operationError = null;

      setLocationItems((prevItems) => {
        const newItems = new Map<string, Set<string>>(prevItems);
        // Remove da localização origem se especificada
        if (fromLocationId) {
          const fromSet = newItems.get(fromLocationId);
          if (fromSet && fromSet.has(itemId)) {
            const newFromSet = new Set(fromSet);
            newFromSet.delete(itemId);
            newItems.set(fromLocationId, newFromSet);
          } else if (fromSet) {
            operationError = `Item '${itemId}' não encontrado na localização origem '${fromLocationId}'`;
            Debugger.warn(`moveItem: ${operationError}`);
          }
        }

        // Adiciona na localização destino
        const toSet = newItems.get(toLocationId) || new Set();
        const newToSet = new Set(toSet);
        newToSet.add(itemId);
        newItems.set(toLocationId, newToSet);

        return newItems;
      });

      if (operationError) {
        return { success: false, error: operationError };
      }

      return { success: true };
    },
    [_validateId, nodes]
  );

  /**
   * Busca uma localização por ID
   * PERFORMANCE: O(1) - acesso direto ao Map
   * @param {string} id - ID da localização
   * @returns {Object} - {success: boolean, location?: Object, error?: string}
   */
  const getLocation = useCallback(
    (id) => {
      const idValidation = _validateId(id);
      if (!idValidation.isValid) {
        Debugger.warn(`getLocation: ${idValidation.error}`);
        return { success: false, error: idValidation.error };
      }

      const location = nodes.get(id);
      if (!location) {
        const error = `Localização '${id}' não encontrada`;
        Debugger.warn(`getLocation: ${error}`);
        return { success: false, error };
      }

      return { success: true, location };
    },
    [_validateId, nodes]
  );

  /**
   * Obtém o caminho completo de uma localização (do nó raiz até o nó especificado)
   * PERFORMANCE: O(1) se cacheado, O(depth) no primeiro acesso
   * @param {string} id - ID da localização
   * @returns {Object} - {success: boolean, path?: Array, error?: string}
   */
  const getLocationPath = useCallback(
    (id) => {
      const idValidation = _validateId(id);
      if (!idValidation.isValid) {
        Debugger.warn(`getLocationPath: ${idValidation.error}`);
        return { success: false, error: idValidation.error };
      }

      if (!nodes.has(id)) {
        const error = `Localização '${id}' não encontrada`;
        Debugger.warn(`getLocationPath: ${error}`);
        return { success: false, error };
      }

      const path = _computePath(id, nodes);
      return { success: true, path };
    },
    [_validateId, nodes, _computePath]
  );

  /**
   * Busca localizações por nome (busca parcial, case-insensitive)
   * PERFORMANCE: O(n) onde n é o número de localizações
   * @param {string} searchTerm - Termo de busca
   * @returns {Object} - {success: boolean, results?: Array, error?: string}
   */
  const searchLocations = useCallback(
    (searchTerm) => {
      if (typeof searchTerm !== 'string') {
        const error = 'Termo de busca deve ser uma string';
        Debugger.warn(`searchLocations: ${error}`);
        return { success: false, error };
      }

      const results = [];
      const term = searchTerm.toLowerCase().trim();

      if (term === '') {
        return { success: true, results };
      }

      nodes.forEach((node) => {
        if (node.name.toLowerCase().includes(term)) {
          results.push(node);
        }
      });

      return { success: true, results };
    },
    [nodes]
  );

  /**
   * Gera um ID curto único para uma localização
   * Útil para identificação visual rápida em interfaces
   *
   * @param {string} locationId - ID da localização
   * @param {Object} options - Opções de personalização
   * @param {'sequential' | 'hash' | 'smart'} options.strategy - Estratégia: 'sequential', 'hash', 'smart'
   * @param {string} options.prefix - Prefixo para IDs sequenciais
   * @param {number} options.length - Tamanho desejado do ID
   * @returns {Object} - {success: boolean, shortId?: string, error?: string}
   */
  const generateShortId = useCallback(
    (
      locationId,
      options: { strategy?: string; prefix?: string; length?: number } = {}
    ): { success: boolean; shortId?: string; error?: string } => {
      const idValidation = _validateId(locationId);
      if (!idValidation.isValid) {
        Debugger.warn(`generateShortId: ${idValidation.error}`);
        return { success: false, error: idValidation.error };
      }

      if (!nodes.has(locationId)) {
        const error = `Localização '${locationId}' não encontrada`;
        Debugger.warn(`generateShortId: ${error}`);
        return { success: false, error };
      }

      try {
        const shortId = _generateShortId(locationId, options);
        const result = updateLocation(locationId, { metadata: { shortId } });
        if (!result.success) {
          Debugger.warn(`generateShortId: ${result.error}`);
          return { success: false, error: result.error };
        }
        return { success: true, shortId };
      } catch (error) {
        const errorMsg = `Erro ao gerar ID curto: ${error.message}`;
        Debugger.warn(`generateShortId: ${errorMsg}`);
        return { success: false, error: errorMsg };
      }
    },
    [_validateId, nodes, _generateShortId]
  );

  /**
   * Remove um ID curto específico do cache
   * Útil quando uma localização é removida ou quando se quer regenerar o ID
   * PERFORMANCE: O(1) - remoção direta do Map
   *
   * @param {string} shortId - ID curto a ser removido
   * @returns {Object} - {success: boolean, fullId?: string, error?: string}
   */
  const removeShortId = useCallback((shortId) => {
    if (typeof shortId !== 'string' || shortId.trim() === '') {
      const error = 'ID curto deve ser uma string não vazia';
      Debugger.warn(`removeShortId: ${error}`);
      return { success: false, error };
    }

    const fullId = shortIdCache.current.get(shortId);

    if (!fullId) {
      const error = `ID curto '${shortId}' não encontrado no cache`;
      Debugger.warn(`removeShortId: ${error}`);
      return { success: false, error };
    }

    try {
      // Remove do cache principal
      shortIdCache.current.delete(shortId);

      // Se o ID seguia padrão sequencial, pode decrementar contador
      // Detecta padrão: letras seguidas de números (ex: L001, LOC042)
      const sequentialMatch = shortId.match(/^([A-Z]+)(\d+)$/);
      if (sequentialMatch) {
        const [, prefix, numberStr] = sequentialMatch;
        const currentCount = shortIdCounter.current.get(prefix) || 0;
        const removedNumber = parseInt(numberStr, 10);

        // Se foi o último número da sequência, decrementa contador
        if (removedNumber === currentCount) {
          shortIdCounter.current.set(prefix, currentCount - 1);
        }
      }
      const result = updateLocation(fullId, { metadata: { shortId: null } });
      if (!result.success) {
        Debugger.warn(`removeShortId: ${result.error}`);
        return { success: false, error: result.error };
      }

      return {
        success: true,
        fullId,
      };
    } catch (error) {
      const errorMsg = `Erro ao remover ID curto: ${error.message}`;
      Debugger.warn(`removeShortId: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }, []);

  /**
   * Obtém o ID completo a partir de um ID curto
   * @param {string} shortId - ID curto
   * @returns {Object} - {success: boolean, fullId?: string, error?: string}
   */
  const getFullIdFromShort = useCallback(
    (shortId): { success: boolean; fullId?: string; error?: string } => {
      if (typeof shortId !== 'string' || shortId.trim() === '') {
        const error = 'ID curto deve ser uma string não vazia';
        Debugger.warn(`getFullIdFromShort: ${error}`);
        return { success: false, error };
      }

      const fullId = shortIdCache.current.get(shortId);
      if (!fullId) {
        const error = `ID curto '${shortId}' não encontrado`;
        Debugger.warn(`getFullIdFromShort: ${error}`);
        return { success: false, error };
      }

      return { success: true, fullId };
    },
    []
  );

  /**
   * Lista todos os IDs curtos gerados e suas respectivas localizações
   * @returns {Object} - {success: boolean, mapping?: Object, error?: string}
   */
  const getShortIdMapping = useCallback((): {
    success: boolean;
    mapping?: {
      [key: string]: {
        fullId: string;
        locationName: string;
        generated: boolean;
      };
    };
    error?: string;
  } => {
    try {
      const mapping = {};
      for (const [shortId, fullId] of shortIdCache.current) {
        const node = nodes.get(fullId);
        mapping[shortId] = {
          fullId,
          locationName: node?.name || 'Nome não encontrado',
          generated: true,
        };
      }

      return { success: true, mapping };
    } catch (error) {
      const errorMsg = `Erro ao obter mapeamento: ${error.message}`;
      Debugger.warn(`getShortIdMapping: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }, [nodes]);

  /**
   * Limpa o cache de IDs curtos (útil para reset ou importação)
   * @returns {Object} - {success: boolean}
   */
  const clearShortIdCache = useCallback(() => {
    shortIdCache.current.clear();
    shortIdCounter.current.clear();

    // Força rerender através de estado controlado
    setShortIdCacheVersion((prev) => prev + 1);

    return { success: true };
  }, []);

  // =============================================================================
  // COMPUTAÇÕES DERIVADAS - Dados memoizados para performance
  // =============================================================================

  /**
   * Obtém todas as localizações raiz (sem pai)
   * PERFORMANCE: O(n) - itera sobre todos os nós
   */
  const rootLocations = useMemo(() => {
    const roots = [];
    nodes.forEach((node) => {
      if (!node.parentId) {
        roots.push(node);
      }
    });
    return roots;
  }, [nodes]);

  /**
   * Converte a estrutura em árvore hierárquica para visualização
   * PERFORMANCE: O(n) onde n é o número de nós
   */
  const treeStructure = useMemo(() => {
    return _buildTreeStructure(null, nodes, locationItems);
  }, [nodes, locationItems, _buildTreeStructure]);

  /**
   * Estatísticas da árvore com cálculos otimizados
   * PERFORMANCE: O(n) com cache para profundidade máxima
   */
  const statistics = useMemo(() => {
    let totalItems = 0;
    let maxDepth = 0;

    locationItems.forEach((itemSet) => {
      totalItems += itemSet.size;
    });

    // Calcula profundidade máxima com cache
    nodes.forEach((_, nodeId) => {
      const depth = _computeDepth(nodeId, nodes);
      maxDepth = Math.max(maxDepth, depth);
    });

    return {
      totalLocations: nodes.size,
      totalItems,
      rootLocationsCount: rootLocations.length,
      maxDepth,
      shortIdCacheSize: shortIdCache.current.size,
    };
  }, [nodes, locationItems, rootLocations.length, _computeDepth]);

  /**
   * Exporta os dados da árvore para backup/persistência
   * PERFORMANCE: O(n) - serializa toda a estrutura
   */
  const exportData = useCallback(() => {
    try {
      return {
        success: true,
        data: {
          nodes: Object.fromEntries(
            Array.from(nodes.entries()).map(([id, node]) => [
              id,
              { ...node, children: Array.from(node.children) },
            ])
          ),
          locationItems: Object.fromEntries(
            Array.from(locationItems.entries()).map(([id, items]) => [
              id,
              Array.from(items),
            ])
          ),
          shortIds: Object.fromEntries(shortIdCache.current),
          shortIdCounters: Object.fromEntries(shortIdCounter.current),
          exportedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      const errorMsg = `Erro ao exportar dados: ${error.message}`;
      Debugger.warn(`exportData: ${errorMsg}`);
      return { success: false, error: errorMsg };
    }
  }, [nodes, locationItems]);

  /**
   * Importa dados da árvore
   * PERFORMANCE: O(n) - reconstrói toda a estrutura
   * @param {Object} data - Dados a serem importados
   * @returns {Object} - {success: boolean, error?: string}
   */
  const importData = useCallback(
    (data) => {
      try {
        if (!data || typeof data !== 'object') {
          const error = 'Dados de importação inválidos';
          Debugger.warn(`importData: ${error}`);
          return { success: false, error };
        }

        const { nodes: nodesData, locationItems: itemsData } = data;

        if (!nodesData || !itemsData) {
          const error = 'Estrutura de dados de importação incompleta';
          Debugger.warn(`importData: ${error}`);
          return { success: false, error };
        }

        // Reconstrói o cache de IDs curtos se disponível
        if (data.shortIds) {
          shortIdCache.current = new Map(Object.entries(data.shortIds));
        }
        if (data.shortIdCounters) {
          shortIdCounter.current = new Map(
            Object.entries(data.shortIdCounters)
          );
        }

        const importedNodes = new Map();
        const importedItems = new Map();

        // Reconstrói os nós
        Object.entries(nodesData).forEach(([id, nodeData]) => {
          if (typeof nodeData === 'object' && nodeData !== null) {
            // Corrigido: type assertion para garantir acesso seguro à propriedade children
            importedNodes.set(id, {
              ...nodeData,
              children: new Set(
                (nodeData as { children?: string[] }).children || []
              ),
            });
          }
        });

        // Reconstrói os itens
        Object.entries(itemsData).forEach(([id, items]) => {
          importedItems.set(id, new Set(Array.isArray(items) ? items : []));
        });

        setNodes(importedNodes);
        setLocationItems(importedItems);
        _invalidateCache();

        return { success: true };
      } catch (error) {
        const errorMsg = `Erro ao importar dados: ${error.message}`;
        Debugger.error(`importData: ${errorMsg}`, error);
        return { success: false, error: errorMsg };
      }
    },
    [_invalidateCache]
  );

  return {
    // Estado (apenas leitura)
    nodes: Array.from(nodes.values()),
    locationItems: Object.fromEntries(
      Array.from(locationItems.entries()).map(([id, items]) => [
        id,
        Array.from(items),
      ])
    ),

    // Operações de localização
    addLocation,
    removeLocation,
    updateLocation,
    moveLocation,
    getLocation,
    getLocationPath,
    searchLocations,

    // Operações de itens
    addItemToLocation,
    removeItemFromLocation,
    moveItem,

    // IDs Curtos
    generateShortId,
    removeShortId,
    getFullIdFromShort,
    getShortIdMapping,
    clearShortIdCache,

    // Dados computados
    rootLocations,
    treeStructure,
    statistics,

    // Persistência
    exportData,
    importData,
  };
};

export default useLocationTree;
