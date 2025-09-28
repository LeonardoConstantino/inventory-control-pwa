# useLocationTree Hook

Um React Hook personalizado para gerenciamento eficiente de estruturas hierárquicas de localizações físicas com suporte completo a operações CRUD, busca e persistência de dados.

## 🎯 Visão Geral

O `useLocationTree` é um hook React avançado que permite criar e gerenciar árvores de localizações onde cada nó pode conter itens e ter nós filhos. Ideal para sistemas de inventário, gerenciamento de estoques, organização de espaços físicos ou qualquer aplicação que necessite de estruturas hierárquicas.

### Características Principais

- 🏗️ **Estrutura de Árvore Eficiente**: Utiliza Map para acesso O(1) aos nós
- 📦 **Gerenciamento de Itens**: Associação de itens a localizações específicas
- 🔍 **Busca Inteligente**: Busca por nome com suporte a termos parciais
- 🚀 **Performance Otimizada**: Computações memoizadas e estruturas otimizadas
- 💾 **Persistência**: Funcionalidades de export/import para backup
- 🛡️ **Validações Robustas**: Prevenção de ciclos e validação de integridade
- 📊 **Estatísticas**: Métricas automáticas da estrutura da árvore

## 🚀 Instalação

Este hook requer React 16.8+ (para suporte a hooks). Copie o arquivo `useLocationTree.js` para seu projeto:

```bash
# Certifique-se de ter o React instalado
npm install react

# Copie o hook para seu projeto
cp useLocationTree.js src/hooks/
```

## 📖 Uso Básico

```javascript
import useLocationTree from './hooks/useLocationTree';

function InventoryManager() {
  const {
    addLocation,
    addItemToLocation,
    treeStructure,
    statistics,
    searchLocations
  } = useLocationTree();

  // Criar estrutura de localizações
  const setupLocations = () => {
    addLocation('warehouse', 'Depósito Principal');
    addLocation('section-a', 'Seção A', 'warehouse');
    addLocation('shelf-1', 'Prateleira 1', 'section-a');
    
    // Adicionar itens
    addItemToLocation('shelf-1', 'item-001');
    addItemToLocation('shelf-1', 'item-002');
  };

  return (
    <div>
      <h2>Localizações: {statistics.totalLocations}</h2>
      <h3>Itens Total: {statistics.totalItems}</h3>
      <button onClick={setupLocations}>
        Configurar Localizações
      </button>
    </div>
  );
}
```

## 📊 Diagrama da Estrutura

```mermaid
graph TD
    A[useLocationTree Hook] --> B[Estado Principal]
    A --> C[Operações]
    A --> D[Dados Computados]
    
    B --> E[nodes: Map&lt;id, node&gt;]
    B --> F[locationItems: Map&lt;locationId, Set&lt;itemId&gt;&gt;]
    
    E --> G[Node Structure]
    G --> H[id: string]
    G --> I[name: string]
    G --> J[parentId: string | null]
    G --> K[children: Set&lt;string&gt;]
    G --> L[metadata: Object]
    G --> M[createdAt: string]
    
    C --> N[Operações de Localização]
    C --> O[Operações de Itens]
    C --> P[Persistência]
    
    N --> Q[addLocation]
    N --> R[removeLocation]
    N --> S[moveLocation]
    N --> T[getLocation]
    N --> U[getLocationPath]
    N --> V[searchLocations]
    
    O --> W[addItemToLocation]
    O --> X[removeItemFromLocation]
    O --> Y[moveItem]
    
    P --> Z[exportData]
    P --> AA[importData]
    
    D --> BB[treeStructure]
    D --> CC[statistics]
    D --> DD[rootLocations]
```

## 🔧 Referência Completa da API

### 🏗️ Operações de Localização

#### `addLocation(id, name, parentId?, metadata?)`

**Parâmetros:**
- `id` *(string, obrigatório)*: Identificador único da localização
- `name` *(string, obrigatório)*: Nome descritivo da localização  
- `parentId` *(string | null, opcional)*: ID da localização pai. Use `null` ou omita para criar nós raiz
- `metadata` *(Object, opcional)*: Dados adicionais personalizados

**Retorna:** `void`

