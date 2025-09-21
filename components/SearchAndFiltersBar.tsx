import React, { useState } from 'react';
import {
  Search,
  Filter,
  SortAsc,
  ChevronUp,
  Tag,
  Close,
} from '../components/Icons';
// Componente de controles integrado
const SearchAndFiltersBar = React.memo(
  ({
    searchTerm,
    onSearchChange,
    sortBy,
    onSortChange,
    categoryFilter,
    onCategoryChange,
    categories,
  }) => {
    const [showFilters, setShowFilters] = useState(false);

    const sortOptions = [
      { value: 'name', label: 'Nome A-Z' },
      { value: 'quantity', label: 'Quantidade' },
      { value: 'recent', label: 'Mais Recente' },
    ];

    return (
      <div className="mb-6 space-y-3">
        {/* Barra principal com busca e toggle de filtros */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar itens..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              title="Digite para buscar itens pelo nome ou categoria"
              className="w-full pl-10 pr-4 py-2.5 border border-neutral/60 rounded-lg bg-base dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-accent/50 focus:border-accent dark:border-gray-600 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            title={
              showFilters
                ? 'Ocultar filtros avançados'
                : 'Mostrar filtros avançados'
            }
            className={`px-4 py-2.5 border rounded-lg flex items-center gap-2 font-medium text-sm transition-all duration-200 shadow-sm ${
              showFilters
                ? 'border-primary/60 bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary dark:border-primary/40 shadow-primary/20'
                : 'border-neutral/60 bg-base hover:bg-neutral/50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 hover:shadow-md'
            }`}
            aria-label={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
            aria-expanded={showFilters}
          >
            <Filter
              className={`h-6 w-6 transition-transform duration-200 ${
                showFilters ? 'text-accent' : 'text-gray-500 dark:text-gray-400'
              }`}
            />
            <span className="hidden sm:inline">Filtros</span>
            {showFilters && (
              <ChevronUp className="h-6 w-6 ml-1 text-gray-500 dark:text-gray-400" />
            )}
            {!showFilters && (
              <ChevronUp className="h-6 w-6 ml-1 rotate-180 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Filtros expandíveis */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-neutral/40 dark:bg-gray-800/60 rounded-lg border border-neutral/60 dark:border-gray-600/60 backdrop-blur-sm">
            {/* Ordenação */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                <SortAsc className="h-6 w-6 mr-2 text-accent" />
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value)}
                title="Selecione como ordenar a lista de itens"
                className="w-full px-3 py-2.5 text-sm border border-neutral/60 rounded-lg bg-base dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por categoria */}
            <div className="space-y-2">
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Tag className="h-6 w-6 mr-2 text-accent" />
                Categoria
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => onCategoryChange(e.target.value)}
                title="Filtre os itens por categoria específica"
                className="w-full px-3 py-2.5 text-sm border border-neutral/60 rounded-lg bg-base dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
              >
                <option value="all">Todas as categorias</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Indicadores de filtros ativos */}
            {(categoryFilter !== 'all' || searchTerm) && (
              <div className="sm:col-span-2 flex items-center justify-between gap-2 pt-2 border-t border-neutral/40 dark:border-gray-600/40">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Filtros ativos:
                  </span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
                      <Search className="h-3 w-3" />"{searchTerm}"
                    </span>
                  )}
                  {categoryFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
                      <Tag className="h-3 w-3" />
                      {categoryFilter}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    onSearchChange('');
                    onCategoryChange('all');
                  }}
                  title="Limpar todos os filtros ativos"
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-error hover:bg-error/10 dark:hover:text-error dark:hover:bg-error/20 rounded-md transition-all duration-200"
                >
                  <Close className="h-3 w-3" />
                  <span className="hidden sm:inline">Limpar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

SearchAndFiltersBar.displayName = 'SearchAndFiltersBar';

export default SearchAndFiltersBar;