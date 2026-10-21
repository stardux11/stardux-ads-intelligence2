'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Users2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Search,
  PieChart as PieIcon,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Shell } from '@/components/layout/Shell';
import { formatDaysActive, formatDate, getISCTierInfo } from '@/lib/utils';
import { Ad } from '@/lib/types';
import { AdDetailModal } from '@/components/ads/AdDetailModal';
import { ISCBreakdownModal } from '@/components/ads/ISCBreadownModal';
import { SaveToCollectionModal } from '@/components/collections/SaveToCollectionModal';

const COLORS = ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#ec4899'];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [adForISC, setAdForISC] = useState<Ad | null>(null);
  const [adForCollection, setAdForCollection] = useState<Ad | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const handleUpdate = () => fetchStats();
    window.addEventListener('stardux-data-updated', handleUpdate);
    return () => window.removeEventListener('stardux-data-updated', handleUpdate);
  }, []);

  // Dados para gráficos do Recharts
  const formatChartData = stats?.formatCounts
    ? Object.entries(stats.formatCounts).map(([key, value]) => ({
        name: key === 'video' ? 'Vídeo' : key === 'carousel' ? 'Carrossel' : key === 'image' ? 'Imagem' : key,
        value: Number(value),
      }))
    : [];

  const nicheChartData = stats?.nicheDistribution
    ? Object.entries(stats.nicheDistribution).map(([key, value]) => ({
        name: key,
        anuncios: Number(value),
      }))
    : [];

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Dashboard Geral de Inteligência
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Stardux Ads
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Visão consolidada de sinais criativos observáveis, concorrência e longevidade na Meta.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/explorar"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.02]"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Explorar Anúncios</span>
            </Link>
            <Link
              href="/ia-analista"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Analista IA</span>
            </Link>
          </div>
        </div>

        {/* Data Limitations Disclaimer Alert */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200/60 dark:border-emerald-800/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-slate-900 dark:text-white">
              Diretriz de Transparência Stardux
            </p>
            <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed text-[11px]">
              Os indicadores refletem <strong>dados observados</strong> na Biblioteca de Anúncios da Meta e importações auditadas. A Meta não divulga dados de faturamento, CPA ou ROAS para anúncios comerciais comuns no Brasil. Classificamos anúncios com base em longevidade, recorrência e estabilidade criativa (ISC).
            </p>
          </div>
        </div>

        {/* Top 4 KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Anúncios */}
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Anúncios Monitorados</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? '...' : stats?.totalAds || 0}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{stats?.activeAds || 0} classificados como ativos</span>
            </div>
          </div>

          {/* Total de Concorrentes */}
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Concorrentes Cadastrados</span>
              <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <Users2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? '...' : stats?.totalAdvertisers || 0}
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Em {stats?.totalProjects || 2} projetos de pesquisa ativos
            </div>
          </div>

          {/* Longevidade Média */}
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Longevidade Média Observada</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? '...' : `${stats?.avgLongevity || 0}d`}
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Tempo contínuo de veiculação na Meta
            </div>
          </div>

          {/* ISC Médio */}
          <div className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Média ISC do Workspace</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {loading ? '...' : `${stats?.avgISC || 0}/100`}
            </div>
            <div className="mt-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Índice de Sinais Criativos
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Formatos de Criativos (Donut Chart) */}
          <div className="lg:col-span-5 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-500" />
                  <span>Formatos Mais Frequentes</span>
                </h3>
                <span className="text-[11px] text-slate-400">Sinais observados</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                Distribuição percentual entre vídeo, imagem estática e carrossel.
              </p>
            </div>

            <div className="h-56 w-full flex items-center justify-center">
              {formatChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {formatChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        backgroundColor: '#0f172a',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-400">Sem dados suficientes</p>
              )}
            </div>

            <div className="flex justify-center gap-4 text-xs pt-2">
              {formatChartData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {item.name}: <strong>{item.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Distribuição por Nicho (Bar Chart) */}
          <div className="lg:col-span-7 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" />
                  <span>Anúncios por Nicho Monitorado</span>
                </h3>
                <span className="text-[11px] text-slate-400">Concentração</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                Volume de anúncios identificados por setor de mercado no Brasil.
              </p>
            </div>

            <div className="h-56 w-full">
              {nicheChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={nicheChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        backgroundColor: '#0f172a',
                        color: '#fff',
                        fontSize: '12px',
                        border: 'none',
                      }}
                    />
                    <Bar dataKey="anuncios" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Sem dados para exibição
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Top Longevity Ads Section */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Anúncios com Maior Tempo de Veiculação Observada</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Campanhas ativas por mais tempo revelam sinais de continuidade de investimento pelo concorrente.
              </p>
            </div>
            <Link
              href="/explorar?sortBy=longevity"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {stats?.topLongevityAds?.map((ad: Ad) => {
              const tier = getISCTierInfo(ad.isc_score);
              return (
                <div
                  key={ad.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors cursor-pointer"
                  onClick={() => setSelectedAd(ad)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                      {ad.media_url ? (
                        <img
                          src={ad.media_url}
                          alt={ad.headline}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Layers className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ad.advertiser_name}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {ad.format}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">
                        {ad.headline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                        {formatDaysActive(ad.days_active_observed)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Início: {formatDate(ad.started_at)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAdForISC(ad);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${tier.badgeBg} border ${tier.badgeBorder}`}
                      title="Ver composição do ISC"
                    >
                      ISC {ad.isc_score}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AdDetailModal
        ad={selectedAd}
        isOpen={Boolean(selectedAd)}
        onClose={() => setSelectedAd(null)}
        onSaveToCollection={(ad) => setAdForCollection(ad)}
        onOpenISC={(ad) => setAdForISC(ad)}
      />

      <ISCBreakdownModal
        ad={adForISC}
        isOpen={Boolean(adForISC)}
        onClose={() => setAdForISC(null)}
      />

      <SaveToCollectionModal
        ad={adForCollection}
        isOpen={Boolean(adForCollection)}
        onClose={() => setAdForCollection(null)}
      />
    </Shell>
  );
}
