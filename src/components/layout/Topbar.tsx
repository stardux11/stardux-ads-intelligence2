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
  Bell,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

interface TopbarProps {
  onOpenImportCsv?: () => void;
  onOpenCreateAd?: () => void;
  onDemoDataAction?: () => void;
}

export function Topbar({ onOpenImportCsv, onOpenCreateAd, onDemoDataAction }: TopbarProps) {
  const [isDark, setIsDark] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  React.useEffect(() => {
    fetch('/api/notifications')
      .then((r) => r.json())
      .then((d) => {
        if (d && Array.isArray(d.notifications)) {
          setNotifications(d.notifications);
          setUnreadCount(d.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, []);

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
    <header className="h-16 border-b border-slate-200 dark:border-white/[0.05] bg-white/90 dark:bg-[#0d0e14]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Status Notice or System Tag */}
      <div className="flex items-center gap-3">
        {statusMessage ? (
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border animate-in fade-in" style={{color: '#04C4D9', background: 'rgba(4,196,217,0.08)', borderColor: 'rgba(4,196,217,0.2)'}}>
            <CheckCircle2 className="w-4 h-4" style={{color: '#04C4D9'}} />
            <span>{statusMessage}</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{background: '#04C4D9'}} />
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #04C4D9, #7C3AED)' }}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Novo Anúncio</span>
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700/80 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative"
            title="Notificações & Alertas do Sistema"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-white dark:border-slate-900 animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-50 text-xs animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-emerald-500" />
                  Notificações & Alertas
                </span>
                <span className="text-[10px] text-slate-400">
                  {notifications.length} registros
                </span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-slate-400 text-center py-4">Nenhuma notificação no momento.</p>
                ) : (
                  notifications.map((n) => (
                    <a
                      key={n.id}
                      href={n.link || '#'}
                      onClick={() => setShowNotifMenu(false)}
                      className="block p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        {n.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                        {n.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                        {n.status === 'info' && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white text-xs">{n.title}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-snug">{n.description}</p>
                        </div>
                      </div>
                    </a>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
