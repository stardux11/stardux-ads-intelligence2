import Papa from 'papaparse';
import { Ad, AdFormat, Platform, AdSource, AdStatus } from './types';
import { calculateISC } from './isc';

export interface CSVRowInput {
  external_id?: string;
  advertiser_name?: string;
  page_id?: string;
  original_url?: string;
  country?: string;
  platforms?: string;
  status_observed?: string;
  started_at?: string;
  ended_at?: string;
  last_verified_at?: string;
  headline?: string;
  body_text?: string;
  description?: string;
  cta_text?: string;
  format?: string;
  media_url?: string;
  destination_url?: string;
  source?: string;
}

export interface CSVParseResult {
  validAds: Partial<Ad>[];
  errors: Array<{ row: number; error: string; rawData: any }>;
  totalRows: number;
}

export function parseAndValidateCSV(csvString: string, organizationId: string = 'org-default'): CSVParseResult {
  const parsed = Papa.parse<CSVRowInput>(csvString.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  const validAds: Partial<Ad>[] = [];
  const errors: Array<{ row: number; error: string; rawData: any }> = [];
  const seenIds = new Set<string>();

  parsed.data.forEach((row, index) => {
    const rowNum = index + 2; // +1 for 0-index, +1 for header line

    // Validações obrigatórias
    const advertiserName = (row.advertiser_name || '').trim();
    if (!advertiserName) {
      errors.push({ row: rowNum, error: 'Campo "advertiser_name" é obrigatório.', rawData: row });
      return;
    }

    const headline = (row.headline || '').trim();
    const bodyText = (row.body_text || '').trim();
    if (!headline && !bodyText) {
      errors.push({ row: rowNum, error: 'O anúncio deve possuir ao menos "headline" ou "body_text".', rawData: row });
      return;
    }

    // Validação de Data de Início
    const startedRaw = (row.started_at || '').trim();
    let startedDate: Date;
    if (startedRaw) {
      startedDate = new Date(startedRaw);
      if (isNaN(startedDate.getTime())) {
        errors.push({ row: rowNum, error: `Data de início inválida: "${startedRaw}". Use AAAA-MM-DD.`, rawData: row });
        return;
      }
    } else {
      startedDate = new Date();
    }

    // Data de término opcional
    let endedDate: Date | undefined;
    if (row.ended_at && row.ended_at.trim()) {
      endedDate = new Date(row.ended_at.trim());
      if (isNaN(endedDate.getTime())) {
        errors.push({ row: rowNum, error: `Data de término inválida: "${row.ended_at}".`, rawData: row });
        return;
      }
    }

    // Data da última verificação
    let lastVerifiedDate: Date;
    if (row.last_verified_at && row.last_verified_at.trim()) {
      lastVerifiedDate = new Date(row.last_verified_at.trim());
      if (isNaN(lastVerifiedDate.getTime())) {
        lastVerifiedDate = new Date();
      }
    } else {
      lastVerifiedDate = new Date();
    }

    // Cálculo de dias ativos observados
    const referenceEnd = endedDate || lastVerifiedDate || new Date();
    const diffTime = Math.max(0, referenceEnd.getTime() - startedDate.getTime());
    const daysActive = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

    // Formato
    let format: AdFormat = 'image';
    const rawFormat = (row.format || '').toLowerCase();
    if (rawFormat.includes('video') || rawFormat.includes('vídeo')) format = 'video';
    else if (rawFormat.includes('carousel') || rawFormat.includes('carrossel')) format = 'carousel';
    else if (rawFormat.includes('story') || rawFormat.includes('reels')) format = 'story_reels';
    else if (rawFormat.includes('image') || rawFormat.includes('imagem')) format = 'image';

    // Plataformas
    const platforms: Platform[] = [];
    const rawPlatforms = (row.platforms || 'facebook,instagram').toLowerCase();
    if (rawPlatforms.includes('facebook')) platforms.push('facebook');
    if (rawPlatforms.includes('instagram')) platforms.push('instagram');
    if (rawPlatforms.includes('audience')) platforms.push('audience_network');
    if (rawPlatforms.includes('messenger')) platforms.push('messenger');
    if (platforms.length === 0) platforms.push('facebook', 'instagram');

    // Status
    let statusObserved: AdStatus = 'active';
    const rawStatus = (row.status_observed || 'active').toLowerCase();
    if (rawStatus.includes('inact') || rawStatus.includes('paus') || rawStatus.includes('desat')) {
      statusObserved = 'inactive';
    }

    // Deduplicação
    const externalId = (row.external_id || '').trim();
    const originalUrl = (row.original_url || '').trim();
    const dedupKey = externalId || originalUrl || `${advertiserName}-${headline}-${startedDate.toISOString().slice(0, 10)}`;
    
    if (seenIds.has(dedupKey)) {
      errors.push({ row: rowNum, error: `Anúncio duplicado ignorado (chave: ${dedupKey}).`, rawData: row });
      return;
    }
    seenIds.add(dedupKey);

    const source: AdSource = (row.source as AdSource) || 'csv_import';

    // Calcula ISC
    const iscBreakdown = calculateISC({
      daysActive,
      variationCount: 1,
      advertiserActiveAdsCount: 1,
      format,
      platforms,
      source,
      originalUrl,
    });

    const adItem: Partial<Ad> = {
      organization_id: organizationId,
      advertiser_name: advertiserName,
      external_id: externalId || `CSV-${Date.now()}-${index}`,
      original_url: originalUrl || `https://www.facebook.com/ads/library/?q=${encodeURIComponent(advertiserName)}`,
      source,
      country: (row.country || 'BR').toUpperCase().slice(0, 2),
      platforms,
      format,
      status_observed: statusObserved,
      started_at: startedDate.toISOString(),
      ended_at: endedDate ? endedDate.toISOString() : undefined,
      last_verified_at: lastVerifiedDate.toISOString(),
      days_active_observed: daysActive,
      headline: headline || 'Sem título informado',
      body_text: bodyText || '',
      description: row.description || '',
      cta_text: row.cta_text || 'Saiba mais',
      media_url: row.media_url || '',
      destination_url: row.destination_url || '',
      isc_score: iscBreakdown.totalScore,
      isc_breakdown: iscBreakdown,
      is_demo: false,
      data_confidence: originalUrl.includes('facebook.com') ? 'verified_source' : 'user_reported',
    };

    validAds.push(adItem);
  });

  return {
    validAds,
    errors,
    totalRows: parsed.data.length,
  };
}

export function exportAdsToCSV(ads: Ad[]): string {
  const rows = ads.map((ad) => ({
    external_id: ad.external_id || '',
    advertiser_name: ad.advertiser_name,
    page_id: '',
    original_url: ad.original_url,
    country: ad.country,
    platforms: ad.platforms.join(';'),
    status_observed: ad.status_observed,
    started_at: ad.started_at ? ad.started_at.slice(0, 10) : '',
    ended_at: ad.ended_at ? ad.ended_at.slice(0, 10) : '',
    last_verified_at: ad.last_verified_at ? ad.last_verified_at.slice(0, 10) : '',
    headline: ad.headline,
    body_text: ad.body_text,
    description: ad.description || '',
    cta_text: ad.cta_text || '',
    format: ad.format,
    media_url: ad.media_url || '',
    destination_url: ad.destination_url || '',
    source: ad.source,
    isc_score: ad.isc_score,
    days_active: ad.days_active_observed,
  }));

  return Papa.unparse(rows);
}