**Comportamento:**
- Cria novo nó na árvore com timestamp automático
- Valida unicidade do ID
- Verifica existência do pai se especificado
- Atualiza automaticamente a lista de filhos do pai
- Inicializa lista vazia de itens para a localização

```javascript
// Localização raiz
addLocation('warehouse-01', 'Depósito Principal');

// Localização com pai
addLocation('section-a', 'Seção A', 'warehouse-01');

// Com metadata personalizado
addLocation('shelf-01', 'Prateleira 01', 'section-a', {
  capacity: 50,
  type: 'cold-storage',
  maxWeight: 500
});
```

---

#### `removeLocation(id)`

**Parâmetros:**
- `id` *(string, obrigatório)*: ID da localização a ser removida

**Retorna:** `void`

**Comportamento:**
- Remove recursivamente a localização e todas as sub-localizações
- Remove automaticamente do pai se existir
- Remove todos os itens associados às localizações excluídas
- Emite warning se o ID não existir

```javascript
removeLocation('section-a'); // Remove seção e todas as prateleiras filhas
```

---

#### `moveLocation(locationId, newParentId)`

**Parâmetros:**
- `locationId` *(string, obrigatório)*: ID da localização a ser movida
- `newParentId` *(string | null, obrigatório)*: ID do novo pai ou `null` para tornar raiz

**Retorna:** `void`

**Comportamento:**
- Move localização mantendo toda sua sub-árvore
- Previne criação de ciclos (não permite mover para descendente próprio)
- Atualiza automaticamente listas de filhos do pai antigo e novo
- Emite warnings para operações inválidas

```javascript
// Move para novo pai
moveLocation('shelf-01', 'section-b');

// Torna localização raiz
moveLocation('section-a', null);
```

---

#### `getLocation(id)`

**Parâmetros:**
- `id` *(string, obrigatório)*: ID da localização desejada

**Retorna:** `Object | null`

**Estrutura do Retorno:**
```typescript
{
  id: string;
  name: string;
  parentId: string | null;
  children: Set<string>;
  metadata: Object;
  createdAt: string; // ISO timestamp
} | null
```

```javascript
const location = getLocation('warehouse-01');
if (location) {
  console.log(`Nome: ${location.name}`);
  console.log(`Filhos: ${location.children.size}`);
  console.log(`Criado em: ${location.createdAt}`);
}
```

---

#### `getLocationPath(id)`

**Parâmetros:**
- `id` *(string, obrigatório)*: ID da localização

**Retorna:** `Array<Object>`

**Estrutura do Retorno:**
Array ordenado da raiz até o nó especificado, cada elemento contém a estrutura completa do nó.

```javascript
const path = getLocationPath('shelf-01');
// Retorna: [
//   { id: 'warehouse-01', name: 'Depósito Principal', ... },
//   { id: 'section-a', name: 'Seção A', ... },
//   { id: 'shelf-01', name: 'Prateleira 01', ... }
// ]

// Uso prático: breadcrumb
const breadcrumb = path.map(loc => loc.name).join(' → ');
```

---

#### `searchLocations(searchTerm)`

**Parâmetros:**
- `searchTerm` *(string, obrigatório)*: Termo de busca (case-insensitive, busca parcial)

**Retorna:** `Array<Object>`

**Comportamento:**
- Busca em todos os nomes de localização
- Não diferencia maiúsculas/minúsculas
- Suporta busca parcial (substring)
- Retorna array de objetos de localização completos

```javascript
const results = searchLocations('prateleira');
// Encontra: 'Prateleira 01', 'Prateleira A', 'Nova Prateleira', etc.

results.forEach(loc => {
  console.log(`${loc.name} (ID: ${loc.id})`);
});
```

### 📦 Operações de Itens

#### `addItemToLocation(locationId, itemId)`

**Parâmetros:**
- `locationId` *(string, obrigatório)*: ID da localização de destino
- `itemId` *(string, obrigatório)*: ID único do item

**Retorna:** `void`

**Comportamento:**
- Adiciona item ao Set da localização especificada
- Valida existência da localização
- Previne duplicatas automaticamente (Set behavior)
- Emite warning se localização não existir

```javascript
addItemToLocation('shelf-01', 'produto-abc-123');
addItemToLocation('shelf-01', 'produto-def-456');
```

---

#### `removeItemFromLocation(locationId, itemId)`

