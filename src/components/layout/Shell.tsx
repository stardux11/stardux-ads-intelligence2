'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Sparkles, Sun, Moon, Zap } from 'lucide-react';
import { Sidebar, AD_NAV_ITEMS } from './Sidebar';
import { ImportCsvModal } from '../ads/ImportCsvModal';
import { CreateAdModal } from '../ads/CreateAdModal';

interface ShellProps {
  children: React.ReactNode;
}

const STARDUX_OS_ORIGIN = 'https://starduxos.vercel.app';

export function Shell({ children }: ShellProps) {
  const pathname = usePathname();
  const [embedded, setEmbedded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
  const [isCreateAdOpen, setIsCreateAdOpen] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [niches] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const insideFrame = window.self !== window.top || params.get('embedded') === '1';
    setEmbedded(insideFrame);
    const queryTheme = params.get('theme');
    // Third-party iframe contexts may block storage (Safari and privacy settings).
    let savedTheme: string | null = null;
    try { savedTheme = window.localStorage.getItem('stardux-ads-theme'); } catch { /* Embedded mode works without storage */ }
    setIsDark(queryTheme === 'light' ? false : queryTheme === 'dark' ? true : savedTheme !== 'light');

    const onParentTheme = (event: MessageEvent) => {
      if (event.source !== window.parent || event.origin !== STARDUX_OS_ORIGIN) return;
      const data = event.data;
      if (data && data.type === 'stardux:theme' && (data.theme === 'dark' || data.theme === 'light')) {
        setIsDark(data.theme === 'dark');
      }
    };
    window.addEventListener('message', onParentTheme);
    return () => window.removeEventListener('message', onParentTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    if (!embedded) {
      try { window.localStorage.setItem('stardux-ads-theme', isDark ? 'dark' : 'light'); }
      catch { /* Theme stays active for this session */ }
    }
  }, [embedded, isDark]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    fetch('/api/projects')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProjects(data); })
      .catch(console.error);
  }, []);

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent('stardux-data-updated'));
  };

  return (
    <div className="ads-workspace flex min-h-screen w-full bg-[#f6f8fb] text-slate-900 antialiased dark:bg-[#0a0b0f] dark:text-slate-100"
      data-embedded={embedded ? 'true' : 'false'}>
      {!embedded && (
        <div className="sticky top-0 hidden h-screen shrink-0 lg:block">
          <Sidebar isDark={isDark} onToggleTheme={() => setIsDark(v => !v)} />
        </div>
      )}

      {!embedded && mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Fechar navegação" className="absolute inset-0 bg-[#080a10]/75 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)} />
          <div className="relative h-full w-64 max-w-[86vw] shadow-2xl">
            <Sidebar onClose={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)}
              isDark={isDark} onToggleTheme={() => setIsDark(v => !v)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {embedded ? (
          <header className="ads-embedded-header sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#101219]/95 sm:px-6"
            data-testid="ads-embedded-header">
            <div className="flex items-center justify-between gap-3 pb-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-[#7C3AED] to-[#04C4D9] text-[#0a0b0f]">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold tracking-tight">Ads Intelligence</p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">Pesquisa e inteligência criativa</p>
                </div>
              </div>
              <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 sm:inline-flex">
                Módulo Stardux OS
              </span>
            </div>
            <nav aria-label="Navegação do Ads Intelligence" className="-mx-1 flex items-center gap-1 overflow-x-auto pb-0.5"
              data-testid="ads-module-tabs">
              {AD_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
                return (
                  <Link href={href} key={href} aria-current={active ? 'page' : undefined}
                    className={`inline-flex min-h-9 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${active
                      ? 'bg-cyan-500/10 text-cyan-800 ring-1 ring-cyan-500/20 dark:text-cyan-300'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white'}`}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}
                  </Link>
                );
              })}
            </nav>
          </header>
        ) : (
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl dark:border-white/[0.07] dark:bg-[#101219]/90 sm:px-6 lg:hidden">
            <button type="button" aria-label="Abrir navegação" onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-200 p-2 text-slate-700 dark:border-white/10 dark:text-slate-200">
              <Menu className="h-5 w-5" />
            </button>
            <span className="flex min-w-0 items-center gap-2 text-sm font-bold">
              <Zap className="h-4 w-4 text-[#04C4D9]" /> Ads Intelligence
            </span>
            <button type="button" aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
              onClick={() => setIsDark(v => !v)} className="rounded-xl border border-slate-200 p-2 dark:border-white/10">
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </header>
        )}

        <main id="ads-main-content"
          className={`ads-content mx-auto min-h-[75vh] w-full min-w-0 flex-1 ${embedded
            ? 'max-w-[1580px] px-4 py-5 sm:px-6 lg:py-7'
            : 'max-w-[1580px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8'}`}>
          {children}
        </main>
      </div>

      {/* Existing workflow dialogs and their callbacks remain unchanged. */}
      <ImportCsvModal isOpen={isImportCsvOpen} onClose={() => setIsImportCsvOpen(false)}
        onSuccess={handleRefresh} projects={projects} />
      <CreateAdModal isOpen={isCreateAdOpen} onClose={() => setIsCreateAdOpen(false)}
        onSuccess={handleRefresh} niches={niches} />
    </div>
  );
}
