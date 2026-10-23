'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  Bookmark,
  Calendar,
  Layers,
  Sparkles,
  Copy,
  Check,
  Video,
  Image as ImageIcon,
  LayoutGrid,
} from 'lucide-react';
import { Ad } from '@/lib/types';
import { formatDate, formatDaysActive, getISCTierInfo } from '@/lib/utils';

interface AdCardProps {
  ad: Ad;
  onOpenDetail: (ad: Ad) => void;
  onSaveToCollection: (ad: Ad) => void;
  onOpenISC: (ad: Ad) => void;
}

export function AdCard({ ad, onOpenDetail, onSaveToCollection, onOpenISC }: AdCardProps) {
  const [copied, setCopied] = useState(false);
  const tierInfo = getISCTierInfo(ad.isc_score);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `${ad.headline ? `${ad.headline}\n\n` : ''}${ad.body_text}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFormatIcon = () => {
    if (ad.format === 'video') return <Video className="w-3 h-3" />;
    if (ad.format === 'carousel') return <LayoutGrid className="w-3 h-3" />;
    return <ImageIcon className="w-3 h-3" />;
  };

  return (
    <div className="group rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col overflow-hidden relative">
      {/* Top Media / Creative Section */}
      <div
        onClick={() => onOpenDetail(ad)}
        className="aspect-[16/10] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 relative cursor-pointer overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-slate-800/80 group"
      >
        {/* Mídia real direta (ex: imagem do CDN) */}
        {ad.media_url && !ad.media_url.includes('render_ad') && !ad.media_url.includes('snapshot_url') && !ad.media_url.includes('facebook.com/ads') ? (
          <img
            src={ad.media_url}
            alt={ad.headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : ad.thumbnail_url ? (
          /* Foto da página anunciante como preview visual */
          <div className="w-full h-full relative">
            {/* Thumbnail/avatar da página como fundo com blur */}
            <img
              src={ad.thumbnail_url}
              alt={ad.advertiser_name}
              className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm scale-110"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            {/* Overlay de gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/90" />

            {/* Conteúdo central */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
              {/* Avatar da página centralizado */}
              <img
                src={ad.thumbnail_url}
                alt={ad.advertiser_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/20 shadow-xl group-hover:scale-110 transition-transform duration-200"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="text-[11px] font-semibold text-white/90 truncate max-w-[160px]">
                {ad.advertiser_name}
              </span>

              {/* Ícone de formato */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                ad.format === 'video'
                  ? 'bg-emerald-500/80 text-white'
                  : ad.format === 'carousel'
                  ? 'bg-indigo-500/80 text-white'
                  : 'bg-white/15 text-white/80'
              }`}>
                {getFormatIcon()}
                <span>{ad.format === 'video' ? 'Vídeo' : ad.format === 'carousel' ? 'Carrossel' : 'Imagem'}</span>
              </div>

              {/* Botão de ação */}
              <a
                href={ad.snapshot_url || ad.original_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-emerald-500/90 text-white text-[10px] font-medium backdrop-blur-md border border-white/15 transition-all mt-0.5"
              >
                <span>Ver Criativo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Badge Oficial Meta */}
            <div className="absolute bottom-2 right-2 text-[9px] text-emerald-400 font-semibold bg-emerald-950/70 border border-emerald-500/30 px-1.5 py-0.5 rounded z-10">
              Oficial Meta
            </div>
          </div>
        ) : (
          /* Creative Stage Fallback */
          <div className="w-full h-full relative flex flex-col items-center justify-center p-4 text-center select-none">
            {/* Background Decorativo */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent opacity-70" />

            {/* Ícone Central por Formato */}
            <div className="relative z-10 flex flex-col items-center gap-2">
              {ad.format === 'video' ? (
                <>
                  <div className="w-13 h-13 rounded-full bg-emerald-500/90 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-400 transition-all duration-200">
                    <Video className="w-6 h-6 ml-0.5" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-wide">
                    Criativo em Vídeo
                  </span>
                </>
              ) : ad.format === 'carousel' ? (
                <>
                  <div className="w-13 h-13 rounded-full bg-indigo-500/90 text-white shadow-lg shadow-indigo-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-400 transition-all duration-200">
                    <LayoutGrid className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-wide">
                    Carrossel de Criativos
                  </span>
                </>
              ) : (
                <>
                  <div className="w-13 h-13 rounded-full bg-slate-700/80 text-white shadow-md flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 transition-all duration-200">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-white tracking-wide">
                    Criativo Oficial Meta
                  </span>
                </>
              )}

              {/* Botão de Ação Rápida */}
              <a
                href={ad.original_url || ad.snapshot_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-emerald-500/90 text-white hover:text-white text-[11px] font-medium backdrop-blur-md border border-white/15 transition-all mt-1"
                title="Abrir reprodutor de criativo na Biblioteca Oficial da Meta"
              >
                <span>Ver Criativo na Meta</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Bottom Advertiser Brand Bar */}
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-left z-10">
              <div className="flex items-center gap-2 max-w-[75%]">
                <div className="w-5 h-5 rounded-full bg-white/10 text-[9px] font-bold text-white flex items-center justify-center shrink-0">
                  {ad.advertiser_name.charAt(0)}
                </div>
                <span className="text-[10px] text-slate-300 truncate font-medium">
                  {ad.advertiser_name}
                </span>
              </div>
              <span className="text-[9px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                Oficial Meta
              </span>
            </div>
          </div>
        )}


        {/* Format Badge */}
        {ad.format === 'video' && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1 z-20">
            <Video className="w-3 h-3 text-emerald-400" />
            <span>Vídeo</span>
          </div>
        )}
        {ad.format === 'carousel' && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1 z-20">
            <LayoutGrid className="w-3 h-3 text-indigo-400" />
            <span>Carrossel</span>
          </div>
        )}
        {ad.format === 'image' && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1 z-20">
            <ImageIcon className="w-3 h-3 text-slate-300" />
            <span>Imagem</span>
          </div>
        )}

        {/* Longevity Badge */}
        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur-md text-white text-[11px] font-bold shadow-sm flex items-center gap-1.5 z-20 border border-white/10">
          <Calendar className="w-3 h-3 text-emerald-400" />
          <span>{formatDaysActive(ad.days_active_observed)}</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between text-xs">
        <div>
          {/* Advertiser & Format */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[180px] hover:text-emerald-600 transition-colors">
              {ad.advertiser_name}
            </span>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {getFormatIcon()}
              <span>{ad.format}</span>
            </div>
          </div>

          {/* Headline */}
          <h4
            onClick={() => onOpenDetail(ad)}
            className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400 text-xs mb-1.5"
            title={ad.headline}
          >
            {ad.headline}
          </h4>

          {/* Copy Preview */}
          <p className="text-slate-500 dark:text-slate-400 line-clamp-3 text-[11px] leading-relaxed mb-3">
            {ad.body_text}
          </p>
        </div>

        {/* Metrics & Classification Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            {/* Interactive ISC Pill */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenISC(ad);
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${tierInfo.badgeBg} border ${tierInfo.badgeBorder} hover:scale-105 transition-all`}
              title="Clique para ver a composição detalhada do Índice de Sinais Criativos"
            >
              <Sparkles className="w-3 h-3" />
              <span>ISC {ad.isc_score}</span>
              <span className="text-[10px] font-normal opacity-80">• {tierInfo.label}</span>
            </button>

            {/* Platforms */}
            <div className="text-[10px] font-medium text-slate-400 capitalize">
              {ad.platforms.join(' / ')}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Copiar texto do anúncio"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveToCollection(ad);
                }}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Salvar na Biblioteca"
              >
                <Bookmark className="w-3.5 h-3.5" />
              </button>

              <a
                href={ad.original_url}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                title="Abrir anúncio original na Biblioteca da Meta"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <button
              type="button"
              onClick={() => onOpenDetail(ad)}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-semibold text-xs transition-colors"
            >
              Ver Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
