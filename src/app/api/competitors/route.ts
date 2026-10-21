import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const db = StarduxDatabase.get();
    let competitors = db.getAdvertisers();

    const projectId = searchParams.get('project_id');
    if (projectId) {
      competitors = competitors.filter(c => c.project_id === projectId);
    }

    const niche = searchParams.get('niche');
    if (niche) {
      competitors = competitors.filter(c => c.niche_id === niche || c.niche_name?.toLowerCase().includes(niche.toLowerCase()));
    }

    return NextResponse.json(competitors);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = StarduxDatabase.get();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Nome do concorrente é obrigatório.' }, { status: 400 });
    }

    const created = db.createAdvertiser(body);
    return NextResponse.json({ success: true, competitor: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
