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
    <aside className="w-64 border-r border-slate-200 dark:border-white/[0.06] bg-white dark:bg-[#0d0e14] flex flex-col h-screen sticky top-0 z-30 transition-all select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #04C4D9 0%, #7C3AED 100%)' }}
          >
            <Zap className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[15px] tracking-tight text-slate-900 dark:text-white">STARDUX</span>
              <span
                className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(4,196,217,0.12)', color: '#04C4D9' }}
              >
                ADS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-none mt-0.5">
              Ad Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
          Inteligência & Pesquisa
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative overflow-hidden',
                isActive
                  ? 'font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-white/[0.04]'
              )}
              style={
                isActive
                  ? {
                      background:
                        'linear-gradient(135deg, rgba(4,196,217,0.14) 0%, rgba(124,58,237,0.08) 100%)',
                      borderLeft: '2.5px solid #04C4D9',
                    }
                  : {}
              }
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'w-4 h-4 transition-colors shrink-0',
                    isActive
                      ? 'text-[#04C4D9]'
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                  )}
                />
                <span className={isActive ? 'text-slate-900 dark:text-white' : ''}>
                  {item.label}
                </span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold bg-slate-100 dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md">
                  {item.badge}
                </span>
              )}
              {item.highlight && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: 'rgba(124,58,237,0.12)', color: '#7C3AED' }}
                >
                  IA
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User / Workspace Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow"
            style={{ background: 'linear-gradient(135deg, #04C4D9, #7C3AED)' }}
          >
            SX
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-800 dark:text-slate-200 leading-tight">
              Agência Stardux
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">Workspace Interno</p>
          </div>
        </div>
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: '#04C4D9', boxShadow: '0 0 6px rgba(4,196,217,0.6)' }}
          title="Sistema Operacional"
        />
      </div>
    </aside>
  );
}
