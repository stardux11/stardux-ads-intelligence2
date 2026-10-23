import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';

export interface SystemNotification {
  id: string;
  title: string;
  description: string;
  type: 'meta_api' | 'competitor' | 'system' | 'creative';
  status: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
  link?: string;
}

export async function GET() {
  try {
    const db = StarduxDatabase.get();
    const token = process.env.META_ACCESS_TOKEN?.trim();
    const hasMetaToken = Boolean(token && token.length > 20);

    const stats = db.getDashboardStats();
    const notifications: SystemNotification[] = [];

    // Notificação 1: Status da Meta API
    if (hasMetaToken) {
      notifications.push({
        id: 'notif-meta-online',
        title: 'Meta Ad Library API Conectada',
        description: 'Sua chave de acesso ao App Stardux ADS Intelligence está validada e pronta para consultas ao vivo.',
        type: 'meta_api',
        status: 'success',
        timestamp: new Date().toISOString(),
        read: false,
        link: '/explorar',
      });
    } else {
      notifications.push({
        id: 'notif-meta-missing',
        title: 'Meta API Requer Token',
        description: 'Configure seu Access Token permanente nas Configurações para realizar buscas ao vivo na Ad Library.',
        type: 'meta_api',
        status: 'warning',
        timestamp: new Date().toISOString(),
        read: false,
        link: '/configuracoes',
      });
    }

    // Notificação 2: Anúncios campeões de longevidade / ISC
    if (stats.topLongevityAds && stats.topLongevityAds.length > 0) {
      const topAd = stats.topLongevityAds[0];
      notifications.push({
        id: `notif-top-ad-${topAd.id}`,
        title: `Criativo Campeão Identificado: ${topAd.advertiser_name}`,
        description: `O anúncio "${topAd.headline}" atingiu ${topAd.days_active_observed} dias contínuos em veiculação com ISC ${topAd.isc_score}.`,
        type: 'creative',
        status: 'info',
        timestamp: topAd.last_verified_at || new Date().toISOString(),
        read: false,
        link: `/anuncio/${topAd.id}`,
      });
    }

    // Notificação 3: Concorrentes cadastrados
    if (stats.totalAdvertisers > 0) {
      notifications.push({
        id: 'notif-competitors',
        title: `${stats.totalAdvertisers} Anunciantes / Concorrentes Monitorados`,
        description: `A base possui ${stats.totalAds} anúncios indexados e prontos para benchmark comparativo.`,
        type: 'competitor',
        status: 'info',
        timestamp: new Date().toISOString(),
        read: false,
        link: '/concorrentes',
      });
    }

    return NextResponse.json({ notifications, unreadCount: notifications.filter(n => !n.read).length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
