import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';

export async function GET() {
  try {
    const db = StarduxDatabase.get();
    const collections = db.getCollections();
    return NextResponse.json(collections);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = StarduxDatabase.get();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Nome da coleção é obrigatório.' }, { status: 400 });
    }

    const created = db.createCollection(body);
    return NextResponse.json({ success: true, collection: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
