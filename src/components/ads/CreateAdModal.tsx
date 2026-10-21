'use client';

import React, { useState } from 'react';
import { X, PlusCircle, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { Ad, AdFormat, Platform } from '@/lib/types';
import { calculateISC } from '@/lib/isc';

interface CreateAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAd: Ad) => void;
  niches?: Array<{ id: string; name: string }>;
  advertisers?: Array<{ id: string; name: string }>;
}

export function CreateAdModal({ isOpen, onClose, onSuccess, niches = [], advertisers = [] }: CreateAdModalProps) {
  const [advertiserName, setAdvertiserName] = useState('');
  const [nicheId, setNicheId] = useState('');
  const [headline, setHeadline] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [ctaText, setCtaText] = useState('Saiba mais');
  const [format, setFormat] = useState<AdFormat>('image');
  const [platforms, setPlatforms] = useState<Platform[]>(['facebook', 'instagram']);
  const [startedAt, setStartedAt] = useState('2026-10-20');
  const [originalUrl, setOriginalUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Cálculo ao vivo do ISC
  const diffDays = Math.max(1, Math.floor((Date.now() - new Date(startedAt).getTime()) / (1000 * 60 * 60 * 24)));
  const liveISC = calculateISC({
    daysActive: diffDays,
    variationCount: 1,
    advertiserActiveAdsCount: 2,
    format,
    platforms,
    source: 'manual_import',
    originalUrl,
  });

  const togglePlatform = (p: Platform) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter(x => x !== p));
      }
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advertiserName.trim()) {
      setErrorMsg('Informe o nome do anunciante.');
      return;
    }
    if (!headline.trim() && !bodyText.trim()) {
      setErrorMsg('Preencha ao menos o título ou o texto principal do anúncio.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const selectedNicheObj = niches.find(n => n.id === nicheId);

    try {
      const res = await fetch('/api/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          advertiser_name: advertiserName.trim(),
          niche_id: nicheId || undefined,
          niche_name: selectedNicheObj?.name,
          headline: headline.trim(),
          body_text: bodyText.trim(),
          cta_text: ctaText.trim(),
          format,
          platforms,
          started_at: new Date(startedAt).toISOString(),
          original_url: originalUrl.trim() || `https://www.facebook.com/ads/library/?q=${encodeURIComponent(advertiserName)}`,
          media_url: mediaUrl.trim() || undefined,
          source: 'manual_import',
          is_demo: false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        onSuccess(data.ad);
        onClose();
      } else {
        setErrorMsg(data.error || 'Erro ao cadastrar anúncio.');
      }
    } catch {
      setErrorMsg('Falha na comunicação com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Cadastrar Anúncio Manualmente
              </h3>
              <p className="text-[11px] text-slate-400">
                Insira dados reais observados na Biblioteca da Meta
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Anunciante e Nicho */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nome do Anunciante *
              </label>
              <input
                type="text"
                required
                value={advertiserName}
                onChange={(e) => setAdvertiserName(e.target.value)}
                placeholder="Ex: Imóveis Prime Jardins"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Nicho de Mercado
              </label>
              <select
                value={nicheId}
                onChange={(e) => setNicheId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Selecione ou deixe em branco...</option>
                {niches.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Headline */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Título do Anúncio (Headline) *
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Ex: Apartamentos de 240m² nos Jardins com 4 Suítes"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Body Text */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Texto Principal (Copy do Anúncio)
            </label>
            <textarea
              rows={3}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              placeholder="Cole aqui a cópia completa do anúncio..."
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Formato, CTA e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Formato
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="video">Vídeo</option>
                <option value="image">Imagem Estática</option>
                <option value="carousel">Carrossel</option>
                <option value="story_reels">Story / Reels</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Botão de Ação (CTA)
              </label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Ex: Saiba mais"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Data de Início Observada
              </label>
              <input
                type="date"
                value={startedAt}
                onChange={(e) => setStartedAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Plataformas */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Plataformas Observadas
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => togglePlatform('facebook')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  platforms.includes('facebook')
                    ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => togglePlatform('instagram')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  platforms.includes('instagram')
                    ? 'bg-pink-50 border-pink-300 text-pink-700 dark:bg-pink-950/40 dark:border-pink-800 dark:text-pink-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                Instagram
              </button>
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                URL na Biblioteca da Meta (Opcional)
              </label>
              <input
                type="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://facebook.com/ads/library/?id=..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                URL da Imagem / Criativo (Opcional)
              </label>
              <input
                type="url"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://... imagem do criativo"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Live ISC Preview */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  ISC Estimado: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{liveISC.totalScore}/100</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  Calculado para {diffDays} {diffDays === 1 ? 'dia' : 'dias'} de veiculação observada
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
              {liveISC.tierLabel}
            </span>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <span>Salvar Anúncio</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
