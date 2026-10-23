'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import { AdCard } from '@/components/ads/AdCard';
import { AdFilters } from '@/components/ads/AdFilters';
import { AdDetailModal } from '@/components/ads/AdDetailModal';
import { ISCBreakdownModal } from '@/components/ads/ISCBreadownModal';
import { SaveToCollectionModal } from '@/components/collections/SaveToCollectionModal';
import { Ad, AdSearchFilters, Niche } from '@/lib/types';
import { formatDate, formatDaysActive, getISCTierInfo } from '@/lib/utils';
import { Loader2, SearchX, ExternalLink, Bookmark, Sparkles } from 'lucide-react';
import { Suspense } from 'react';

function ExplorarContent() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<AdSearchFilters>({
    keyword: searchParams.get('keyword') || '',
    niche: searchParams.get('niche') || undefined,
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
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  // Modals state
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [adForISC, setAdForISC] = useState<Ad | null>(null);
  const [adForCollection, setAdForCollection] = useState<Ad | null>(null);

  // Carrega nichos
  useEffect(() => {
    fetch('/api/stats')
      .then((r) => r.json())
      .then((data) => {
        // Obter nichos disponíveis
        if (data && data.nicheDistribution) {
          const list: Niche[] = Object.keys(data.nicheDistribution).map((name) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name,
            slug: name.toLowerCase().replace(/\s+/g, '-'),
            is_global: true,
            created_at: new Date().toISOString(),
          }));
          setNiches(list);
        }
      })
      .catch(console.error);
  }, []);

  // Busca de anúncios
  const fetchAds = async () => {
    try {
      setLoading(true);
      setApiNotice(null);
      const params = new URLSearchParams();
      if (filters.keyword) params.set('keyword', filters.keyword);
      if (filters.niche) params.set('niche', filters.niche);
      if (filters.country) params.set('country', filters.country);
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
        setTotalCount(data.total);
      }
      if (data && data.notice) {
        setApiNotice(data.notice);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, [filters]);

  useEffect(() => {
    const handleUpdate = () => fetchAds();
    window.addEventListener('stardux-data-updated', handleUpdate);
    return () => window.removeEventListener('stardux-data-updated', handleUpdate);
  }, []);

  return (
    <Shell>
      <div className="space-y-6">
        {/* Aviso de API da Meta ou Status de Consulta */}
        {apiNotice && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs flex items-start justify-between gap-3 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <span className="text-base leading-none">⚠️</span>
              <div>
                <strong className="font-semibold block mb-0.5">Aviso da Meta Graph API</strong>
                <p className="text-amber-800/90 dark:text-amber-200/90 leading-relaxed">{apiNotice}</p>
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href="/configuracoes"
                    className="underline font-bold text-amber-900 dark:text-amber-200 hover:opacity-80"
                  >
                    Ir para Configurações e gerar Token Permanente →
                  </a>
                </div>
              </div>
            </div>
            <button
              onClick={() => setApiNotice(null)}
              className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 text-xs font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filters and Search Hero Header */}
        <AdFilters
          filters={filters}
          onChange={(newFilters) => setFilters(newFilters)}
          niches={niches}
          totalResults={totalCount}
          viewMode={viewMode}
          onViewModeChange={(m) => setViewMode(m)}
        />

        {/* Content View: Grid or Table */}
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500 font-medium">Buscando anúncios e calculando sinais...</p>
          </div>
        ) : ads.length === 0 ? (
          <div className="p-14 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
            <SearchX className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {!filters.keyword && !filters.niche ? 'Escolha um Nicho ou Digite um Termo para Começar' : 'Nenhum anúncio encontrado'}
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-5">
              {!filters.keyword && !filters.niche
                ? 'Para consultar anúncios em tempo real, selecione um dos nichos acima (ex: Saúde e Bem-Estar, Infoprodutos) ou busque por palavras-chave na barra superior.'
                : 'Tente alterar os termos de busca, limpar os filtros ou carregar o conjunto de demonstração.'}
            </p>
            {filters.keyword || filters.niche ? (
              <button
                onClick={() =>
                  setFilters({
                    keyword: '',
                    niche: undefined,
                    format: 'all',
                    platform: 'all',
                    status: 'all',
                    sortBy: 'longevity',
                    page: 1,
                  })
                }
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                Resetar Filtros
              </button>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {niches.slice(0, 4).map((n) => (
                  <button
                    key={n.id}
                    onClick={() => setFilters({ ...filters, niche: n.slug, page: 1 })}
                    className="px-3.5 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-semibold text-xs hover:scale-105 transition-all"
                  >
                    Explorar {n.name} →
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
          /* Table View */
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
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
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                          {ad.media_url ? (
                            <img src={ad.media_url} alt="" className="w-full h-full object-cover" />
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

      {/* Shared Modals */}
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
            <p className="text-xs text-slate-500">Carregando anúncios...</p>
          </div>
        </Shell>
      }
    >
      <ExplorarContent />
    </Suspense>
  );
}
