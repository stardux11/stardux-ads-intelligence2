'use client';

import React from 'react';
import { Search, Filter, RotateCcw, LayoutGrid, List, Sparkles } from 'lucide-react';
import { AdSearchFilters, Niche, AdFormat, Platform, AdStatus } from '@/lib/types';

interface AdFiltersProps {
  filters: AdSearchFilters;
  onChange: (newFilters: AdSearchFilters) => void;
  niches: Niche[];
  totalResults: number;
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export function AdFilters({
  filters,
  onChange,
  niches,
  totalResults,
  viewMode,
  onViewModeChange,
}: AdFiltersProps) {
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, keyword: e.target.value, page: 1 });
  };

  const handleNicheChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, niche: e.target.value || undefined, page: 1 });
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, format: (e.target.value as AdFormat) || 'all', page: 1 });
  };

  const handlePlatformChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, platform: (e.target.value as Platform) || 'all', page: 1 });
  };

  const handleLongevityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value ? Number(e.target.value) : undefined;
    onChange({ ...filters, minDaysActive: val, page: 1 });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, sortBy: e.target.value as any, page: 1 });
  };

  const handleReset = () => {
    onChange({
      niche: undefined,
      keyword: '',
      format: 'all',
      platform: 'all',
      status: 'all',
      minDaysActive: undefined,
      sortBy: 'longevity',
      page: 1,
    });
  };

  return (
    <div className="space-y-4">
      {/* Hero Search Box */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={filters.keyword || ''}
            onChange={handleKeywordChange}
            placeholder="Descubra o que os anunciantes do seu mercado estão fazendo..."
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
          />
          {filters.keyword && (
            <button
              onClick={() => onChange({ ...filters, keyword: '', page: 1 })}
              className="absolute right-4 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Niche Dropdown */}
          <select
            value={filters.niche || ''}
            onChange={handleNicheChange}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium outline-none focus:border-emerald-500"
          >
            <option value="">Todos os Nichos</option>
            {niches.map((n) => (
              <option key={n.id} value={n.slug}>
                {n.name}
              </option>
            ))}
          </select>

          {/* Format Dropdown */}
          <select
            value={filters.format || 'all'}
            onChange={handleFormatChange}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium outline-none focus:border-emerald-500"
          >
            <option value="all">Todos os Formatos</option>
            <option value="video">Vídeo</option>
            <option value="image">Imagem Estática</option>
            <option value="carousel">Carrossel</option>
          </select>

          {/* Platform Dropdown */}
          <select
            value={filters.platform || 'all'}
            onChange={handlePlatformChange}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium outline-none focus:border-emerald-500"
          >
            <option value="all">Todas as Plataformas</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
          </select>

          {/* Country Dropdown */}
          <select
            value={filters.country || 'BR'}
            onChange={(e) => onChange({ ...filters, country: e.target.value, page: 1 })}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium outline-none focus:border-emerald-500"
          >
            <option value="BR">🇧🇷 Brasil (BR)</option>
            <option value="US">🇺🇸 Estados Unidos (US)</option>
            <option value="PT">🇵🇹 Portugal (PT)</option>
            <option value="ES">🇪🇸 Espanha (ES)</option>
            <option value="GB">🇬🇧 Reino Unido (GB)</option>
            <option value="ALL">🌐 Todos os Países</option>
          </select>

          {/* Longevity Filter */}
          <select
            value={filters.minDaysActive || ''}
            onChange={handleLongevityChange}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium outline-none focus:border-emerald-500"
          >
            <option value="">Qualquer Longevidade</option>
            <option value="15">&gt; 15 dias ativos</option>
            <option value="30">&gt; 30 dias ativos (Consistente)</option>
            <option value="60">&gt; 60 dias ativos (Alta Longevidade)</option>
            <option value="90">&gt; 90 dias ativos (Referência)</option>
          </select>

          {/* Reset Filters */}
          {(filters.keyword || filters.niche || (filters.format && filters.format !== 'all') || filters.minDaysActive) && (
            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 flex items-center gap-1.5 font-medium transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>

        {/* Sorting and View Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Ordenar por:</span>
            <select
              value={filters.sortBy || 'longevity'}
              onChange={handleSortChange}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold outline-none focus:border-emerald-500"
            >
              <option value="longevity">Maior Longevidade Observada</option>
              <option value="isc">Maior ISC (Sinais Criativos)</option>
              <option value="recent">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
              <option value="advertiser">Anunciante (A-Z)</option>
            </select>
          </div>

          <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 p-0.5">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'grid'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Exibir em Grade"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-lg ${
                viewMode === 'table'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Exibir em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Encontrados <strong>{totalResults}</strong> anúncios com sinais observáveis registrados
        </span>
        <span className="text-[11px] text-slate-400">
          Fonte: Meta Ad Library & CSVs Verificados
        </span>
      </div>
    </div>
  );
}
