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
      {/* Top Media / Thumbnail Section */}
      <div
        onClick={() => onOpenDetail(ad)}
        className="aspect-[16/10] bg-slate-100 dark:bg-slate-800 relative cursor-pointer overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-slate-800/80"
      >
        {ad.media_url && !ad.media_url.includes('render_ad') ? (
          <img
            src={ad.media_url}
            alt={ad.headline}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : ad.snapshot_url ? (
          <div className="w-full h-full relative overflow-hidden bg-slate-950 flex items-center justify-center">
            <iframe
              src={ad.snapshot_url}
              title={ad.headline}
              className="w-[180%] h-[180%] pointer-events-none scale-50 origin-top-left border-0 opacity-90"
              scrolling="no"
              tabIndex={-1}
            />
            <div className="absolute inset-0 bg-transparent" />
          </div>
        ) : (
          <div className="text-center p-4 text-slate-400">
            <Layers className="w-8 h-8 mx-auto mb-1 opacity-50" />
            <p className="text-[11px] font-medium">Prévia na Meta</p>
          </div>
        )}

        {/* Video Overlay Badge */}
        {ad.format === 'video' && (
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1">
            <Video className="w-3 h-3" />
            <span>Vídeo</span>
          </div>
        )}

        {/* Longevity Badge (Highlight) */}
        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold shadow-sm flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-emerald-400" />
          <span>{formatDaysActive(ad.days_active_observed)}</span>
        </div>

        {/* Demo Data Tag */}
        {ad.is_demo && (
          <div className="absolute bottom-2 left-2.5 px-1.5 py-0.5 rounded bg-slate-900/70 text-slate-300 text-[9px] font-medium tracking-wide">
            Demonstração
          </div>
        )}
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
