'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  ShieldAlert,
  Coins,
  CheckCircle2,
  HelpCircle,
  Lightbulb,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { AIAnalysis, Ad, Niche, ResearchProject } from '@/lib/types';
import { AdDetailModal } from '@/components/ads/AdDetailModal';

const SAMPLE_QUERIES = [
  'Quais são os ganchos mais usados pelas imobiliárias nos Jardins?',
  'Quais anúncios estão há mais tempo em veiculação e por quê?',
  'Quais tipos de ofertas aparecem com maior frequência nas clínicas odontológicas?',
  'Quais abordagens de copywriting predominam nos cursos online?',
  'O que posso testar em uma nova campanha para moda sustentável?',
];

export default function IAAnalistaPage() {
  const [query, setQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [niches, setNiches] = useState<Niche[]>([]);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);

  useEffect(() => {
    // Carrega filtros
    Promise.all([fetch('/api/projects'), fetch('/api/stats')])
      .then(async ([pRes, sRes]) => {
        const pData = await pRes.json();
        const sData = await sRes.json();
        if (Array.isArray(pData)) setProjects(pData);
        if (sData?.nicheDistribution) {
          const list: Niche[] = Object.keys(sData.nicheDistribution).map((name) => ({
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

    // Carrega uma análise inicial default
    handleRunAnalysis('Visão geral de ganchos e padrões criativos do mercado');
  }, []);

  const handleRunAnalysis = async (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          niche: selectedNiche !== 'all' ? selectedNiche : undefined,
          project_id: selectedProjectId !== 'all' ? selectedProjectId : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setAnalysis(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Analista Criativo com Inteligência Artificial
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Stardux Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Faça perguntas estratégicas em linguagem natural para sintetizar padrões dos anúncios observados.
            </p>
          </div>

          {/* Model Status & Cost Tracker */}
          {analysis && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs shadow-xs">
              <Coins className="w-4 h-4 text-emerald-500" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-[11px] leading-tight">
                  {analysis.model_used}
                </p>
                <p className="text-[10px] text-slate-400">
                  {analysis.is_offline_heuristic ? 'Zero Custo (Offline)' : `Est. $${analysis.estimated_cost_usd} USD`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Query Input Section */}
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Filtro de Análise:</span>
            <select
              value={selectedNiche}
              onChange={(e) => setSelectedNiche(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Todos os Nichos</option>
              {niches.map((n) => (
                <option key={n.id} value={n.name}>
                  {n.name}
                </option>
              ))}
            </select>

            {projects.length > 0 && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">Todos os Projetos</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunAnalysis();
              }}
              placeholder="Digite sua pergunta (ex: Quais ganchos de curiosidade aparecem nos anúncios de maior longevidade?)..."
              className="w-full pl-4 pr-24 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              onClick={() => handleRunAnalysis()}
              disabled={loading || !query.trim()}
              className="absolute right-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Analisar</span>
                  <Send className="w-3 h-3" />
                </>
              )}
            </button>
          </div>

          {/* Quick Sample Questions */}
          <div className="pt-1">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Sugestões de Perguntas Estratégicas:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUERIES.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(sample);
                    handleRunAnalysis(sample);
                  }}
                  className="text-left px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Container */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              O Analista Criativo está examinando os textos, ganchos e formatos...
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Processando estritamente sinais observáveis sem gerar métricas de faturamento fictícias.
            </p>
          </div>
        ) : analysis ? (
          <div className="space-y-6 text-xs">
            {/* Executive Summary Card */}
            <div className="p-6 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50/50 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Resumo Executivo da Análise
                </h3>
              </div>
              <p className="text-slate-700 dark:text-slate-200 text-xs leading-relaxed">
                {analysis.executive_summary}
              </p>
            </div>

            {/* 10 Strategic Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Ganchos Recorrentes (Hooks)
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {analysis.hook_analysis}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Estrutura de Copywriting
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {analysis.copy_structure}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Problemas & Dores Identificadas
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {analysis.problem_addressed}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Desejos & Aspirações
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {analysis.desire_explored}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Padrões de Ofertas & CTAs
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {analysis.offer_analysis}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Público-Alvo Inferido
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {analysis.audience_inferred}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Mecanismos de Prova Social
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {analysis.social_proof}
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Hipóteses de Longevidade Observada
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11px]">
                  {analysis.longevity_hypotheses}
                </p>
              </div>
            </div>

            {/* Recommendations Section */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3 text-sm">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Oportunidades & Recomendações Práticas para Testes:</span>
              </h4>
              <div className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {i + 1}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 text-xs">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <AdDetailModal
        ad={selectedAd}
        isOpen={Boolean(selectedAd)}
        onClose={() => setSelectedAd(null)}
      />
    </Shell>
  );
}
