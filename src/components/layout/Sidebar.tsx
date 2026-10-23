'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Users2,
  FolderKanban,
  Sparkles,
  BookmarkCheck,
  FileSpreadsheet,
  Cable,
  Settings,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/explorar', label: 'Explorar Anúncios', icon: Search, badge: 'Principal' },
  { href: '/concorrentes', label: 'Concorrentes', icon: Users2 },
  { href: '/projetos', label: 'Projetos de Pesquisa', icon: FolderKanban },
  { href: '/ia-analista', label: 'Analista Criativo IA', icon: Sparkles, highlight: true },
  { href: '/biblioteca', label: 'Biblioteca & Favoritos', icon: BookmarkCheck },
  { href: '/relatorios', label: 'Relatórios Estratégicos', icon: FileSpreadsheet },
  { href: '/integracoes', label: 'Conectores & Fontes', icon: Cable },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex flex-col h-screen sticky top-0 z-30 transition-all select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">STARDUX</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">ADS</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5">Ad Intelligence</p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
          Inteligência & Pesquisa
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/50'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors',
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                  )}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                  {item.badge}
                </span>
              )}
              {item.highlight && (
                <span className="text-[10px] font-medium bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 animate-pulse">
                  IA
                </span>
              )}
            </Link>
          );
        })}
      </nav>



      {/* User / Workspace Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-200">
            SX
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">Agência Stardux</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Workspace Interno</p>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-500" title="Sistema Operacional" />
      </div>
    </aside>
  );
}
