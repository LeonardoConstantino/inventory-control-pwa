import React, { useState, useMemo } from 'react';
import { Item, Movement, MovementType } from '../types';

interface HistoryPageProps {
  items: Item[];
  movements: Movement[];
}

const HistoryPage: React.FC<HistoryPageProps> = ({ items, movements }) => {
  const [filterItem, setFilterItem] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  
  const itemMap = useMemo(() => {
    const map = new Map<string, Item>();
    items.forEach(item => map.set(item.id, item));
    return map;
  }, [items]);

  const filteredMovements = useMemo(() => {
    return movements
      .filter(m => {
        const itemMatch = filterItem === 'all' || m.itemId === filterItem;
        const typeMatch = filterType === 'all' || m.type === filterType;
        return itemMatch && typeMatch;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [movements, filterItem, filterType]);
  
  const exportData = () => {
    // Formatar as movimentações como texto simples
    const textContent = [];
    textContent.push("Movimentações Exportadas");
    textContent.push("=============================\n");

    filteredMovements.forEach(m => {
        const itemName = itemMap.get(m.itemId)?.name || 'Item Desconhecido';
        const date = new Date(m.timestamp).toLocaleDateString('pt-BR');
        const type = m.type === 'entry' ? 'Entrada' : 'Saída';
        textContent.push(`Data: ${date}`);
        textContent.push(`Item: ${itemName}`);
        textContent.push(`Tipo: ${type}`);
        textContent.push(`Quantidade: ${m.quantity}`);
        textContent.push("-----------------------------");
    });
    
    // Criar o arquivo para download
    const blob = new Blob([textContent.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `movimentacoes_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};


  return (
    <div className="p-4 pb-20">
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-md mb-4 space-y-3">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Filtros</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           <div>
              <label htmlFor="filterItem" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item</label>
              <select
                id="filterItem"
                value={filterItem}
                onChange={(e) => setFilterItem(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Todos os Itens</option>
                {items.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Movimentação</label>
              <select
                id="filterType"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">Todos os Tipos</option>
                <option value={MovementType.ENTRY}>Entrada</option>
                <option value={MovementType.EXIT}>Saída</option>
              </select>
            </div>
        </div>
      </div>
      
      {filteredMovements.length > 0 ? (
        <>
        <button onClick={exportData} className="w-full mb-4 bg-accent text-white py-2 rounded-lg font-semibold shadow hover:bg-secondary transition-colors">
            Exportar Dados Filtrados (JSON)
        </button>
        <ul className="space-y-3">
          {filteredMovements.map(movement => {
            const item = itemMap.get(movement.itemId);
            const isEntry = movement.type === MovementType.ENTRY;
            return (
              <li key={movement.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${isEntry ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'}`}>
                   {isEntry ? 
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg> :
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 dark:text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                   }
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 dark:text-gray-100">{item?.name || 'Item Desconhecido'}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(movement.timestamp).toLocaleString()}</p>
                </div>
                <div className={`text-xl font-bold ${isEntry ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {isEntry ? '+' : '-'}{movement.quantity}
                </div>
              </li>
            );
          })}
        </ul>
        </>
      ) : (
         <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
          <h3 className="mt-2 text-sm font-medium">Nenhuma movimentação encontrada</h3>
          <p className="mt-1 text-sm">Nenhum histórico corresponde aos seus filtros atuais.</p>
        </div>
      )}
    </div>
  );
};

export default HistoryPage;