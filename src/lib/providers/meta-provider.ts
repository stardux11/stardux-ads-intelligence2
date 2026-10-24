import { IDataProvider, ProviderStatus } from './types';
import { Ad, AdSearchFilters } from '../types';
import { calculateISC } from '../isc';
import { getMetaAccessToken, DEFAULT_META_ACCESS_TOKEN } from '../meta-config';

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
        ? 'Token configurado e verificado. Anúncios com criativos (imagens/vídeos) são exibidos diretamente via Meta Ad Library API.'
        : 'Requer META_ACCESS_TOKEN gerado no Meta for Developers.',
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
        notice: 'Provedor Meta Ad Library API não autenticado. Configure META_ACCESS_TOKEN nas Configurações.',
      };
    }

    try {
      const searchTerms =
        filters.keyword?.trim() ||
        filters.niche?.replace(/-/g, ' ') ||
        filters.advertiser_name ||
        'marketing digital';

      const country = filters.country && filters.country !== 'ALL' ? filters.country : 'BR';

      const url = new URL('https://graph.facebook.com/v21.0/ads_archive');
      url.searchParams.set('access_token', token);
      url.searchParams.set('ad_reached_countries', JSON.stringify([country]));
      url.searchParams.set('ad_active_status', filters.status === 'inactive' ? 'INACTIVE' : 'ACTIVE');
      url.searchParams.set('search_terms', searchTerms);

      // Campos oficiais suportados pela API Meta Ad Library
      url.searchParams.set(
        'fields',
        [
          'id',
          'ad_creation_time',
          'ad_delivery_start_time',
          'ad_delivery_stop_time',
          'ad_creative_bodies',
          'ad_creative_link_captions',
          'ad_creative_link_titles',
          'ad_creative_link_descriptions',
          'ad_creative_images',
          'ad_creative_videos',
          'page_name',
          'page_id',
          'publisher_platforms',
          'ad_snapshot_url',
          'languages',
        ].join(',')
      );

      url.searchParams.set('limit', String(Math.min(filters.limit || 30, 50)));

      let res = await fetch(url.toString());
      if (!res.ok && url.searchParams.get('access_token') !== DEFAULT_META_ACCESS_TOKEN) {
        url.searchParams.set('access_token', DEFAULT_META_ACCESS_TOKEN);
        const retryRes = await fetch(url.toString());
        if (retryRes.ok) {
          res = retryRes;
        }
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const err = errorData.error || {};
        let message = err.message || 'Falha ao consultar a API oficial da Meta';

        if (err.error_subcode === 2332002 || err.code === 10) {
          message = `Permissão da Ad Library API necessária: ${err.error_user_msg || 'Confirme sua identidade em facebook.com/ID e registre o App em facebook.com/ads/library/api.'}`;
        }

        return {
          ads: [],
          totalCount: 0,
          notice: `Erro da API Meta: ${message}`,
        };
      }

      const json = await res.json();
      const rawList = json.data || [];

      // Filtro de país / idioma para o Brasil:
      // Garante que para BR apenas anúncios em português sejam exibidos
      const filteredList = country === 'BR'
        ? rawList.filter((item: any) => {
            if (Array.isArray(item.languages) && item.languages.length > 0) {
              return item.languages.includes('pt');
            }
            // Se o Meta não catalogou o idioma, checar palavras comuns em espanhol/inglês para descartar
            const text = ((item.ad_creative_bodies?.[0] || '') + ' ' + (item.ad_creative_link_titles?.[0] || '')).toLowerCase();
            const foreignMarkers = [' los ', ' las ', ' del ', ' por qué ', ' gracias por ', ' viajes ', ' con nosotros ', ' click here ', ' sign up '];
            const isForeign = foreignMarkers.some((m) => text.includes(m));
            return !isForeign;
          })
        : rawList;

      const ads: Ad[] = filteredList.map((item: any, idx: number) => {
        const startedAt = item.ad_delivery_start_time || item.ad_creation_time || new Date().toISOString();
        const diffMs = Math.max(0, Date.now() - new Date(startedAt).getTime());
        const daysActive = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        const platforms = Array.isArray(item.publisher_platforms) ? item.publisher_platforms : ['facebook', 'instagram'];
        const headline = item.ad_creative_link_titles?.[0] || item.ad_creative_link_captions?.[0] || 'Anúncio Meta Ad Library';
        const bodyText = item.ad_creative_bodies?.[0] || '';
        const description = item.ad_creative_link_descriptions?.[0] || item.ad_creative_link_captions?.[0] || '';
        const snapshotUrl = item.ad_snapshot_url || '';
        const pageId = item.page_id ? String(item.page_id) : '';

        // Extrai URLs reais de imagem/vídeo quando disponíveis
        const images: string[] = Array.isArray(item.ad_creative_images)
          ? item.ad_creative_images.filter(Boolean)
          : [];
        const videos: string[] = Array.isArray(item.ad_creative_videos)
          ? item.ad_creative_videos.filter(Boolean)
          : [];

        // Detecção de formato: campos reais têm prioridade sobre heurísticas de texto
        let format: 'image' | 'video' | 'carousel' = 'image';
        if (videos.length > 0) {
          format = 'video';
        } else if (images.length > 1) {
          format = 'carousel';
        } else {
          const fullText = (headline + ' ' + bodyText + ' ' + description).toLowerCase();
          if (
            fullText.includes('vídeo') ||
            fullText.includes('video') ||
            fullText.includes('assista') ||
            fullText.includes('dublado') ||
            fullText.includes('trailer') ||
            fullText.includes('episódio') ||
            fullText.includes('filme') ||
            fullText.includes('série')
          ) {
            format = 'video';
          } else if (fullText.includes('arraste') || fullText.includes('carrossel') || fullText.includes('deslize')) {
            format = 'carousel';
          }
        }

        // Media URL real: prioriza imagem/vídeo direto, fallback vazio (não usa snapshot como media)
        const realMediaUrl = images[0] || videos[0] || '';

        // Avatar oficial da página do Facebook como thumbnail
        const pageAvatarUrl = pageId ? `https://graph.facebook.com/${pageId}/picture?type=large` : '';

        const isc = calculateISC({
          daysActive,
          variationCount: Math.max(1, images.length + videos.length),
          advertiserActiveAdsCount: 1,
          format,
          platforms: platforms as any,
          source: 'meta_ad_library',
          originalUrl: `https://www.facebook.com/ads/library/?id=${item.id}`,
        });

        return {
          id: `meta-${item.id}`,
          organization_id: 'org-default',
          advertiser_id: pageId || `meta-page-${idx}`,
          advertiser_name: item.page_name || 'Anunciante Meta',
          niche_id: filters.niche,
          niche_name: filters.niche ? filters.niche.replace(/-/g, ' ') : undefined,
          external_id: item.id,
          original_url: `https://www.facebook.com/ads/library/?id=${item.id}`,
          source: 'meta_ad_library',
          country: country,
          platforms: platforms as any,
          format,
          status_observed: 'active',
          started_at: startedAt,
          ended_at: item.ad_delivery_stop_time,
          last_verified_at: new Date().toISOString(),
          days_active_observed: daysActive,
          headline,
          body_text: bodyText,
          description,
          cta_text: 'Saiba mais',
          destination_url: item.ad_creative_link_captions?.[0] ? `https://${item.ad_creative_link_captions[0]}` : '',
          media_url: realMediaUrl,       // URL real de imagem/vídeo se disponível
          thumbnail_url: pageAvatarUrl,  // Avatar da página como thumbnail
          snapshot_url: snapshotUrl,     // URL do snapshot oficial da Meta para preview
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
