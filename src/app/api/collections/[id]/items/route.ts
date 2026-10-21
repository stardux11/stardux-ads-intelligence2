import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = StarduxDatabase.get();
    const items = db.getCollectionItems(id);
    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = StarduxDatabase.get();

    if (!body.ad_id) {
      return NextResponse.json({ error: 'ad_id é obrigatório.' }, { status: 400 });
    }

    const item = db.saveAdToCollection({
      collectionId: id,
      adId: body.ad_id,
      notes: body.notes,
      tags: body.tags,
    });

    return NextResponse.json({ success: true, item }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const adId = searchParams.get('ad_id');

    if (!adId) {
      return NextResponse.json({ error: 'ad_id é obrigatório.' }, { status: 400 });
    }

    const db = StarduxDatabase.get();
    const removed = db.removeAdFromCollection(id, adId);

    return NextResponse.json({ success: removed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
