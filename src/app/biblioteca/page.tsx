'use client';

import React, { useState, useEffect } from 'react';
import {
  BookmarkCheck,
  Folder,
  Plus,
  Trash2,
  Tag,
  ExternalLink,
  Layers,
  Sparkles,
  Search,
  Download,
  Loader2,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Collection, CollectionItem, Ad } from '@/lib/types';
import { formatDaysActive, formatDate, getISCTierInfo } from '@/lib/utils';
import { AdDetailModal } from '@/components/ads/AdDetailModal';
import { ISCBreakdownModal } from '@/components/ads/ISCBreadownModal';

export default function BibliotecaPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string>('');
  const [items, setItems] = useState<CollectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterKeyword, setFilterKeyword] = useState('');

  // Modals
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [adForISC, setAdForISC] = useState<Ad | null>(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [showAddCollection, setShowAddCollection] = useState(false);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/collections');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCollections(data);
        if (data.length > 0 && !activeCollectionId) {
          setActiveCollectionId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async (collId: string) => {
    if (!collId) return;
    try {
      const res = await fetch(`/api/collections/${collId}/items`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCollections();
    const handleUpdate = () => {
      fetchCollections();
      if (activeCollectionId) fetchItems(activeCollectionId);
    };
    window.addEventListener('stardux-data-updated', handleUpdate);
    return () => window.removeEventListener('stardux-data-updated', handleUpdate);
  }, []);

  useEffect(() => {
    if (activeCollectionId) {
      fetchItems(activeCollectionId);
    }
  }, [activeCollectionId]);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollectionName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNewCollectionName('');
        setShowAddCollection(false);
        fetchCollections();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveItem = async (adId: string) => {
    if (!activeCollectionId) return;
    try {
      await fetch(`/api/collections/${activeCollectionId}/items?ad_id=${adId}`, {
        method: 'DELETE',
      });
      fetchItems(activeCollectionId);
      fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!filterKeyword) return true;
    const kw = filterKeyword.toLowerCase();
    const ad = item.ad;
    return (
      item.personal_notes?.toLowerCase().includes(kw) ||
      item.tags.some((t) => t.toLowerCase().includes(kw)) ||
      ad?.headline.toLowerCase().includes(kw) ||
      ad?.advertiser_name.toLowerCase().includes(kw)
    );
  });

  const activeCollection = collections.find((c) => c.id === activeCollectionId);

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Biblioteca & Referências Criativas
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Coleções salvas, anotações de copywriters e banco de ganchos para futuras campanhas da agência.
            </p>
          </div>

          <button
            onClick={() => setShowAddCollection(!showAddCollection)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.02]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Pasta</span>
          </button>
        </div>

        {/* Modal / In-line New Collection */}
        {showAddCollection && (
          <form
            onSubmit={handleCreateCollection}
            className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3 text-xs"
          >
            <Folder className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <input
              type="text"
              required
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Nome da pasta (ex: Melhores Vídeos UGC, Ganchos de Dor)..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs shrink-0"
            >
              Criar Pasta
            </button>
            <button
              type="button"
              onClick={() => setShowAddCollection(false)}
              className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-xs shrink-0"
            >
              Cancelar
            </button>
          </form>
        )}

        {/* Collections Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          {collections.map((coll) => {
            const isActive = coll.id === activeCollectionId;
            return (
              <button
                key={coll.id}
                onClick={() => setActiveCollectionId(coll.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>{coll.name}</span>
                <span className="text-[10px] opacity-70">({coll.items_count || 0})</span>
              </button>
            );
          })}
        </div>

        {/* Search inside collection */}
        <div className="flex items-center justify-between gap-4 text-xs">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              placeholder="Filtrar nesta pasta por anotação, tag ou título..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <a
            href="/api/ads/export?format=csv"
            download
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Exportar CSV</span>
          </a>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Carregando referências salvas...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40">
            <BookmarkCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Nenhuma referência nesta pasta
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Ao explorar anúncios, clique no ícone de marcador para salvar e organizar suas melhores referências criativas aqui.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((item) => {
              const ad = item.ad;
              if (!ad) return null;
              const tier = getISCTierInfo(ad.isc_score);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Media Thumbnail */}
                    <div
                      onClick={() => setSelectedAd(ad)}
                      className="aspect-[16/9] bg-slate-100 dark:bg-slate-800 relative cursor-pointer overflow-hidden border-b border-slate-100 dark:border-slate-800"
                    >
                      {ad.media_url ? (
                        <img src={ad.media_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <Layers className="w-6 h-6" />
                        </div>
                      )}
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-bold">
                        {formatDaysActive(ad.days_active_observed)}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px]">
                          {ad.advertiser_name}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${tier.badgeBg}`}>
                          ISC {ad.isc_score}
                        </span>
                      </div>

                      <h4
                        onClick={() => setSelectedAd(ad)}
                        className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 cursor-pointer hover:text-emerald-600"
                      >
                        {ad.headline}
                      </h4>

                      {/* Personal Notes Box */}
                      {item.personal_notes && (
                        <div className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300">
                          <strong>Nota:</strong> {item.personal_notes}
                        </div>
                      )}

                      {/* Tags */}
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleRemoveItem(ad.id)}
                      className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remover</span>
                    </button>

                    <button
                      onClick={() => setSelectedAd(ad)}
                      className="px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Shared Modals */}
      <AdDetailModal
        ad={selectedAd}
        isOpen={Boolean(selectedAd)}
        onClose={() => setSelectedAd(null)}
      />

      <ISCBreakdownModal
        ad={adForISC}
        isOpen={Boolean(adForISC)}
        onClose={() => setAdForISC(null)}
      />
    </Shell>
  );
}
