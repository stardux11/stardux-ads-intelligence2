import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';

export async function POST() {
  try {
    const db = StarduxDatabase.get();
    db.seedDemoData();
    return NextResponse.json({
      success: true,
      message: 'Dados demonstrativos carregados com sucesso para os 5 nichos (Imobiliárias, Odontologia, Moda, Advocacia e Cursos).',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
