import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';
import { exportAdsToCSV } from '@/lib/csv-parser';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const db = StarduxDatabase.get();

    // Exporta todos os anúncios conforme filtros
    const { ads } = db.getAds({
      niche: searchParams.get('niche') || undefined,
      project_id: searchParams.get('project_id') || undefined,
      advertiser_id: searchParams.get('advertiser_id') || undefined,
      limit: 1000,
    });

    if (format === 'json') {
      return new NextResponse(JSON.stringify(ads, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="stardux-anuncios-export.json"',
        },
      });
    }

    const csvData = exportAdsToCSV(ads);
    return new NextResponse(csvData, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="stardux-anuncios-export.csv"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
