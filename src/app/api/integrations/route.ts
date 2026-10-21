import { NextResponse } from 'next/server';
import { ProviderRegistry } from '@/lib/providers/registry';

export async function GET() {
  try {
    const statuses = await ProviderRegistry.getAllStatuses();
    return NextResponse.json(statuses);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
