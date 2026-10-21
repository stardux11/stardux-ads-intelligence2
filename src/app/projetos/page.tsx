'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  PlusCircle,
  Users2,
  Layers,
  ArrowRight,
  X,
  Loader2,
  Calendar,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';
import { ResearchProject, Niche } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function ProjetosPage() {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Novo Projeto
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedNicheId, setSelectedNicheId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (Array.isArray(data)) setProjects(data);

      const statsRes = await fetch('/api/stats');
      const statsData = await statsRes.json();
      if (statsData?.nicheDistribution) {
        const list: Niche[] = Object.keys(statsData.nicheDistribution).map((name) => ({
          id: name.toLowerCase().replace(/\s+/g, '-'),
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          is_global: true,
          created_at: new Date().toISOString(),
        }));
        setNiches(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    const handleUpdate = () => fetchProjects();
    window.addEventListener('stardux-data-updated', handleUpdate);
    return () => window.removeEventListener('stardux-data-updated', handleUpdate);
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    setIsSaving(true);
    const nicheObj = niches.find((n) => n.id === selectedNicheId);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDescription.trim(),
          niche_id: selectedNicheId || undefined,
          niche_name: nicheObj?.name || 'Geral',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        setProjectName('');
        setProjectDescription('');
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Projetos de Pesquisa & Monitoramento
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Organize anúncios e concorrentes por pastas de projetos estratégicos de clientes.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Novo Projeto</span>
          </button>
        </div>

        {/* Project Cards Grid */}
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Carregando projetos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                      {proj.niche_name || 'Geral'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Atualizado em {formatDate(proj.updated_at)}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2 leading-tight">
                    {proj.name}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 mb-4">
                    {proj.description || 'Sem descrição informada.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                      <Users2 className="w-3.5 h-3.5 text-slate-400" />
                      {proj.competitors_count || 0} concorrentes
                    </span>
                  </div>

                  <Link
                    href={`/explorar?project_id=${proj.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <span>Ver Anúncios</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Novo Projeto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-5 animate-in zoom-in-95 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Criar Novo Projeto de Pesquisa
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nome do Projeto *
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ex: Pesquisa Imobiliárias — Jardins"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nicho de Mercado
                </label>
                <select
                  value={selectedNicheId}
                  onChange={(e) => setSelectedNicheId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Selecione um nicho...</option>
                  {niches.map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Descrição e Objetivos
                </label>
                <textarea
                  rows={3}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Objetivos do monitoramento, escopo e marcas acompanhadas..."
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
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Criar Projeto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Shell>
  );
}
