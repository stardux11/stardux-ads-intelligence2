import { NextResponse } from 'next/server';
import { StarduxDatabase } from '@/lib/storage/db';

export async function GET() {
  try {
    const db = StarduxDatabase.get();
    const stats = db.getDashboardStats();
    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
