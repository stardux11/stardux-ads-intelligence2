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

    const result = db.getAds(filters);
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
