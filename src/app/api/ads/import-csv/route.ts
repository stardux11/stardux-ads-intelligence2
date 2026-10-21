import { NextResponse } from 'next/server';
import { parseAndValidateCSV } from '@/lib/csv-parser';
import { StarduxDatabase } from '@/lib/storage/db';

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let csvText = '';
    let projectId: string | undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      projectId = (formData.get('project_id') as string) || undefined;
      if (!file) {
        return NextResponse.json({ error: 'Nenhum arquivo CSV enviado.' }, { status: 400 });
      }
      csvText = await file.text();
    } else {
      const json = await request.json();
      csvText = json.csvContent || '';
      projectId = json.project_id;
    }

    if (!csvText.trim()) {
      return NextResponse.json({ error: 'O conteúdo CSV está vazio.' }, { status: 400 });
    }

    const parseResult = parseAndValidateCSV(csvText);

    if (parseResult.validAds.length === 0 && parseResult.errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Nenhum anúncio válido pôde ser importado.',
        totalRows: parseResult.totalRows,
        importedCount: 0,
        errorsCount: parseResult.errors.length,
        errors: parseResult.errors,
      }, { status: 422 });
    }

    const db = StarduxDatabase.get();
    const adsToSave = parseResult.validAds.map(ad => ({
      ...ad,
      project_id: projectId || ad.project_id,
    }));

    const batchResult = db.batchCreateAds(adsToSave);

    return NextResponse.json({
      success: true,
      message: `${batchResult.created.length} anúncios importados com sucesso.`,
      totalRows: parseResult.totalRows,
      importedCount: batchResult.created.length,
      errorsCount: parseResult.errors.length,
      errors: parseResult.errors,
      createdAds: batchResult.created,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
