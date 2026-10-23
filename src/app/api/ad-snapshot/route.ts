import { NextRequest, NextResponse } from 'next/server';
import { getMetaAccessToken } from '@/lib/meta-config';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return new NextResponse('ID do anúncio é obrigatório', { status: 400 });
  }

  const token = getMetaAccessToken();
  const metaUrl = `https://www.facebook.com/ads/archive/render_ad/?id=${id}&access_token=${token}`;

  try {
    const res = await fetch(metaUrl);

    let html = await res.text();

    // Insere <base href="https://www.facebook.com/"> para que todos os scripts, estilos e imagens carreguem da Meta
    if (html.includes('<head>')) {
      html = html.replace('<head>', '<head><base href="https://www.facebook.com/">');
    } else if (html.includes('<head ')) {
      html = html.replace(/<head[^>]*>/, (match) => `${match}<base href="https://www.facebook.com/">`);
    }

    // Remove eventuais redirecionamentos indesejados
    html = html.replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'SAMEORIGIN',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    return new NextResponse(`Erro ao carregar prévia: ${err.message}`, { status: 500 });
  }
}
