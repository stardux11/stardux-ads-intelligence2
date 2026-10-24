'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Bookmark,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Play,
  Image as ImageIcon,
  Video,
  Loader2,
} from 'lucide-react';
import { Ad } from '@/lib/types';
import { formatDate, formatDaysActive, getISCTierInfo } from '@/lib/utils';
import { analyzeAdCreatively } from '@/lib/heuristic-analyzer';

interface AdDetailModalProps {
  ad: Ad | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveToCollection?: (ad: Ad) => void;
  onOpenISC?: (ad: Ad) => void;
}

interface MediaData {
  imageUrl: string | null;
  videoUrl: string | null;
  snapshotUrl?: string;
  error?: string;
}

function AdMediaPreview({ ad }: { ad: Ad }) {
  const [media, setMedia] = useState<MediaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (!ad.external_id) return;

    setLoading(true);
    setMedia(null);
    setImgError(false);
    setVideoError(false);

    fetch(`/api/ad-snapshot?id=${ad.external_id}&mode=media`)
      .then((r) => r.json())
      .then((data: MediaData) => {
        setMedia(data);
      })
      .catch(() => {
        setMedia({ imageUrl: null, videoUrl: null });
      })
      .finally(() => setLoading(false));
  }, [ad.external_id]);

  // Enquanto carrega
  if (loading) {
    return (
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col shadow-sm">
        <div className="bg-slate-100 dark:bg-slate-900 px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-semibold text-slate-800 dark:text-slate-200">Carregando Criativo…</span>
        </div>
        <div className="h-[360px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      </div>
    );
  }

  // Vídeo direto extraído
  const videoUrl = media?.videoUrl || (
    ad.media_url && ad.format === 'video' && !ad.media_url.includes('facebook.com')
      ? ad.media_url
      : null
  );

  if (videoUrl && !videoError) {
    return (
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex flex-col shadow-sm">
        <div className="bg-slate-900 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            Vídeo do Criativo
          </span>
          <a
            href={ad.snapshot_url || ad.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1"
          >
            <span>Ver na Meta</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="relative w-full bg-black">
          <video
            src={videoUrl}
            controls
            autoPlay={false}
            playsInline
            className="w-full max-h-[460px] object-contain"
            poster={ad.thumbnail_url || undefined}
            onError={() => setVideoError(true)}
          >
            Seu navegador não suporta reprodução de vídeo.
          </video>
        </div>
      </div>
    );
  }

  // Imagem direta extraída
  const imageUrl = media?.imageUrl || (
    ad.media_url && !ad.media_url.includes('facebook.com') && !ad.media_url.includes('render_ad')
      ? ad.media_url
      : null
  );

  if (imageUrl && !imgError) {
    return (
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex flex-col shadow-sm">
        <div className="bg-slate-900 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-200 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            Imagem do Criativo
          </span>
          <a
            href={ad.snapshot_url || ad.original_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1"
          >
            <span>Ver na Meta</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="relative bg-slate-950 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={ad.headline || ad.advertiser_name}
            className="w-full max-h-[460px] object-contain"
            onError={() => setImgError(true)}
          />
        </div>
      </div>
    );
  }

  // Fallback: thumbnail da página + botão de acesso à Meta
  const thumbUrl = ad.thumbnail_url;

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex flex-col shadow-sm">
      <div className="bg-slate-900 px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          Criativo Oficial Meta
        </span>
        <a
          href={ad.snapshot_url || ad.original_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold flex items-center gap-1"
        >
          <span>Abrir na Meta</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Preview visual com avatar + botão de ação */}
      <div className="relative h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950">
        {thumbUrl && (
          <img
            src={thumbUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-10 blur-lg scale-110"
          />
        )}
        <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
          {thumbUrl ? (
            <img
              src={thumbUrl}
              alt={ad.advertiser_name}
              className="w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-2xl"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-emerald-600/40 flex items-center justify-center text-3xl font-bold text-white shadow-2xl">
              {ad.advertiser_name.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div>
            <p className="text-white font-bold text-sm">{ad.advertiser_name}</p>
            <p className="text-slate-400 text-xs mt-0.5">
              {ad.format === 'video' ? 'Anúncio em Vídeo' : ad.format === 'carousel' ? 'Carrossel' : 'Anúncio de Imagem'}
            </p>
          </div>

          <div className="flex flex-col items-center gap-2 w-full max-w-[220px]">
            <a
              href={ad.snapshot_url || ad.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-lg shadow-emerald-900/30"
            >
              {ad.format === 'video' ? (
                <Play className="w-4 h-4 fill-current" />
              ) : (
                <ExternalLink className="w-3.5 h-3.5" />
              )}
              <span>
                {ad.format === 'video' ? 'Assistir Vídeo na Meta' : 'Ver Imagem na Meta'}
              </span>
            </a>
            <p className="text-slate-500 text-[10px] text-center leading-tight">
              O criativo completo está disponível na Biblioteca de Anúncios oficial da Meta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdDetailModal({
  ad,
  isOpen,
  onClose,
  onSaveToCollection,
  onOpenISC,
}: AdDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'strategy'>('content');

  if (!isOpen || !ad) return null;

  const tierInfo = getISCTierInfo(ad.isc_score);
  const analysis = analyzeAdCreatively(ad);

  const handleCopyCopy = () => {
    const textToCopy = `${ad.headline ? `${ad.headline}\n\n` : ''}${ad.body_text}${
      ad.cta_text ? `\n\nCTA: ${ad.cta_text}` : ''
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200">
              {ad.advertiser_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {ad.advertiser_name}
                </h3>
                {ad.is_demo && (
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-medium">
                    Dados de Demonstração
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>{ad.niche_name || 'Nicho Geral'}</span>
                <span>•</span>
                <span>Início em {formatDate(ad.started_at)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveToCollection && onSaveToCollection(ad)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
              <span>Salvar</span>
            </button>
            <a
              href={ad.snapshot_url || ad.original_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 text-xs font-semibold transition-opacity"
            >
              <span>Ver Original</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Top Summary Bar */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500">Longevidade:</span>
              <strong className="text-slate-800 dark:text-slate-200">
                {formatDaysActive(ad.days_active_observed)}
              </strong>
            </div>

            <div className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500">Formato:</span>
              <strong className="text-slate-800 dark:text-slate-200 uppercase">
                {ad.format}
              </strong>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Plataformas:</span>
              <strong className="text-slate-800 dark:text-slate-200 capitalize">
                {ad.platforms.join(', ')}
              </strong>
            </div>
          </div>

          <div
            onClick={() => onOpenISC && onOpenISC(ad)}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <span className="text-slate-500">Classificação:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${tierInfo.badgeBg} border ${tierInfo.badgeBorder}`}>
              ISC {ad.isc_score}/100 • {tierInfo.label}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex gap-4 text-xs">
          <button
            onClick={() => setActiveTab('content')}
            className={`py-3 font-semibold border-b-2 transition-colors ${
              activeTab === 'content'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Visualização &amp; Cópia
          </button>
          <button
            onClick={() => setActiveTab('strategy')}
            className={`py-3 font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'strategy'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Análise Estratégica (10 Dimensões)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === 'content' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Media Preview Column */}
              <div className="md:col-span-6 space-y-3">
                {ad.external_id ? (
                  <AdMediaPreview ad={ad} />
                ) : ad.thumbnail_url ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-square relative flex items-center justify-center">
                    <img
                      src={ad.thumbnail_url}
                      alt={ad.advertiser_name}
                      className="absolute inset-0 w-full h-full object-cover opacity-15 blur-md scale-110"
                    />
                    <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center">
                      <img
                        src={ad.thumbnail_url}
                        alt={ad.advertiser_name}
                        className="w-20 h-20 rounded-full object-cover border-2 border-white/20 shadow-2xl"
                      />
                      <p className="text-white font-bold text-sm">{ad.advertiser_name}</p>
                      <a
                        href={ad.snapshot_url || ad.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        <span>Ver Criativo na Meta</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-400">Origem: Meta Ad Library Oficial</span>
                  <a
                    href={ad.snapshot_url || ad.original_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Ver Snapshot Original</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Copy & Details Column */}
              <div className="md:col-span-6 space-y-4 text-xs">
                {/* Headline */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Título (Headline)
                  </span>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {ad.headline || 'Sem título cadastrado'}
                  </h4>
                </div>

                {/* Body Text */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Texto do Anúncio (Copy)
                    </span>
                    <button
                      onClick={handleCopyCopy}
                      className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-line font-sans">
                    {ad.body_text}
                  </div>
                </div>

                {/* Call To Action & Destination */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Chamada de Ação (CTA)</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {ad.cta_text || 'Saiba mais'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Destino</span>
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block truncate">
                      {ad.destination_url || 'Página de Destino'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Strategic 10 Dimensions Breakdown */
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/60 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Análise Estratégica do Criativo
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                    Decomposição estrutural realizada pelo Analista de Inteligência da Stardux. Identifica padrões persuasivos e hipóteses de continuidade sem inferir métricas financeiras.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Gancho */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    1. Gancho Inicial (Hook)
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {analysis.hook_analysis}
                  </p>
                </div>

                {/* 2. Estrutura */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    2. Estrutura da Mensagem
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {analysis.copy_structure}
                  </p>
                </div>

                {/* 3. Problema */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    3. Problema / Dor Abordada
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {analysis.problem_addressed}
                  </p>
                </div>

                {/* 4. Desejo */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    4. Desejo / Aspiração
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {analysis.desire_explored}
                  </p>
                </div>

                {/* 5. Oferta */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    5. Oferta &amp; Condições
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {analysis.offer_analysis}
                  </p>
                </div>

                {/* 6. Público */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    6. Público-Alvo Inferido
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {analysis.audience_inferred}
                  </p>
                </div>

                {/* 7. Prova Social */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    7. Prova Social / Autoridade
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {analysis.social_proof}
                  </p>
                </div>

                {/* 8. Objeções */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    8. Quebra de Objeções
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {analysis.objections_handled}
                  </p>
                </div>

                {/* 9. Estilo Criativo */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    9. Estilo Criativo &amp; Formato
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {analysis.creative_style}
                  </p>
                </div>

                {/* 10. Hipóteses de Longevidade */}
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    10. Hipóteses de Continuidade
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                    {analysis.longevity_hypotheses}
                  </p>
                </div>
              </div>

              {/* Recomendações de Teste */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <h5 className="font-bold text-slate-900 dark:text-white mb-2 text-xs">
                  Recomendações Práticas para Novos Testes:
                </h5>
                <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                  {analysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verificação: {formatDate(ad.last_verified_at)}</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
