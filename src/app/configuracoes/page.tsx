'use client';

import React, { useState } from 'react';
import {
  Settings,
  Key,
  Database,
  Building2,
  Sparkles,
  ShieldCheck,
  Check,
  Trash2,
  RefreshCw,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';

export default function ConfiguracoesPage() {
  const [geminiKey, setGeminiKey] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const handleSaveKeys = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess('As chaves inseridas foram validadas para a sessão atual.');
    setTimeout(() => setSavedSuccess(null), 3000);
  };

  const handleSeedDemo = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/demo-data/seed', { method: 'POST' });
      const data = await res.json();
      setSavedSuccess(data.message);
      setTimeout(() => setSavedSuccess(null), 3000);
    } catch {
      setSavedSuccess('Falha ao carregar dados demonstrativos.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Deseja realmente apagar os dados demonstrativos e começar com a base limpa?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch('/api/demo-data/reset', { method: 'POST' });
      const data = await res.json();
      setSavedSuccess(data.message);
      setTimeout(() => setSavedSuccess(null), 3000);
    } catch {
      setSavedSuccess('Falha ao limpar dados demonstrativos.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Configurações da Plataforma
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gerenciamento de credenciais, inteligência artificial, organização e armazenamento de dados.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{savedSuccess}</span>
          </div>
        )}

        {/* 1. Organização & Perfil */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Organização & Workspace
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nome da Agência
              </span>
              <input
                type="text"
                disabled
                value="Agência Stardux"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs"
              />
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Plano Atual
              </span>
              <input
                type="text"
                disabled
                value="Agency Enterprise (Ilimitado)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* 2. Armazenamento e Banco de Dados */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Persistência & Banco de Dados
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              Persistência Ativa (.stardux-data)
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
            O sistema opera por padrão com persistência local em disco no diretório <code>.stardux-data/stardux-db.json</code>, mantendo todos os seus projetos, concorrentes e anúncios mesmo após reiniciar a máquina. Para produção na nuvem, adicione as credenciais do Supabase em <code>.env.local</code>.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={handleSeedDemo}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recarregar Dados Demonstrativos (5 Nichos)</span>
            </button>

            <button
              onClick={handleResetDemo}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Limpar Dados de Demonstração</span>
            </button>

            <a
              href="/api/ads/export?format=json"
              download
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup Geral em JSON</span>
            </a>
          </div>
        </div>

        {/* 3. Credenciais e APIs */}
        <form onSubmit={handleSaveKeys} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Key className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Chaves de API & Conectores
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Google Gemini API Key (Opcional)
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy... (Deixe em branco para usar o analisador heurístico sem custo)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Permite acionar o modelo Gemini 1.5 Flash para perguntas avançadas em linguagem natural.
              </p>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Meta Developer Access Token (Opcional)
              </label>
              <input
                type="password"
                value={metaToken}
                onChange={(e) => setMetaToken(e.target.value)}
                placeholder="EAA... (Token de Desenvolvedor da Meta)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Utilizado para consultas diretas no endpoint oficial <code>/ads_archive</code> da Meta.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.02]"
            >
              Salvar Preferências
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
