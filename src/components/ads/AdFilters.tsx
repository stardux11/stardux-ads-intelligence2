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
  showResultsCount?: boolean;
}

export function AdFilters({
  filters,
  onChange,
  niches,
  totalResults,
  viewMode,
  onViewModeChange,
  showResultsCount = false,
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
      country: filters.country || 'BR',
      format: 'all',
      platform: 'all',
      status: 'all',
      minDaysActive: undefined,
      sortBy: 'longevity',
      page: 1,
    });
  };

  const controlClass = 'w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-700 outline-none transition-colors focus-visible:border-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-600/15 dark:border-white/10 dark:bg-[#12151d] dark:text-slate-200';

  return (
    <section className="ads-surface p-4 sm:p-5" aria-label="Pesquisar e filtrar anúncios">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="ads-eyebrow"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> BIBLIOTECA DE ANÚNCIOS</span>
          <h2 className="mt-1.5 text-lg font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Encontre referências criativas
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Busque empresas, segmentos e formatos. Os filtros mantêm os mesmos dados da Meta.
          </p>
        </div>
        {showResultsCount && (
          <span role="status" className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/5 px-3 py-1.5 text-xs font-semibold text-cyan-800 dark:text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" aria-hidden="true" />
            {totalResults.toLocaleString('pt-BR')} resultados
          </span>
        )}
      </div>

      <div className="mt-5">
        <label htmlFor="ads-search-keyword" className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Empresa, produto ou segmento
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[19px] w-[19px] -translate-y-1/2 text-cyan-700 dark:text-cyan-400" aria-hidden="true" />
          <input id="ads-search-keyword" type="search"
            value={filters.keyword || ''} onChange={handleKeywordChange}
            placeholder="Ex.: imobiliárias, clínica odontológica, cursos online"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-3.5 pl-12 pr-20 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition-colors focus:border-cyan-600 focus:bg-white focus:ring-2 focus:ring-cyan-500/15 dark:border-white/10 dark:bg-[#12151d] dark:text-slate-100 dark:focus:bg-[#161b23]" />
          {filters.keyword && (
            <button type="button" onClick={() => onChange({ ...filters, keyword: '', page: 1 })}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Limpar palavra-chave">Limpar</button>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <label className="min-w-0 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Nicho</span>
          <select aria-label="Filtrar por nicho" className={controlClass} value={filters.niche || ''} onChange={handleNicheChange}>
            <option value="">Todos os nichos</option>
            {niches.map(n => <option key={n.id} value={n.slug}>{n.name}</option>)}
          </select>
        </label>
        <label className="min-w-0 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Formato</span>
          <select aria-label="Filtrar por formato" className={controlClass} value={filters.format || 'all'} onChange={handleFormatChange}>
            <option value="all">Todos os formatos</option>
            <option value="video">Vídeo</option>
            <option value="image">Imagem</option>
            <option value="carousel">Carrossel</option>
          </select>
        </label>
        <label className="min-w-0 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Rede</span>
          <select aria-label="Filtrar por plataforma" className={controlClass} value={filters.platform || 'all'} onChange={handlePlatformChange}>
            <option value="all">Facebook e Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="instagram">Instagram</option>
          </select>
        </label>
        <label className="min-w-0 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">País</span>
          <select aria-label="Filtrar por país" className={controlClass} value={filters.country || 'BR'}
            onChange={e => onChange({ ...filters, country: e.target.value, page: 1 })}>
            <option value="BR">Brasil</option><option value="US">Estados Unidos</option>
            <option value="PT">Portugal</option><option value="ES">Espanha</option>
            <option value="GB">Reino Unido</option><option value="ALL">Todos os países</option>
          </select>
        </label>
        <label className="min-w-0 space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Longevidade observada</span>
          <select aria-label="Filtrar por tempo ativo" className={controlClass}
            value={filters.minDaysActive || ''} onChange={handleLongevityChange}>
            <option value="">Qualquer período</option>
            <option value="15">Mais de 15 dias</option><option value="30">Mais de 30 dias</option>
            <option value="60">Mais de 60 dias</option><option value="90">Mais de 90 dias</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-white/[0.08]">
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <Filter className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Refine sua pesquisa para encontrar os anúncios mais relevantes.</span>
          <button type="button" onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/[0.07]">
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Limpar filtros
          </button>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <label htmlFor="ads-sort" className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Ordenação</label>
          <select id="ads-sort" aria-label="Ordenar anúncios" value={filters.sortBy || 'longevity'}
            onChange={handleSortChange} className={controlClass + ' max-w-[230px] flex-1'}>
            <option value="longevity">Maior longevidade</option>
            <option value="isc">Maior ISC</option>
            <option value="recent">Mais recentes</option><option value="oldest">Mais antigos</option>
            <option value="advertiser">Anunciante A–Z</option>
          </select>
          <div role="group" aria-label="Visualização de resultados" className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/[0.04]">
            <button type="button" aria-pressed={viewMode === 'grid'} aria-label="Mostrar grade"
              onClick={() => onViewModeChange('grid')}
              className={`rounded-lg p-2 transition-colors ${viewMode === 'grid' ? 'bg-white text-cyan-800 shadow-sm dark:bg-[#202632] dark:text-cyan-300' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" aria-pressed={viewMode === 'table'} aria-label="Mostrar tabela"
              onClick={() => onViewModeChange('table')}
              className={`rounded-lg p-2 transition-colors ${viewMode === 'table' ? 'bg-white text-cyan-800 shadow-sm dark:bg-[#202632] dark:text-cyan-300' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'}`}>
              <List className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      {showResultsCount && <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500">Fonte: Biblioteca de Anúncios da Meta · Dados observáveis, não estimativas de conversão.</p>}
    </section>
  );
}
