'use client';

import React, { useState, useEffect } from 'react';
import {
  Users2,
  PlusCircle,
  ExternalLink,
  Layers,
  Sparkles,
  Calendar,
  CheckSquare,
  Square,
  ArrowRightLeft,
  X,
  Loader2,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Advertiser, Ad } from '@/lib/types';
import { formatDaysActive, getISCTierInfo } from '@/lib/utils';
import { AdCard } from '@/components/ads/AdCard';
import { AdDetailModal } from '@/components/ads/AdDetailModal';
import { ISCBreakdownModal } from '@/components/ads/ISCBreadownModal';
import { SaveToCollectionModal } from '@/components/collections/SaveToCollectionModal';

export default function ConcorrentesPage() {
  const [competitors, setCompetitors] = useState<Advertiser[]>([]);
  const [allAds, setAllAds] = useState<Ad[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Novo Concorrente
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompetitorName, setNewCompetitorName] = useState('');
  const [newCompetitorWebsite, setNewCompetitorWebsite] = useState('');
  const [newCompetitorNiche, setNewCompetitorNiche] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Ad Modals
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [adForISC, setAdForISC] = useState<Ad | null>(null);
  const [adForCollection, setAdForCollection] = useState<Ad | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, adsRes] = await Promise.all([
        fetch('/api/competitors'),
        fetch('/api/ads?limit=100'),
      ]);
      const comps = await compRes.json();
      const adsData = await adsRes.json();

      if (Array.isArray(comps)) {
        setCompetitors(comps);
        // Pré-seleciona os 2 primeiros para comparação imediata se houver
        if (comps.length >= 2 && selectedIds.length === 0) {
          setSelectedIds([comps[0].id, comps[1].id]);
        }
      }
      if (adsData && Array.isArray(adsData.ads)) {
        setAllAds(adsData.ads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const handleUpdate = () => fetchData();
    window.addEventListener('stardux-data-updated', handleUpdate);
    return () => window.removeEventListener('stardux-data-updated', handleUpdate);
  }, []);

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleCreateCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitorName.trim()) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCompetitorName.trim(),
          website_url: newCompetitorWebsite.trim() || undefined,
          niche_name: newCompetitorNiche.trim() || 'Geral',
          is_competitor: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAddModalOpen(false);
        setNewCompetitorName('');
        setNewCompetitorWebsite('');
        setNewCompetitorNiche('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCompetitors = competitors.filter((c) => selectedIds.includes(c.id));

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Análise de Concorrentes & Benchmarking
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Selecione dois ou mais concorrentes para comparar presença, longevidade de criativos e abordagens.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Cadastrar Concorrente</span>
          </button>
        </div>

        {/* Competitor Selector Pills */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users2 className="w-4 h-4 text-emerald-500" />
              <span>Concorrentes Disponíveis ({competitors.length})</span>
            </span>
            <span className="text-slate-400 text-[11px]">
              Selecione 2+ para comparação lado a lado
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {competitors.map((comp) => {
              const isSelected = selectedIds.includes(comp.id);
              return (
                <button
                  key={comp.id}
                  onClick={() => toggleSelect(comp.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {isSelected ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{comp.name}</span>
                  <span className="text-[10px] font-normal opacity-70">
                    ({comp.total_ads_count || 0} ads)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side Comparison Section */}
        {selectedCompetitors.length >= 2 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                <span>Comparativo Direto ({selectedCompetitors.length} Concorrentes Selecionados)</span>
              </div>
            </div>

            {/* Metrics Comparison Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCompetitors.map((comp) => {
                const compAds = allAds.filter(
                  (a) =>
                    a.advertiser_id === comp.id ||
                    a.advertiser_name.toLowerCase() === comp.name.toLowerCase()
                );
                const maxDays =
                  compAds.length > 0 ? Math.max(...compAds.map((a) => a.days_active_observed)) : 0;
                const avgIsc =
                  compAds.length > 0
                    ? Math.round(compAds.reduce((acc, a) => acc + a.isc_score, 0) / compAds.length)
                    : 0;

                return (
                  <div
                    key={comp.id}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Competitor Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white">
                            {comp.name}
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">{comp.niche_name || 'Geral'}</p>
                        </div>
                        {comp.website_url && (
                          <a
                            href={comp.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                            title="Abrir site oficial"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>

                      {/* Stat Cards */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Anúncios</span>
                          <strong className="text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">
                            {compAds.length}
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Longevidade</span>
                          <strong className="text-sm font-extrabold text-slate-900 dark:text-white block mt-0.5">
                            {maxDays}d
                          </strong>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Média ISC</span>
                          <strong className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                            {avgIsc}
                          </strong>
                        </div>
                      </div>

                      {/* Notes / Strategy */}
                      {comp.notes && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-[11px] text-slate-600 dark:text-slate-300 mb-4 border border-slate-100 dark:border-slate-800">
                          <strong>Padrão Criativo:</strong> {comp.notes}
                        </div>
                      )}
                    </div>

                    {/* Top Ads for this Competitor */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                        Campanhas Mais Duradouras:
                      </span>
                      {compAds.slice(0, 2).map((ad) => (
                        <div
                          key={ad.id}
                          onClick={() => setSelectedAd(ad)}
                          className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer flex items-center gap-2.5 text-xs transition-colors"
                        >
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden">
                            {ad.media_url ? (
                              <img src={ad.media_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <Layers className="w-4 h-4 text-slate-400 m-2.5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {ad.headline}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {formatDaysActive(ad.days_active_observed)} • ISC {ad.isc_score}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-xs text-slate-500">
            Selecione ao menos <strong>2 concorrentes</strong> acima para habilitar o comparativo detalhado lado a lado.
          </div>
        )}
      </div>

      {/* Modal Novo Concorrente */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Cadastrar Novo Concorrente
              </h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateCompetitor} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome da Empresa / Anunciante *
                </label>
                <input
                  type="text"
                  required
                  value={newCompetitorName}
                  onChange={(e) => setNewCompetitorName(e.target.value)}
                  placeholder="Ex: Construtora Cyrela Jardins"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nicho de Mercado
                </label>
                <input
                  type="text"
                  value={newCompetitorNiche}
                  onChange={(e) => setNewCompetitorNiche(e.target.value)}
                  placeholder="Ex: Imobiliárias de Alto Padrão"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Website Oficial (Opcional)
                </label>
                <input
                  type="url"
                  value={newCompetitorWebsite}
                  onChange={(e) => setNewCompetitorWebsite(e.target.value)}
                  placeholder="https://exemplo.com.br"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
