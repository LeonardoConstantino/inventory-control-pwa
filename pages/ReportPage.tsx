import React, { useMemo } from 'react';
import { Item, Movement } from '../types';

interface ReportPageProps {
  items: Item[];
  movements: Movement[];
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md flex items-center space-x-4">
        <div className="bg-blue-100 dark:bg-blue-900 text-primary dark:text-blue-300 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
        </div>
    </div>
);

const ReportPage: React.FC<ReportPageProps> = ({ items, movements }) => {

    const reportData = useMemo(() => {
        const totalItems = items.length;
        const totalStockValue = items.reduce((sum, item) => sum + (item.quantity * (item.price || 0)), 0);
        const lowStockItems = items.filter(item => item.quantity <= item.minStock);
        const totalMovements = movements.length;

        const movementCounts = movements.reduce((acc, movement) => {
            acc[movement.itemId] = (acc[movement.itemId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostMovedItems = Object.entries(movementCounts)
            .map(([itemId, count]) => ({
                item: items.find(i => i.id === itemId),
                count
            }))
            .filter(data => data.item)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        return {
            totalItems,
            totalStockValue,
            lowStockItems,
            totalMovements,
            mostMovedItems
        };
    }, [items, movements]);

    if (items.length === 0) {
        return (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400 h-full flex flex-col justify-center items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium">Nenhum dado para o relatório</h3>
                <p className="mt-1 text-sm">Adicione itens e movimente o estoque para ver as estatísticas.</p>
            </div>
        );
    }
    
    const maxMovementCount = reportData.mostMovedItems[0]?.count || 1;

    return (
        <div className="p-4 pb-20 space-y-6">
            <section>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Visão Geral</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <StatCard 
                        title="Total de Itens" 
                        value={reportData.totalItems} 
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>}
                    />
                    <StatCard 
                        title="Valor Total em Estoque" 
                        value={reportData.totalStockValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4L12 6M12 18L12 20M15.5 8C15.1666667 6.66666667 14 6 12 6 9 6 8.5 7.95652174 8.5 9 8.5 13.140327 15.5 10.9649412 15.5 15 15.5 16.0434783 15 18 12 18 10 18 8.83333333 17.3333333 8.5 16" /></svg>}
                    />
                    <StatCard 
                        title="Itens com Estoque Baixo" 
                        value={reportData.lowStockItems.length}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                    />
                     <StatCard 
                        title="Total de Movimentações" 
                        value={reportData.totalMovements}
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 240 240" stroke="none"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m213.66 181.66l-32 32a8 8 0 0 1-11.32-11.32L188.69 184H48a8 8 0 0 1 0-16h140.69l-18.35-18.34a8 8 0 0 1 11.32-11.32l32 32a8 8 0 0 1 0 11.32Zm-139.32-64a8 8 0 0 0 11.32-11.32L67.31 88H208a8 8 0 0 0 0-16H67.31l18.35-18.34a8 8 0 0 0-11.32-11.32l-32 32a8 8 0 0 0 0 11.32Z" /></svg>}
                    />
                </div>
            </section>
            
            {reportData.lowStockItems.length > 0 && (
                 <section>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Alerta de Estoque Baixo</h2>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                           {reportData.lowStockItems.map(item => (
                               <li key={item.id} className="py-3 flex justify-between items-center">
                                   <span className="font-medium text-gray-800 dark:text-gray-100">{item.name}</span>
                                   <span className="text-red-500 font-bold">{item.quantity} / <span className="text-gray-500 dark:text-gray-400 font-normal">mín {item.minStock}</span></span>
                               </li>
                           ))}
                        </ul>
                    </div>
                </section>
            )}

            {reportData.mostMovedItems.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-3">Itens Mais Movimentados</h2>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md space-y-4">
                        {reportData.mostMovedItems.map(({ item, count }) => item && (
                            <div key={item.id}>
                                <div className="flex justify-between items-center mb-1 text-sm">
                                    <span className="font-medium text-gray-800 dark:text-gray-100">{item.name}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{count} mov.</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div 
                                        className="bg-accent h-2.5 rounded-full" 
                                        style={{ width: `${(count / maxMovementCount) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
};

export default ReportPage;