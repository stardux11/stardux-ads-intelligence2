import { IDataProvider, ProviderStatus } from './types';
import { Ad, AdSearchFilters } from '../types';
import { calculateISC } from '../isc';
import { getMetaAccessToken } from '../meta-config';

export class MetaAdLibraryProvider implements IDataProvider {
  id = 'meta_ad_library';
  name = 'Meta Ad Library API (Oficial)';

  async getStatus(): Promise<ProviderStatus> {
    const token = getMetaAccessToken();
    const isConfigured = Boolean(token && token.length > 10);

    return {
      id: this.id,
      name: this.name,
      type: 'meta_api',
      isConfigured,
      status: isConfigured ? 'operational' : 'requires_auth',
      lastChecked: new Date().toISOString(),
      notes: isConfigured
        ? 'Token configurado. A API oficial da Meta suporta anúncios políticos, sociais e anúncios na UE/UK, além de metadados autorizados em contas verificadas de desenvolvedor.'
        : 'Requer META_ACCESS_TOKEN gerado no Meta for Developers. Anúncios comerciais brasileiros comuns podem exigir importação via CSV ou visualização direta na biblioteca.',
      supportedFeatures: {
        canSearchDirectly: isConfigured,
        canImportCSV: false,
        canSyncScheduled: isConfigured,
        brazilCommercialCoverage: 'partial_social_only',
      },
    };
  }

  async searchAds(filters: AdSearchFilters): Promise<{ ads: Ad[]; totalCount: number; notice?: string }> {
    const token = getMetaAccessToken();

    if (!token) {
      return {
        ads: [],
        totalCount: 0,
        notice: 'Provedor Meta Ad Library API não autenticado. Configure META_ACCESS_TOKEN nas Configurações ou utilize o Provedor de Importação Manual/CSV.',
      };
    }

    try {
      const searchTerms = filters.keyword?.trim() || filters.niche?.replace(/-/g, ' ') || filters.advertiser_name || 'marketing';
      const country = filters.country && filters.country !== 'ALL' ? filters.country : 'BR';
      const url = new URL('https://graph.facebook.com/v21.0/ads_archive');
      url.searchParams.set('access_token', token);
      url.searchParams.set('ad_reached_countries', JSON.stringify([country]));
      url.searchParams.set('ad_active_status', filters.status === 'inactive' ? 'INACTIVE' : 'ACTIVE');
      url.searchParams.set('search_terms', searchTerms);
      url.searchParams.set('fields', 'id,ad_creation_time,ad_delivery_start_time,ad_delivery_stop_time,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_titles,page_name,page_id,publisher_platforms,ad_snapshot_url');
      url.searchParams.set('limit', String(filters.limit || 30));

      const res = await fetch(url.toString());
      if (!res.ok) {
        const errorData = await res.json();
        const err = errorData.error || {};
        let message = err.message || 'Falha ao consultar a API oficial';

        if (err.error_subcode === 2332002 || err.code === 10) {
          message = `Permissão da Ad Library API necessária: ${err.error_user_msg || 'Para acessar a API, é necessário confirmar sua identidade em facebook.com/ID e registrar o App em facebook.com/ads/library/api.'}`;
        }

        return {
          ads: [],
          totalCount: 0,
          notice: `Aviso da API Meta: ${message}`,
        };
      }

      const json = await res.json();
      const rawList = json.data || [];

      const ads: Ad[] = rawList.map((item: any, idx: number) => {
        const startedAt = item.ad_delivery_start_time || item.ad_creation_time || new Date().toISOString();
        const diffMs = Math.max(0, Date.now() - new Date(startedAt).getTime());
        const daysActive = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        const platforms = Array.isArray(item.publisher_platforms) ? item.publisher_platforms : ['facebook', 'instagram'];
        const headline = item.ad_creative_link_titles?.[0] || 'Anúncio Meta Ad Library';
        const bodyText = item.ad_creative_bodies?.[0] || '';

        const isc = calculateISC({
          daysActive,
          variationCount: 1,
          advertiserActiveAdsCount: 1,
          format: 'image',
          platforms: platforms as any,
          source: 'meta_ad_library',
          originalUrl: `https://www.facebook.com/ads/library/?id=${item.id}`,
        });

        return {
          id: `meta-${item.id}`,
          organization_id: 'org-default',
          advertiser_id: `meta-page-${item.page_id || idx}`,
          advertiser_name: item.page_name || 'Anunciante Meta',
          niche_id: filters.niche,
          niche_name: filters.niche ? filters.niche.replace(/-/g, ' ') : undefined,
          external_id: item.id,
          original_url: `https://www.facebook.com/ads/library/?id=${item.id}`,
          source: 'meta_ad_library',
          country: country,
          platforms: platforms as any,
          format: 'image',
          status_observed: 'active',
          started_at: startedAt,
          ended_at: item.ad_delivery_stop_time,
          last_verified_at: new Date().toISOString(),
          days_active_observed: daysActive,
          headline,
          body_text: bodyText,
          description: item.ad_creative_link_captions?.[0] || '',
          cta_text: 'Saiba mais',
          destination_url: '',
          media_url: item.ad_snapshot_url || '',
          snapshot_url: item.ad_snapshot_url || '',
          isc_score: isc.totalScore,
          isc_breakdown: isc,
          is_demo: false,
          data_confidence: 'verified_source',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      });

      return {
        ads,
        totalCount: ads.length,
      };
    } catch (err: any) {
      return {
        ads: [],
        totalCount: 0,
        notice: `Erro na conexão com Meta API: ${err.message}`,
      };
    }
  }
}
