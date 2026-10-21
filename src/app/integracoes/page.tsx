'use client';

import React, { useState, useEffect } from 'react';
import {
  Cable,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { ProviderStatus } from '@/lib/providers/types';

export default function IntegracoesPage() {
  const [providers, setProviders] = useState<ProviderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/integrations');
      const data = await res.json();
      if (Array.isArray(data)) setProviders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Conectores & Provedores de Dados
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Arquitetura Data Providers para ingestão de anúncios da Meta, importações e webhooks.
            </p>
          </div>

          <button
            onClick={fetchProviders}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar Status</span>
          </button>
        </div>

        {/* Regulatory & Scrape-Free Disclaimer */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-slate-900 dark:text-white">
              Conformidade e Integridade de Coleta
            </h4>
            <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
              A Stardux Ad Intelligence não utiliza raspagem não autorizada (scraping), bypass de CAPTCHA ou métodos que violem os termos de serviço da Meta. Nossos conectores operam via <strong>API Oficial Meta Graph</strong>, <strong>importações estruturadas de dados públicos autorizados</strong> e <strong>webhooks protegidos</strong>.
            </p>
          </div>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((p) => {
            const isOperational = p.status === 'operational';

            return (
              <div
                key={p.id}
                className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Tipo: {p.type}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isOperational
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                      }`}
                    >
                      {isOperational ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      <span>{isOperational ? 'Operacional' : 'Requer Credenciais'}</span>
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">
                    {p.name}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-4">
                    {p.notes}
                  </p>

                  {/* Capabilities List */}
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                    <div className="flex items-center justify-between">
                      <span>Consulta direta na API:</span>
                      <strong className={p.supportedFeatures.canSearchDirectly ? 'text-emerald-600' : 'text-slate-400'}>
                        {p.supportedFeatures.canSearchDirectly ? 'Suportado' : 'Não aplicável'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Importação em lote CSV:</span>
                      <strong className={p.supportedFeatures.canImportCSV ? 'text-emerald-600' : 'text-slate-400'}>
                        {p.supportedFeatures.canImportCSV ? 'Suportado' : 'Não aplicável'}
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cobertura de Anúncios Comerciais (BR):</span>
                      <strong className="text-slate-700 dark:text-slate-300 capitalize">
                        {p.supportedFeatures.brazilCommercialCoverage.replace(/_/g, ' ')}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Verificado recentemente</span>
                  <a
                    href="/configuracoes"
                    className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Configurar</span>
                    <Sliders className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell>
  );
}
