import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = StarduxDatabase.get();
    const ad = db.getAdById(id);

    if (!ad) {
      return NextResponse.json({ error: 'Anúncio não encontrado' }, { status: 404 });
    }

    return NextResponse.json(ad);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = StarduxDatabase.get();
    const deleted = db.deleteAd(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Anúncio não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Anúncio excluído com sucesso' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
