import React, { useMemo } from 'react';
import {
  Report,
  Box,
  CurrencyReal,
  AlertTriangle,
  ArrowsLeftRight,
} from '../components/Icons';
import EmptyState from '../components/EmptyState';
import { Item, Movement, MovementType } from '../types';
import PurchaseRequestGenerator from '../components/PurchaseRequestGenerator';

interface ReportPageProps {
  items: Item[];
  movements: Movement[];
}

interface MostMovedItemData {
  item: Item | undefined;
  count: number;
}

interface ReportData {
  totalItems: number;
  totalStockValue: number;
  totalOutputValue: number; // Novo campo adicionado
  lowStockItems: Item[];
  totalMovements: number;
  mostMovedItems: MostMovedItemData[];
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4">
    <div className="bg-blue-100 dark:bg-blue-900 text-primary dark:text-blue-300 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
        {value}
      </p>
    </div>
  </div>
);

const ReportPage: React.FC<ReportPageProps> = ({ items, movements }) => {
  const reportData: ReportData = useMemo(() => {
    const totalItems: number = items.length;
    const totalStockValue: number = items.reduce(
      (sum: number, item: Item) => sum + item.quantity * (item.price || 0),
      0
    );

    // Cálculo do valor total das saídas do estoque
    const totalOutputValue: number = movements
      .filter((movement) => movement.type === MovementType.EXIT)
      .reduce((sum: number, movement: Movement) => {
        const item = items.find((i: Item) => i.id === movement.itemId);
        return sum + movement.quantity * (item?.price || 0);
      }, 0);

    const lowStockItems: Item[] = items.filter(
      (item: Item) => item.quantity <= item.minStock
    );
    const totalMovements: number = movements.length;

    const movementCounts: Record<string, number> = movements.reduce(
      (acc, movement) => {
        acc[movement.itemId] = (acc[movement.itemId] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const mostMovedItems: MostMovedItemData[] = Object.entries(movementCounts)
      .map(([itemId, count]) => ({
        item: items.find((i: Item) => i.id === itemId),
        count: count as number,
      }))
      .filter((data: MostMovedItemData) => data.item)
      .sort((a: MostMovedItemData, b: MostMovedItemData) => b.count - a.count)
      .slice(0, 5);

    return {
      totalItems,
      totalStockValue,
      totalOutputValue, // Incluído no retorno
      lowStockItems,
      totalMovements,
      mostMovedItems,
    };
  }, [items, movements]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<Report className="h-16 w-16 text-gray-400" />}
        title="Nenhum item no inventário"
        message="Adicione itens ao inventário para ver o relatório."
      />
    );
  }

  const maxMovementCount = reportData.mostMovedItems[0]?.count || 1;

  return (
    <div className="p-4 pb-20 space-y-6">
      <section>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Visão Geral
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total de Itens"
            value={reportData.totalItems}
            icon={<Box className="h-6 w-6" />}
          />
          <StatCard
            title="Valor Total em Estoque"
            value={reportData.totalStockValue.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
            icon={<CurrencyReal className="h-6 w-6" />}
          />
          <StatCard
            title="Valor de Saída do Estoque"
            value={reportData.totalOutputValue.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
            icon={<CurrencyReal className="h-6 w-6" />}
          />
          <StatCard
            title="Itens com Estoque Baixo"
            value={reportData.lowStockItems.length}
            icon={<AlertTriangle className="h-6 w-6 text-yellow-500" />}
          />
          <StatCard
            title="Total de Movimentações"
            value={reportData.totalMovements}
            icon={<ArrowsLeftRight className="h-6 w-6" />}
          />
        </div>
      </section>

      {reportData.lowStockItems.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Alerta de Estoque Baixo
          </h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {reportData.lowStockItems.map((item) => (
                <li
                  key={item.id}
                  className="py-3 flex justify-between items-center"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {item.name}
                  </span>
                  <span className="text-red-500 font-bold">
                    {item.quantity} /{' '}
                    <span className="text-gray-500 dark:text-gray-400 font-normal">
                      mín {item.minStock}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {reportData.mostMovedItems.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
            Itens Mais Movimentados
          </h2>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
            {reportData.mostMovedItems.map(
              ({ item, count }) =>
                item && (
                  <div key={item.id}>
                    <div className="flex justify-between items-center mb-1 text-sm">
                      <span className="font-medium text-gray-800 dark:text-gray-100">
                        {item.name}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {count} mov.
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-accent h-2.5 rounded-full"
                        style={{
                          width: `${(count / maxMovementCount) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
          Gestão de Requisições
        </h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <PurchaseRequestGenerator items={items} />
        </div>
      </section>
    </div>
  );
};

export default ReportPage;