**Parâmetros:**
- `locationId` *(string, obrigatório)*: ID da localização
- `itemId` *(string, obrigatório)*: ID do item a ser removido

**Retorna:** `void`

**Comportamento:**
- Remove item do Set da localização
- Operação segura: não gera erro se item não existir
- Mantém integridade da estrutura

```javascript
removeItemFromLocation('shelf-01', 'produto-abc-123');
```

---

#### `moveItem(itemId, fromLocationId, toLocationId)`

**Parâmetros:**
- `itemId` *(string, obrigatório)*: ID do item a ser movido
- `fromLocationId` *(string | null, obrigatório)*: ID da localização origem (null se origem desconhecida)
- `toLocationId` *(string, obrigatório)*: ID da localização destino

**Retorna:** `void`

**Comportamento:**
- Operação atômica: remove da origem e adiciona no destino
- Valida existência da localização destino
- Remove da origem mesmo se item não estiver lá (operação segura)
- Emite warning se destino não existir

```javascript
moveItem('produto-abc-123', 'shelf-01', 'shelf-02');

// Se origem desconhecida
moveItem('produto-xyz-789', null, 'shelf-01');
```

### 📈 Dados Computados (Somente Leitura)

#### `treeStructure`

**Tipo:** `Array<Object>`

**Estrutura:**
```typescript
Array<{
  id: string;
  name: string;
  parentId: string | null;
  children: Array<Object>; // Estrutura recursiva
  items: Array<string>;    // Array de itemIds
  metadata: Object;
  createdAt: string;
}>
```

**Comportamento:**
- Computado automaticamente via useMemo
- Recalculado apenas quando nodes ou locationItems mudam
- Estrutura hierárquica pronta para renderização
- Inclui itens de cada localização como array

```javascript
// Renderização recursiva
const renderTree = (nodes) => (
  <ul>
    {nodes.map(node => (
      <li key={node.id}>
        {node.name} ({node.items.length} itens)
        {node.children.length > 0 && renderTree(node.children)}
      </li>
    ))}
  </ul>
);
```

---

#### `statistics`

**Tipo:** `Object`

**Estrutura:**
```typescript
{
  totalLocations: number;     // Total de localizações na árvore
  totalItems: number;         // Total de itens em todas as localizações
  rootLocationsCount: number; // Quantidade de nós raiz
  maxDepth: number;          // Maior profundidade da árvore
}
```

```javascript
const { totalLocations, totalItems, maxDepth } = statistics;

console.log(`Gerenciando ${totalLocations} localizações`);
console.log(`Com ${totalItems} itens distribuídos`);
console.log(`Profundidade máxima: ${maxDepth} níveis`);
```

---

#### `rootLocations`

**Tipo:** `Array<Object>`

**Comportamento:**
- Array com todas as localizações que não possuem pai
- Computado via useMemo para performance
- Útil para renderização de múltiplas árvores

```javascript
rootLocations.forEach(root => {
  console.log(`Árvore raiz: ${root.name}`);
});
```

### 💾 Persistência

#### `exportData()`

**Parâmetros:** Nenhum

**Retorna:** `Object`

**Estrutura do Retorno:**
```typescript
{
  nodes: Record<string, {
    id: string;
    name: string;
    parentId: string | null;
    children: Array<string>;  // Convertido de Set para Array
    metadata: Object;
    createdAt: string;
  }>;
  locationItems: Record<string, Array<string>>; // Convertido de Map<Set> para Record<Array>
  exportedAt: string; // ISO timestamp da exportação
}
```

**Comportamento:**
- Converte estruturas internas para formato serializável
- Inclui timestamp de exportação para versionamento
- Dados prontos para JSON.stringify()

```javascript
const backup = exportData();
localStorage.setItem('inventory-backup', JSON.stringify(backup));

// Ou salvar em arquivo
const dataStr = JSON.stringify(backup, null, 2);
const blob = new Blob([dataStr], { type: 'application/json' });
```

---

#### `importData(data)`

**Parâmetros:**
- `data` *(Object, obrigatório)*: Dados no formato retornado por `exportData()`

**Retorna:** `boolean`

**Comportamento:**
- Substitui completamente o estado atual
- Reconstrói estruturas internas (Map, Set)
- Validação automática da integridade dos dados
- Retorna `true` se sucesso, `false` se erro
- Em caso de erro, estado anterior é mantido

