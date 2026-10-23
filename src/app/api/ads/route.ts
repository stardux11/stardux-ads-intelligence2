import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';
import { AdSearchFilters } from '@/lib/types';
import { getMetaAccessToken } from '@/lib/meta-config';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const db = StarduxDatabase.get();

    const filters: AdSearchFilters = {
      niche: searchParams.get('niche') || undefined,
      keyword: searchParams.get('keyword') || undefined,
      advertiser_name: searchParams.get('advertiser_name') || undefined,
      advertiser_id: searchParams.get('advertiser_id') || undefined,
      project_id: searchParams.get('project_id') || undefined,
      country: searchParams.get('country') || 'BR',
      format: (searchParams.get('format') as any) || undefined,
      platform: (searchParams.get('platform') as any) || undefined,
      status: (searchParams.get('status') as any) || undefined,
      source: (searchParams.get('source') as any) || undefined,
      minDaysActive: searchParams.get('minDaysActive') ? Number(searchParams.get('minDaysActive')) : undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'longevity',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 50,
    };

    // Só busca se houver termo de pesquisa ou nicho selecionado
    // Evita carregar dados automáticos sem intenção do usuário
    const hasSearchIntent = Boolean(
      filters.keyword?.trim() ||
      filters.niche ||
      filters.advertiser_name ||
      filters.advertiser_id ||
      filters.project_id
    );

    if (!hasSearchIntent) {
      return NextResponse.json({ ads: [], total: 0 });
    }

    let result = db.getAds(filters);
    const metaToken = getMetaAccessToken();
    let apiNotice: string | undefined = undefined;

    // Consulta a Meta Ad Library API oficial sempre que há busca ativa
    if (metaToken) {
      try {
        const { MetaAdLibraryProvider } = await import('@/lib/providers/meta-provider');
        const metaProvider = new MetaAdLibraryProvider();

        const searchTerm =
          filters.keyword?.trim() ||
          filters.niche?.replace(/-/g, ' ') ||
          filters.advertiser_name ||
          '';

        const metaResult = await metaProvider.searchAds({
          ...filters,
          keyword: searchTerm,
          limit: Math.min(filters.limit || 25, 50),
        });

        if (metaResult.notice) {
          apiNotice = metaResult.notice;
        }

        if (metaResult.ads && metaResult.ads.length > 0) {
          // Salva apenas anúncios reais no banco local para persistência
          metaResult.ads.forEach((metaAd) => {
            try {
              db.createAd(metaAd);
            } catch {
              // Já existe ou duplicata, ignora silenciosamente
            }
          });

          // Re-consulta o banco após inserção aplicando os filtros locais
          const reQueried = db.getAds(filters);
          if (reQueried.ads.length > 0) {
            result = reQueried;
          } else {
            result = {
              ads: metaResult.ads,
              total: metaResult.totalCount,
            };
          }
        }
      } catch (metaErr: any) {
        console.warn('Erro ao consultar Meta Graph API:', metaErr);
        apiNotice = `Erro ao consultar Meta Graph API: ${metaErr.message}`;
      }
    }

    return NextResponse.json({
      ...result,
      notice: apiNotice,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = StarduxDatabase.get();

    if (!body.advertiser_name || (!body.headline && !body.body_text)) {
      return NextResponse.json(
        { error: 'Anunciante e ao menos um título ou texto principal são obrigatórios.' },
        { status: 400 }
      );
    }

    const createdAd = db.createAd(body);
    return NextResponse.json({ success: true, ad: createdAd }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
