import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';
import { runCreativeAIAnalysis } from '@/lib/gemini';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = StarduxDatabase.get();

    let targetAd = body.ad;
    if (!targetAd && body.ad_id) {
      targetAd = db.getAdById(body.ad_id);
    }

    let adsToAnalyze = body.ads;
    if (!adsToAnalyze && !targetAd) {
      const allAds = db.getAds({
        niche: body.niche,
        project_id: body.project_id,
        limit: 20,
      });
      adsToAnalyze = allAds.ads;
    }

    const analysis = await runCreativeAIAnalysis({
      ad: targetAd,
      ads: adsToAnalyze,
      query: body.query,
      projectContext: body.projectContext || {
        projectName: body.projectName || 'Análise Geral',
        niche: body.niche || 'Geral',
        competitors: body.competitors || [],
      },
    });

    return NextResponse.json(analysis);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
