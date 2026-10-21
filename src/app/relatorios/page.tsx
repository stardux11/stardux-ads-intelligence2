'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Building2,
  Calendar,
  Layers,
  X,
  Loader2,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { Report, ResearchProject } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function RelatoriosPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [activeReportId, setActiveReportId] = useState<string>('');
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Novo Relatório
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [summary, setSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [repRes, projRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/projects'),
      ]);
      const repData = await repRes.json();
      const projData = await projRes.json();

      if (Array.isArray(repData)) {
        setReports(repData);
        if (repData.length > 0 && !activeReportId) {
          setActiveReportId(repData[0].id);
        }
      }
      if (Array.isArray(projData)) setProjects(projData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setIsSaving(true);

    const proj = projects.find((p) => p.id === selectedProjectId);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          project_id: selectedProjectId || undefined,
          niche_name: proj?.niche_name || 'Geral',
          summary:
            summary.trim() ||
            'Relatório estratégico compilado com base na observação sistemática de anúncios ativos e sinais de longevidade na Biblioteca da Meta.',
          ads_count: 5,
          competitors_analyzed: ['Imóveis Prime Jardins', 'Reserva Ibirapuera', 'Vanguard Jardins'],
          trends_identified: [
            {
              title: 'Vídeos de Tour Dinâmico',
              description: 'Formato com maior sustentação ativa observada (>90 dias).',
              frequency: '70% dos criativos',
            },
            {
              title: 'Chamadas Diretas para WhatsApp',
              description: 'Substituição de cadastros longos por conversa imediata.',
              frequency: '65% das campanhas',
            },
          ],
          strategic_recommendations: [
            {
              priority: 'alta',
              action: 'Produzir tours em vídeo vertical no formato Reels.',
              rationale: 'Maior longevidade comprovada entre concorrentes.',
            },
            {
              priority: 'média',
              action: 'Enfatizar facilidade de contato e condições de pré-lançamento.',
              rationale: 'Menor resistência de entrada do consumidor.',
            },
          ],
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setTitle('');
        setSummary('');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeReport = reports.find((r) => r.id === activeReportId) || reports[0];

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header (Hidden on Print) */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Relatórios Estratégicos de Inteligência
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Documentos profissionais executivos prontos para apresentação a clientes da Stardux ou exportação em PDF.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Novo Relatório</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.02]"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar em PDF</span>
            </button>
          </div>
        </div>

        {/* Report Selector Tabs (Hidden on Print) */}
        {reports.length > 1 && (
          <div className="no-print flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            {reports.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveReportId(r.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  r.id === activeReport?.id
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                }`}
              >
                {r.title}
              </button>
            ))}
          </div>
        )}

        {/* Printable Professional Report Document */}
        {activeReport ? (
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md p-8 md:p-12 space-y-8 max-w-4xl mx-auto">
            {/* Report Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md">
                    STARDUX INTELLIGENCE REPORT
                  </span>
                  <span className="text-xs text-slate-400">
                    Gerado em {formatDate(activeReport.created_at)}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {activeReport.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Nicho: <strong>{activeReport.niche_name}</strong> • Período Observado: {activeReport.period_start} a {activeReport.period_end}
                </p>
              </div>

              {/* Agency Logo Brand mark */}
              <div className="text-right shrink-0">
                <span className="font-extrabold tracking-tight text-lg text-slate-900 dark:text-white">STARDUX</span>
                <p className="text-[10px] text-slate-400">Ad Intelligence & Strategy</p>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-emerald-600 dark:text-emerald-400">
                1. Sumário Executivo
              </h3>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                {activeReport.summary}
              </p>
            </div>

            {/* Scope & Sample Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                <span className="text-slate-400 text-[11px] block">Amostra Analisada</span>
                <strong className="text-xl font-bold text-slate-900 dark:text-white block mt-1">
                  {activeReport.ads_count} Anúncios
                </strong>
                <span className="text-[10px] text-slate-500">Com observações registradas</span>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs sm:col-span-2">
                <span className="text-slate-400 text-[11px] block">Concorrentes Acompanhados</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {activeReport.competitors_analyzed.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Identified Trends */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-emerald-600 dark:text-emerald-400">
                2. Tendências & Padrões Criativos Observados
              </h3>
              <div className="space-y-2.5">
                {activeReport.trends_identified.map((trend, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start justify-between gap-4 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{trend.title}</span>
                      </h4>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1 leading-relaxed">
                        {trend.description}
                      </p>
                    </div>
                    <span className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                      {trend.frequency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategic Recommendations */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-emerald-600 dark:text-emerald-400">
                3. Recomendações Estratégicas para Novas Campanhas
              </h3>
              <div className="space-y-2.5">
                {activeReport.strategic_recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 text-xs"
                  >
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 mt-0.5 ${
                        rec.priority === 'alta'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}
                    >
                      Prioridade {rec.priority}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{rec.action}</h4>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        {rec.rationale}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Source & Limitations Disclaimer */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Fontes dos Dados e Limitações Metodológicas</span>
              </div>
              <p>{activeReport.disclaimer}</p>
              <p className="text-[10px] text-slate-400 pt-2">
                Stardux Ad Intelligence • Documento gerado para uso analítico e planejamento de criativos.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            Nenhum relatório encontrado. Clique em "Novo Relatório" para gerar.
          </div>
        )}
      </div>

      {/* Modal Novo Relatório */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Gerar Novo Relatório Estratégico
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Título do Relatório *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Análise Competitiva Q4 — Imóveis Alto Padrão"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Projeto de Pesquisa Base
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Selecione um projeto...</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Sumário Executivo Preliminar
                </label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Principais achados sobre a concorrência observada..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold flex items-center gap-1.5"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Gerar Relatório'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
