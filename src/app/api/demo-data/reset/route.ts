import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';

export async function POST() {
  try {
    const db = StarduxDatabase.get();
    db.resetDemoData();
    return NextResponse.json({
      success: true,
      message: 'Dados demonstrativos removidos. Banco pronto para importações reais de campanhas.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