```javascript
// Restaurar de localStorage
const backup = JSON.parse(localStorage.getItem('inventory-backup'));
const success = importData(backup);

if (success) {
  console.log('Dados restaurados com sucesso!');
} else {
  console.log('Erro ao restaurar dados');
}

// Com tratamento de erro
try {
  const fileData = JSON.parse(fileContent);
  if (importData(fileData)) {
    setMessage('Importação realizada com sucesso!');
  }
} catch (error) {
  setMessage('Arquivo inválido ou corrompido');
}
```

## 💡 Exemplos Avançados

### Sistema de Inventário Completo

```javascript
function WarehouseSystem() {
  const tree = useLocationTree();
  
  useEffect(() => {
    // Configuração inicial
    tree.addLocation('warehouse', 'Depósito Central');
    tree.addLocation('receiving', 'Área de Recebimento', 'warehouse');
    tree.addLocation('storage', 'Área de Armazenagem', 'warehouse');
    tree.addLocation('shipping', 'Área de Expedição', 'warehouse');
    
    // Seções de armazenagem
    ['A', 'B', 'C'].forEach(section => {
      const sectionId = `section-${section.toLowerCase()}`;
      tree.addLocation(sectionId, `Seção ${section}`, 'storage');
      
      // Corredores por seção
      for (let i = 1; i <= 10; i++) {
        const corridorId = `${sectionId}-corridor-${i}`;
        tree.addLocation(corridorId, `Corredor ${i}`, sectionId);
        
        // Prateleiras por corredor
        ['L', 'R'].forEach(side => {
          const shelfId = `${corridorId}-${side.toLowerCase()}`;
          tree.addLocation(shelfId, `Prateleira ${side}`, corridorId);
        });
      }
    });
  }, []);
  
  return (
    <div>
      <h1>Sistema de Depósito</h1>
      <div>Localizações: {tree.statistics.totalLocations}</div>
      <div>Profundidade: {tree.statistics.maxDepth} níveis</div>
    </div>
  );
}
```

### Busca e Navegação

```javascript
function LocationSearch() {
  const tree = useLocationTree();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  const searchResults = useMemo(() => {
    return searchTerm ? tree.searchLocations(searchTerm) : [];
  }, [searchTerm, tree]);
  
  const locationPath = useMemo(() => {
    return selectedLocation ? tree.getLocationPath(selectedLocation.id) : [];
  }, [selectedLocation, tree]);
  
  return (
    <div>
      <input
        type="text"
        placeholder="Buscar localização..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      {searchResults.map(location => (
        <div key={location.id} onClick={() => setSelectedLocation(location)}>
          {location.name}
        </div>
      ))}
      
      {locationPath.length > 0 && (
        <div>
          Caminho: {locationPath.map(loc => loc.name).join(' → ')}
        </div>
      )}
    </div>
  );
}
```

## 🏗️ Estrutura de Dados

### Nó de Localização
```javascript
{
  id: string,           // Identificador único
  name: string,         // Nome da localização
  parentId: string|null,// ID do pai (null para raiz)
  children: Set,        // Set com IDs dos filhos
  metadata: Object,     // Dados adicionais personalizados
  createdAt: string     // Timestamp de criação (ISO)
}
```

### Mapa de Itens
```javascript
Map<locationId, Set<itemId>>
```

## ⚡ Performance e Otimizações

- **Acesso O(1)**: Uso de Maps para busca instantânea de nós
- **Memoização**: Computações derivadas são memoizadas automaticamente
- **Estruturas Imutáveis**: Previne re-renderizações desnecessárias
- **Sets para Filhos**: Operações de adição/remoção otimizadas
- **Validação Eficiente**: Previne operações inválidas antes da execução

## 🛡️ Validações e Segurança

- ✅ Prevenção de ciclos na árvore
- ✅ Validação de existência de pais
- ✅ Verificação de IDs únicos
- ✅ Remoção em cascata segura
- ✅ Logs de aviso para operações inválidas

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para detalhes.

## 🆘 Suporte

Para dúvidas, sugestões ou problemas:
- Abra uma [issue](https://github.com/seu-usuario/seu-repo/issues)
- Consulte a documentação completa
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de estruturas hierárquicas complexas.**