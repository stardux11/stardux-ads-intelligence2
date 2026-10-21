import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';

export async function GET() {
  try {
    const db = StarduxDatabase.get();
    const projects = db.getProjects();
    return NextResponse.json(projects);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = StarduxDatabase.get();

    if (!body.name || !body.name.trim()) {
      return NextResponse.json({ error: 'Nome do projeto é obrigatório.' }, { status: 400 });
    }

    const created = db.createProject(body);
    return NextResponse.json({ success: true, project: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
