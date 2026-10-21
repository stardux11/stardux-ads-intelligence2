'use client';

import React from 'react';
import { X, ShieldCheck, Info, Sparkles } from 'lucide-react';
import { Ad } from '@/lib/types';
import { getISCTierInfo } from '@/lib/utils';

interface ISCBreakdownModalProps {
  ad: Ad | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ISCBreakdownModal({ ad, isOpen, onClose }: ISCBreakdownModalProps) {
  if (!isOpen || !ad) return null;

  const breakdown = ad.isc_breakdown;
  const tierInfo = getISCTierInfo(ad.isc_score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Índice de Sinais Criativos (ISC)
              </h3>
              <p className="text-[11px] text-slate-400">Composição explicável da pontuação</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score Summary */}
        <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {ad.isc_score}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 100 pts</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${tierInfo.badgeBg} border ${tierInfo.badgeBorder}`}>
                {tierInfo.label}
              </span>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
            <p>Veiculação Observada:</p>
            <p className="text-base font-bold text-slate-800 dark:text-slate-200">
              {ad.days_active_observed} {ad.days_active_observed === 1 ? 'dia' : 'dias'}
            </p>
          </div>
        </div>

        {/* 5 Dimensions Breakdown */}
        <div className="p-6 space-y-4 text-xs">
          {/* 1. Longevidade */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">1. Longevidade Observada</span>
              <span className="font-bold text-slate-900 dark:text-white">{breakdown.longevityScore} / 35 pts</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(breakdown.longevityScore / 35) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Tempo contínuo de veiculação ativa registrado pela fonte.</p>
          </div>

          {/* 2. Recorrência & Variações */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">2. Recorrência & Variações</span>
              <span className="font-bold text-slate-900 dark:text-white">{breakdown.recurrenceScore} / 25 pts</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(breakdown.recurrenceScore / 25) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Número de variações do criativo ou cópia ativas no mesmo período.</p>
          </div>

          {/* 3. Consistência do Anunciante */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">3. Presença do Anunciante</span>
              <span className="font-bold text-slate-900 dark:text-white">{breakdown.advertiserConsistencyScore} / 15 pts</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(breakdown.advertiserConsistencyScore / 15) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Histórico e volume de campanhas sustentadas pelo concorrente.</p>
          </div>

          {/* 4. Multiplataforma & Formato */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">4. Formato & Multiplataforma</span>
              <span className="font-bold text-slate-900 dark:text-white">{breakdown.multiFormatScore} / 15 pts</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(breakdown.multiFormatScore / 15) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Presença combinada (Facebook + Instagram) e formato rico (vídeo/carrossel).</p>
          </div>

          {/* 5. Confiabilidade da Fonte */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-slate-700 dark:text-slate-300">5. Confiabilidade da Fonte</span>
              <span className="font-bold text-slate-900 dark:text-white">{breakdown.sourceConfidenceScore} / 10 pts</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${(breakdown.sourceConfidenceScore / 10) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Origem confirmada via Meta Ad Library oficial vs importação manual.</p>
          </div>

          {/* Explanation Box */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white mb-1">
              <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Diagnóstico Técnico</span>
            </div>
            {breakdown.explanation}
          </div>

          {/* Strict Data Transparency Warning */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <p>
              <strong>Aviso de Transparência Stardux:</strong> Pontuações altas indicam maior probabilidade técnica de validação pelo concorrente devido à persistência de investimento. Não garantem nem estimam receita, ROAS ou volume financeiro de vendas.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
