import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';
import { AdSearchFilters } from '@/lib/types';

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
      country: searchParams.get('country') || undefined,
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

    let result = db.getAds(filters);

    // Se houver META_ACCESS_TOKEN e uma busca por palavra-chave ou nicho, ou se o banco estiver vazio, consulta a Graph API oficial
    const metaToken = process.env.META_ACCESS_TOKEN?.trim();
    if (metaToken && (filters.keyword || filters.niche || result.total === 0)) {
      try {
        const { MetaAdLibraryProvider } = await import('@/lib/providers/meta-provider');
        const metaProvider = new MetaAdLibraryProvider();
        const metaResult = await metaProvider.searchAds({
          ...filters,
          keyword: filters.keyword || filters.niche || 'marketing digital',
          limit: filters.limit || 25,
        });

        if (metaResult.ads && metaResult.ads.length > 0) {
          // Salva os anúncios encontrados no banco local/supabase para persistência e relatórios futuros
          metaResult.ads.forEach((metaAd) => {
            try {
              db.createAd(metaAd);
            } catch {
              // Já existe ou duplicata, ignora
            }
          });
          result = db.getAds(filters);
        }
      } catch (metaErr) {
        console.warn('Erro ao consultar Meta Graph API ao vivo:', metaErr);
      }
    }

    return NextResponse.json(result);
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
