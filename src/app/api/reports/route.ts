import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';

export async function GET() {
  try {
    const db = StarduxDatabase.get();
    const reports = db.getReports();
    return NextResponse.json(reports);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = StarduxDatabase.get();

    if (!body.title || !body.title.trim()) {
      return NextResponse.json({ error: 'Título do relatório é obrigatório.' }, { status: 400 });
    }

    const created = db.createReport(body);
    return NextResponse.json({ success: true, report: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
