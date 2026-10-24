import { NextRequest, NextResponse } from 'next/server';
import { getMetaAccessToken } from '@/lib/meta-config';

/**
 * Extrai URLs de mídia (imagens e vídeos) do HTML do snapshot da Meta.
 * Retorna { imageUrl, videoUrl, html } para uso direto no modal.
 */
function extractMediaFromHtml(html: string): { imageUrl: string | null; videoUrl: string | null } {
  let imageUrl: string | null = null;
  let videoUrl: string | null = null;

  // Extrair URL de vídeo: procurar por src em tags <video> ou em "video_sd_url"/"video_hd_url" em JSON embutido
  const videoSrcMatch = html.match(/<video[^>]+src=["']([^"']+)["']/i);
  if (videoSrcMatch) {
    videoUrl = videoSrcMatch[1];
  }

  // Procurar em dados JSON embutidos: "video_sd_url","video_hd_url"
  if (!videoUrl) {
    const hdMatch = html.match(/"video_hd_url"\s*:\s*"([^"]+)"/);
    if (hdMatch) {
      videoUrl = hdMatch[1].replace(/\\u0025/g, '%').replace(/\\\//g, '/');
    }
  }
  if (!videoUrl) {
    const sdMatch = html.match(/"video_sd_url"\s*:\s*"([^"]+)"/);
    if (sdMatch) {
      videoUrl = sdMatch[1].replace(/\\u0025/g, '%').replace(/\\\//g, '/');
    }
  }
  // Fallback: procurar por URLs .mp4 no HTML
  if (!videoUrl) {
    const mp4Match = html.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/);
    if (mp4Match) {
      videoUrl = mp4Match[0];
    }
  }

  // Extrair URL de imagem principal: procurar "creative_body_image" ou primeira <img> grande
  if (!videoUrl) {
    // Procurar em dados JSON: "image_url" ou "uri" com scontent
    const imgJsonMatch = html.match(/"image_url"\s*:\s*"([^"]+)"/);
    if (imgJsonMatch) {
      imageUrl = imgJsonMatch[1].replace(/\\\//g, '/');
    }

    if (!imageUrl) {
      const scontentMatch = html.match(/https?:\/\/[^"'\s]*scontent[^"'\s]*\.(?:jpg|jpeg|png|webp)[^"'\s]*/i);
      if (scontentMatch) {
        imageUrl = scontentMatch[0];
      }
    }

    if (!imageUrl) {
      // Pegar primeira <img> com src de imagem real (não ícones 1x1)
      const imgSrcMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
      for (const match of imgSrcMatches) {
        const src = match[1];
        if (
          src.includes('fbcdn') ||
          src.includes('scontent') ||
          src.includes('cdninstagram') ||
          (src.startsWith('http') && (src.includes('.jpg') || src.includes('.png') || src.includes('.webp')))
        ) {
          imageUrl = src;
          break;
        }
      }
    }
  }

  // Decodificar entidades HTML simples
  const decode = (s: string | null) =>
    s
      ? s.replace(/&amp;/g, '&').replace(/&#x2F;/g, '/').replace(/\\u002F/g, '/')
      : null;

  return {
    imageUrl: decode(imageUrl),
    videoUrl: decode(videoUrl),
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const mode = searchParams.get('mode') || 'iframe'; // 'media' (JSON) or 'iframe' (HTML)

  if (!id) {
    return new NextResponse('ID do anúncio é obrigatório', { status: 400 });
  }

  const token = getMetaAccessToken();
  const metaUrl = `https://www.facebook.com/ads/archive/render_ad/?id=${id}&access_token=${token}`;

  try {
    const res = await fetch(metaUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
    });

    const html = await res.text();

    if (mode === 'media') {
      // Retornar URLs de mídia extraídas como JSON
      const { imageUrl, videoUrl } = extractMediaFromHtml(html);
      return NextResponse.json({ imageUrl, videoUrl, snapshotUrl: metaUrl });
    }

    // mode === 'iframe': retornar HTML para embed
    let injectedHtml = html;

    // Inserir base href para resolver recursos relativos
    if (injectedHtml.includes('<head>')) {
      injectedHtml = injectedHtml.replace('<head>', '<head><base href="https://www.facebook.com/">');
    } else if (injectedHtml.includes('<head ')) {
      injectedHtml = injectedHtml.replace(/(<head[^>]*>)/, '$1<base href="https://www.facebook.com/">');
    }

    // Remover noscript para evitar redirecionamentos
    injectedHtml = injectedHtml.replace(/<noscript>[\s\S]*?<\/noscript>/gi, '');

    return new NextResponse(injectedHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'SAMEORIGIN',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=1800',
      },
    });
  } catch (err: any) {
    if (mode === 'media') {
      return NextResponse.json({ imageUrl: null, videoUrl: null, error: err.message });
    }
    return new NextResponse(`Erro ao carregar prévia: ${err.message}`, { status: 500 });
  }
}
