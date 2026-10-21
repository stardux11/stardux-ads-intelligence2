'use client';

import React, { useState } from 'react';
import {
  Upload,
  PlusCircle,
  Database,
  Moon,
  Sun,
  RefreshCw,
  Trash2,
  CheckCircle2,
} from 'lucide-react';

interface TopbarProps {
  onOpenImportCsv?: () => void;
  onOpenCreateAd?: () => void;
  onDemoDataAction?: () => void;
}

export function Topbar({ onOpenImportCsv, onOpenCreateAd, onDemoDataAction }: TopbarProps) {
  const [isDark, setIsDark] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSeedDemo = async () => {
    setIsLoading(true);
    setShowDemoMenu(false);
    try {
      const res = await fetch('/api/demo-data/seed', { method: 'POST' });
      const data = await res.json();
      setStatusMessage(data.message || 'Dados de demonstração carregados!');
      setTimeout(() => setStatusMessage(null), 4000);
      if (onDemoDataAction) onDemoDataAction();
    } catch {
      setStatusMessage('Falha ao carregar dados.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setIsLoading(true);
    setShowDemoMenu(false);
    try {
      const res = await fetch('/api/demo-data/reset', { method: 'POST' });
      const data = await res.json();
      setStatusMessage(data.message || 'Dados de demonstração removidos.');
      setTimeout(() => setStatusMessage(null), 4000);
      if (onDemoDataAction) onDemoDataAction();
    } catch {
      setStatusMessage('Falha ao limpar dados.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Status Notice or System Tag */}
      <div className="flex items-center gap-3">
        {statusMessage ? (
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-200/60 dark:border-emerald-800/60 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Região: <strong className="text-slate-700 dark:text-slate-300">Brasil (Meta Ads)</strong></span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>Longevidade & Sinais Observáveis</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Demo Data Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDemoMenu(!showDemoMenu)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
            title="Gerenciar Dados de Demonstração"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Demonstração</span>
          </button>

          {showDemoMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
              <button
                onClick={handleSeedDemo}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                <span>Carregar Dados Demo (5 Nichos)</span>
              </button>
              <button
                onClick={handleResetDemo}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span>Limpar Dados de Demonstração</span>
              </button>
            </div>
          )}
        </div>

        {/* Import CSV */}
        {onOpenImportCsv && (
          <button
            onClick={onOpenImportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">Importar</span> CSV
          </button>
        )}

        {/* Create Ad */}
        {onOpenCreateAd && (
          <button
            onClick={onOpenCreateAd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-all hover:scale-[1.02]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Novo Anúncio</span>
          </button>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Alternar Tema Claro / Escuro"
          aria-label="Alternar tema"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
}
