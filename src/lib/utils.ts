import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/D';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return 'N/D';
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return 'N/D';
  }
}

export function formatDaysActive(days: number): string {
  if (days <= 0) return '1 dia';
  if (days === 1) return '1 dia';
  if (days < 30) return `${days} dias`;
  const months = Math.floor(days / 30);
  const remDays = days % 30;
  if (remDays === 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`;
  return `${months} ${months === 1 ? 'mês' : 'meses'} e ${remDays}d`;
}

export function getISCTierInfo(score: number): {
  color: string;
  badgeBg: string;
  badgeBorder: string;
  label: string;
} {
  if (score >= 80) {
    return {
      color: 'text-emerald-500 dark:text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      badgeBorder: 'border-emerald-500/30',
      label: 'Excelente Sinal',
    };
  }
  if (score >= 60) {
    return {
      color: 'text-cyan-500 dark:text-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
      badgeBorder: 'border-cyan-500/30',
      label: 'Bom Sinal',
    };
  }
  if (score >= 40) {
    return {
      color: 'text-amber-500 dark:text-amber-400',
      badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      badgeBorder: 'border-amber-500/30',
      label: 'Sinal Moderado',
    };
  }
  return {
    color: 'text-slate-400 dark:text-slate-500',
    badgeBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    badgeBorder: 'border-slate-500/20',
    label: 'Sinal Inicial',
  };
}
