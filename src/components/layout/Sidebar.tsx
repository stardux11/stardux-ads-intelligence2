'use client';

import React, { useState } from 'react';
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
  Settings,
  Zap,
  Moon,
  Sun,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/explorar', label: 'Explorar Anúncios', icon: Search },
  { href: '/concorrentes', label: 'Concorrentes', icon: Users2 },
  { href: '/projetos', label: 'Projetos de Pesquisa', icon: FolderKanban },
  { href: '/ia-analista', label: 'Analista Criativo IA', icon: Sparkles },
  { href: '/biblioteca', label: 'Biblioteca & Favoritos', icon: BookmarkCheck },
  { href: '/relatorios', label: 'Relatórios', icon: FileSpreadsheet },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <aside className="w-60 bg-[#0f1117] flex flex-col h-screen sticky top-0 z-30 select-none shrink-0">
      {/* Brand Header */}
      <div className="px-5 py-5 flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
          style={{ background: 'linear-gradient(135deg, #04C4D9 0%, #7C3AED 100%)' }}
        >
          <Zap className="w-4 h-4 fill-white" />
        </div>
        <div>
          <p className="font-bold text-sm text-white leading-tight tracking-tight">Stardux ADS</p>
          <p className="text-[11px] text-slate-500 leading-tight">Ad Intelligence</p>
        </div>
      </div>

      {/* Section Label */}
      <div className="px-5 pb-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Menu Principal
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
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
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150 group',
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              )}
            >
              <Icon
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  isActive ? 'text-[#04C4D9]' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-1 border-t border-white/[0.06] pt-3">
        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-slate-500" />
          ) : (
            <Moon className="w-4 h-4 text-slate-500" />
          )}
          <span>{isDark ? 'Modo claro' : 'Modo escuro'}</span>
        </button>

        {/* User info */}
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #04C4D9, #7C3AED)' }}
          >
            SX
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate leading-tight">Agência Stardux</p>
            <p className="text-[10px] text-slate-600 truncate leading-tight">Workspace Interno</p>
          </div>
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0 ml-auto"
            style={{ background: '#04C4D9' }}
          />
        </div>
      </div>
    </aside>
  );
}
