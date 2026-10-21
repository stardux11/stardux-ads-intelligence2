'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Layers,
  Sparkles,
  Bookmark,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Ad } from '@/lib/types';
import { formatDate, formatDaysActive, getISCTierInfo } from '@/lib/utils';
import { analyzeAdCreatively } from '@/lib/heuristic-analyzer';
import { ISCBreakdownModal } from '@/components/ads/ISCBreadownModal';
import { SaveToCollectionModal } from '@/components/collections/SaveToCollectionModal';
import { Suspense } from 'react';

function AnuncioDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isISCOpen, setIsISCOpen] = useState(false);
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`/api/ads/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data && !data.error) setAd(data);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <Shell>
        <div className="py-24 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500">Carregando detalhes do anúncio...</p>
        </div>
      </Shell>
    );
  }

  if (!ad) {
    return (
      <Shell>
        <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 max-w-lg mx-auto">
          <h2 className="font-bold text-base text-slate-900 dark:text-white mb-2">
            Anúncio não encontrado
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            O anúncio solicitado pode ter sido removido ou o identificador é inválido.
          </p>
          <Link
            href="/explorar"
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs inline-block"
          >
            Voltar para Explorar Anúncios
          </Link>
        </div>
      </Shell>
    );
  }

  const tierInfo = getISCTierInfo(ad.isc_score);
  const analysis = analyzeAdCreatively(ad);

  const handleCopy = () => {
    navigator.clipboard.writeText(`${ad.headline}\n\n${ad.body_text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Shell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCollectionOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
              <span>Salvar na Coleção</span>
            </button>

            <a
              href={ad.original_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 hover:opacity-90 text-white dark:text-slate-900 text-xs font-semibold"
            >
              <span>Ver na Meta Ad Library</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded">
                  {ad.niche_name || 'Nicho Geral'}
                </span>
                <span className="text-xs text-slate-400">
                  Início em {formatDate(ad.started_at)}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
                {ad.advertiser_name}
              </h1>
            </div>

            <button
              onClick={() => setIsISCOpen(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${tierInfo.badgeBg} border ${tierInfo.badgeBorder} flex items-center gap-2 shrink-0`}
            >
              <Sparkles className="w-4 h-4" />
              <span>ISC {ad.isc_score}/100 • {tierInfo.label}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Visual media */}
            <div className="md:col-span-5 space-y-3">
              <div className="aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                {ad.media_url ? (
                  <img src={ad.media_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Layers className="w-12 h-12 text-slate-400" />
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>Longevidade: <strong>{formatDaysActive(ad.days_active_observed)}</strong></span>
                <span className="uppercase font-semibold">{ad.format}</span>
              </div>
            </div>

            {/* Copy */}
            <div className="md:col-span-7 space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[11px] block mb-1">
                  Título (Headline)
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {ad.headline}
                </h3>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 font-semibold uppercase text-[11px]">
                    Texto Completo (Copy)
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-emerald-600 font-semibold flex items-center gap-1 hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line text-xs">
                  {ad.body_text}
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                    Chamada para Ação
                  </span>
                  <strong className="text-xs text-slate-900 dark:text-white block mt-0.5">
                    {ad.cta_text || 'Saiba mais'}
                  </strong>
                </div>
                <span className="text-[11px] text-slate-400 capitalize">
                  {ad.platforms.join(' / ')}
                </span>
              </div>
            </div>
          </div>

          {/* 10 Strategic Analysis Section */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <span>Análise Estratégica Completa (10 Dimensões)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <strong className="block text-slate-900 dark:text-white mb-1">1. Gancho Inicial (Hook):</strong>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">{analysis.hook_analysis}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <strong className="block text-slate-900 dark:text-white mb-1">2. Estrutura da Mensagem:</strong>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">{analysis.copy_structure}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <strong className="block text-slate-900 dark:text-white mb-1">3. Problema / Dor:</strong>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">{analysis.problem_addressed}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <strong className="block text-slate-900 dark:text-white mb-1">4. Desejo Explorado:</strong>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">{analysis.desire_explored}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <strong className="block text-slate-900 dark:text-white mb-1">5. Oferta & Mecanismo:</strong>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">{analysis.offer_analysis}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <strong className="block text-slate-900 dark:text-white mb-1">6. Público-Alvo:</strong>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">{analysis.audience_inferred}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <strong className="block text-slate-900 dark:text-white mb-1">7. Prova Social:</strong>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">{analysis.social_proof}</p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <strong className="block text-slate-900 dark:text-white mb-1">8. Objeções Trabalhadas:</strong>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">{analysis.objections_handled}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ISCBreakdownModal ad={ad} isOpen={isISCOpen} onClose={() => setIsISCOpen(false)} />
      <SaveToCollectionModal ad={ad} isOpen={isCollectionOpen} onClose={() => setIsCollectionOpen(false)} />
    </Shell>
  );
}

export default function AnuncioDetailPage() {
  return (
    <Suspense
      fallback={
        <Shell>
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Carregando detalhes do anúncio...</p>
          </div>
        </Shell>
      }
    >
      <AnuncioDetailContent />
    </Suspense>
  );
}
