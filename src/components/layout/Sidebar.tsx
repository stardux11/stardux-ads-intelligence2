'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Search, Users2, FolderKanban, Sparkles,
  BookmarkCheck, FileSpreadsheet, Settings, Zap, Moon, Sun,
  ArrowUpRight, ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const AD_NAV_ITEMS = [
  { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/explorar', label: 'Explorar anúncios', icon: Search },
  { href: '/concorrentes', label: 'Concorrentes', icon: Users2 },
  { href: '/projetos', label: 'Projetos de pesquisa', icon: FolderKanban },
  { href: '/ia-analista', label: 'Analista criativo', icon: Sparkles },
  { href: '/biblioteca', label: 'Biblioteca e favoritos', icon: BookmarkCheck },
  { href: '/relatorios', label: 'Relatórios', icon: FileSpreadsheet },
  { href: '/configuracoes', label: 'Configurações', icon: Settings },
] as const;

interface SidebarProps {
  onNavigate?: () => void;
  onClose?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export function Sidebar({ onNavigate, onClose, isDark = true, onToggleTheme }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full min-h-0 w-64 shrink-0 flex-col border-r border-white/[0.07] bg-[#0b0d13] text-slate-100" aria-label="Navegação do Ads Intelligence">
      <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] via-[#04C4D9] to-[#D91A83] text-[#0A0B0F] shadow-lg shadow-cyan-500/10">
          <Zap className="h-[19px] w-[19px]" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold leading-tight tracking-tight">STARDUX</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Ads Intelligence</p>
        </div>
        {onClose && (
          <button type="button" aria-label="Fechar menu" onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white lg:hidden">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Inteligência de anúncios
        </p>
        <nav aria-label="Seções do Ads Intelligence" className="space-y-1">
          {AD_NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/'));
            return (
              <Link key={href} href={href} onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
                  active
                    ? 'bg-cyan-400/10 font-semibold text-white ring-1 ring-cyan-400/15'
                    : 'text-slate-400 hover:bg-white/[0.065] hover:text-white'
                )}>
                <Icon className={cn('h-[17px] w-[17px] shrink-0', active ? 'text-[#04C4D9]' : 'text-slate-500 group-hover:text-slate-200')} aria-hidden="true" />
                <span>{label}</span>
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#04C4D9]" aria-hidden="true" />}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-2 border-t border-white/[0.07] px-3 py-4">
        <a href="https://starduxos.vercel.app/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.065] hover:text-white">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          Abrir Stardux OS
        </a>
        {onToggleTheme && (
          <button type="button" onClick={onToggleTheme}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-slate-400 transition-colors hover:bg-white/[0.065] hover:text-white"
            aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}>
            {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
            {isDark ? 'Tema claro' : 'Tema escuro'}
          </button>
        )}
        <div className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.035] px-3 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#04C4D9] to-[#7C3AED] text-[11px] font-black text-[#0A0B0F]">SX</div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-slate-100">Agência Stardux</p>
            <p className="truncate text-[11px] text-slate-500">Inteligência comercial</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
