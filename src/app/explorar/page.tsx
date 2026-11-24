'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { AdCard } from '@/components/ads/AdCard';
import { AdFilters } from '@/components/ads/AdFilters';
import { AdDetailModal } from '@/components/ads/AdDetailModal';
import { ISCBreakdownModal } from '@/components/ads/ISCBreadownModal';
import { SaveToCollectionModal } from '@/components/collections/SaveToCollectionModal';
import { Ad, AdSearchFilters, Niche } from '@/lib/types';
import { formatDate, formatDaysActive, getISCTierInfo } from '@/lib/utils';
import { Loader2, SearchX, ExternalLink, Bookmark, Sparkles, Search } from 'lucide-react';
import { Suspense } from 'react';

function ExplorarContent() {
  const searchParams = useSearchParams();

  const initialKeyword = searchParams.get('keyword') || '';
  const initialNiche = searchParams.get('niche') || undefined;

  const [filters, setFilters] = useState<AdSearchFilters>({
    keyword: initialKeyword,
    niche: initialNiche,
    country: searchParams.get('country') || 'BR',
    format: (searchParams.get('format') as any) || 'all',
    platform: (searchParams.get('platform') as any) || 'all',
    status: (searchParams.get('status') as any) || 'all',
    sortBy: (searchParams.get('sortBy') as any) || 'longevity',
    page: 1,
    limit: 50,
  });

  const [ads, setAds] = useState<Ad[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  // Modals state
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [adForISC, setAdForISC] = useState<Ad | null>(null);
  const [adForCollection, setAdForCollection] = useState<Ad | null>(null);

  // Verifica se há intenção de busca ativa
  const hasSearchIntent = Boolean(filters.keyword?.trim() || filters.niche);

  // Busca de anúncios - só executa se houver termo de busca
  const fetchAds = useCallback(async () => {
    if (!hasSearchIntent) {
      setAds([]);
      setTotalCount(0);
      setHasSearched(false);
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      const params = new URLSearchParams();
      if (filters.keyword) params.set('keyword', filters.keyword);
      if (filters.niche) params.set('niche', filters.niche);
      params.set('country', filters.country || 'BR');
      if (filters.format && filters.format !== 'all') params.set('format', filters.format);
      if (filters.platform && filters.platform !== 'all') params.set('platform', filters.platform);
      if (filters.status && filters.status !== 'all') params.set('status', filters.status);
      if (filters.minDaysActive) params.set('minDaysActive', String(filters.minDaysActive));
      if (filters.sortBy) params.set('sortBy', filters.sortBy);
      params.set('page', String(filters.page || 1));
      params.set('limit', String(filters.limit || 50));

      const res = await fetch(`/api/ads?${params.toString()}`);
      const data = await res.json();

      if (data && Array.isArray(data.ads)) {
        setAds(data.ads);
        setTotalCount(data.total ?? data.ads.length);
      }

      // Mostra apenas avisos de erro
      if (data?.notice && data.notice.toLowerCase().includes('erro')) {
        setApiNotice(data.notice);
      } else {
        setApiNotice(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, hasSearchIntent]);

  // Executa busca quando os filtros mudam (mas só se houver intenção)
  useEffect(() => {
    fetchAds();
  }, [filters]);

  // Se tiver keyword/niche na URL, faz a busca inicial
  useEffect(() => {
    if (initialKeyword || initialNiche) {
      fetchAds();
    }
  }, []);

  return (
    <Shell>
      <div className="space-y-5 sm:space-y-6">
        <header className="ads-hero flex flex-wrap items-center justify-between gap-5 p-5 sm:p-7">
          <div className="max-w-2xl">
            <span className="ads-eyebrow"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Inteligência de mercado · Biblioteca Meta</span>
            <h1 className="ads-page-title">Explorar anúncios</h1>
            <p className="ads-subtitle">
              Descubra referências criativas, compare formatos e estude a longevidade observada dos anúncios.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/75 px-3 py-2 text-xs font-medium text-slate-600 dark:border-white/10 dark:bg-white/[0.035] dark:text-slate-300">
            <Search className="h-4 w-4 text-cyan-700 dark:text-cyan-400" aria-hidden="true" />
            Análise competitiva
          </div>
        </header>
        {/* Aviso de erro da API */}
        {apiNotice && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-xs text-rose-800 dark:text-rose-300">
            <div className="flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <div>
                <strong className="font-semibold block mb-0.5">Erro na Meta Graph API</strong>
                <p className="leading-relaxed">{apiNotice}</p>
              </div>
            </div>
            <button
              onClick={() => setApiNotice(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 text-xs font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filtros de Busca */}
        <AdFilters
          filters={filters}
          onChange={(newFilters) => setFilters(newFilters)}
          niches={niches}
          totalResults={hasSearched ? totalCount : 0}
          viewMode={viewMode}
          onViewModeChange={(m) => setViewMode(m)}
          showResultsCount={hasSearched}
        />

        {/* Estados da Tela */}
        {!hasSearchIntent ? (
          /* Estado inicial: aguardando pesquisa */
          <div className="ads-surface flex flex-col items-center justify-center gap-5 px-5 py-14 text-center sm:py-20">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-500/15 to-violet-500/10 flex items-center justify-center border border-cyan-500/20">
              <Search className="w-9 h-9 text-cyan-700 dark:text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                Pesquise anúncios reais da Meta
              </h2>
              <p className="text-sm text-slate-400 max-w-md">
                Digite o nome de uma empresa, produto ou segmento na barra acima para ver os anúncios ativos agora na Biblioteca da Meta.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
              {['turismo', 'academia', 'cursos online', 'imóveis', 'moda', 'saúde'].map((sugestao) => (
                <button
                  key={sugestao}
                  onClick={() => setFilters({ ...filters, keyword: sugestao, page: 1 })}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 dark:hover:text-cyan-300"
                >
                  {sugestao} →
                </button>
              ))}
            </div>
          </div>
        ) : loading ? (
          /* Carregando */
          <div className="ads-surface flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-8 h-8 text-cyan-700 dark:text-cyan-400 animate-spin mb-3" />
            <p className="text-xs text-slate-500 font-medium">
              Buscando anúncios ativos na Meta Ad Library...
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Consultando resultados para "{filters.keyword || filters.niche}"
            </p>
          </div>
        ) : ads.length === 0 ? (
          /* Sem resultados */
          <div className="ads-surface border-dashed px-6 py-16 text-center">
            <SearchX className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Nenhum anúncio encontrado
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
              Não encontramos anúncios ativos para "{filters.keyword || filters.niche}" no país selecionado. Tente outro termo ou país.
            </p>
            <button
              onClick={() => setFilters({ ...filters, keyword: '', niche: undefined, page: 1 })}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              Limpar busca
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid de Cards */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
            {ads.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                onOpenDetail={(selected) => setSelectedAd(selected)}
                onSaveToCollection={(target) => setAdForCollection(target)}
                onOpenISC={(target) => setAdForISC(target)}
              />
            ))}
          </div>
        ) : (
          /* Tabela */
          <div className="ads-surface overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-500 dark:border-white/10 dark:bg-white/[0.045]">
                <tr>
                  <th className="p-3.5">Criativo</th>
                  <th className="p-3.5">Anunciante</th>
                  <th className="p-3.5">Título & Mensagem</th>
                  <th className="p-3.5">Formato</th>
                  <th className="p-3.5">Longevidade</th>
                  <th className="p-3.5">Índice ISC</th>
                  <th className="p-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {ads.map((ad) => {
                  const tier = getISCTierInfo(ad.isc_score);
                  return (
                    <tr
                      key={ad.id}
                      onClick={() => setSelectedAd(ad)}
                      className="cursor-pointer transition-colors hover:bg-cyan-500/[0.045]"
                    >
                      <td className="p-3.5">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                          {ad.snapshot_url ? (
                            <div className="w-full h-full relative overflow-hidden">
                              <iframe
                                src={ad.snapshot_url}
                                title={ad.headline}
                                className="absolute top-0 left-0 w-[300%] h-[300%] border-0 pointer-events-none"
                                style={{ transform: 'scale(0.33)', transformOrigin: 'top left' }}
                                scrolling="no"
                                tabIndex={-1}
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-transparent" />
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                              Meta
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white max-w-[140px] truncate">
                        {ad.advertiser_name}
                      </td>
                      <td className="p-3.5 max-w-[260px]">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{ad.headline}</p>
                        <p className="text-slate-400 text-[11px] truncate">{ad.body_text}</p>
                      </td>
                      <td className="p-3.5 uppercase font-medium text-slate-500 text-[11px]">
                        {ad.format}
                      </td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">
                        {formatDaysActive(ad.days_active_observed)}
                      </td>
                      <td className="p-3.5">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setAdForISC(ad);
                          }}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${tier.badgeBg} border ${tier.badgeBorder}`}
                        >
                          <Sparkles className="w-3 h-3" />
                          ISC {ad.isc_score}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setAdForCollection(ad)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-600 transition-colors"
                          title="Salvar"
                        >
                          <Bookmark className="w-3.5 h-3.5" />
                        </button>
                        <a
                          href={ad.original_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white inline-block transition-colors"
                          title="Ver original"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AdDetailModal
        ad={selectedAd}
        isOpen={Boolean(selectedAd)}
        onClose={() => setSelectedAd(null)}
        onSaveToCollection={(target) => setAdForCollection(target)}
        onOpenISC={(target) => setAdForISC(target)}
      />

      <ISCBreakdownModal
        ad={adForISC}
        isOpen={Boolean(adForISC)}
        onClose={() => setAdForISC(null)}
      />

      <SaveToCollectionModal
        ad={adForCollection}
        isOpen={Boolean(adForCollection)}
        onClose={() => setAdForCollection(null)}
      />
    </Shell>
  );
}

export default function ExplorarPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Carregando...</p>
          </div>
        </Shell>
      }
    >
      <ExplorarContent />
    </Suspense>
  );
}
