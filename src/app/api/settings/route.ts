import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getMetaAccessToken, getMetaAppId } from '@/lib/meta-config';

export async function GET() {
  try {
    const metaAppId = getMetaAppId();
    const metaToken = getMetaAccessToken();
    const hasSecret = Boolean(process.env.META_APP_SECRET);

    // Valida o token atual
    let tokenInfo: any = null;
    let adLibraryInfo: any = null;

    if (metaToken && metaToken.length > 20) {
      try {
        const res = await fetch(`https://graph.facebook.com/debug_token?input_token=${metaToken}&access_token=${metaToken}`);
        const data = await res.json();
        if (data && data.data) {
          tokenInfo = {
            isValid: Boolean(data.data.is_valid),
            appId: data.data.app_id,
            application: data.data.application,
            expiresAt: data.data.expires_at === 0 ? 'Nunca (Permanente / Perpétuo)' : new Date(data.data.expires_at * 1000).toLocaleString('pt-BR'),
            scopes: data.data.scopes,
            errorMessage: data.data.error?.message,
          };
        } else if (data && data.error) {
          tokenInfo = {
            isValid: false,
            errorMessage: data.error.message,
            expiresAt: 'Expirado',
          };
        }
      } catch (err: any) {
        console.warn('Erro ao validar token da Meta:', err);
      }

      // Testa diretamente o acesso ao endpoint ads_archive
      try {
        const testUrl = new URL('https://graph.facebook.com/v21.0/ads_archive');
        testUrl.searchParams.set('access_token', metaToken);
        testUrl.searchParams.set('ad_reached_countries', JSON.stringify(['BR']));
        testUrl.searchParams.set('ad_active_status', 'ACTIVE');
        testUrl.searchParams.set('search_terms', 'marketing');
        testUrl.searchParams.set('limit', '1');

        const resAdLib = await fetch(testUrl.toString());
        const dataAdLib = await resAdLib.json();

        if (resAdLib.ok && !dataAdLib.error) {
          adLibraryInfo = {
            hasAccess: true,
            status: 'operational',
            message: 'Acesso à Ad Library API verificado e ativo!',
          };
        } else {
          const err = dataAdLib.error || {};
          adLibraryInfo = {
            hasAccess: false,
            status: 'permission_denied',
            code: err.code,
            subcode: err.error_subcode,
            title: err.error_user_title || 'Autorização necessária',
            userMsg: err.error_user_msg || err.message,
            message: err.message,
          };
        }
      } catch (err: any) {
        adLibraryInfo = {
          hasAccess: false,
          status: 'network_error',
          message: `Erro ao testar ads_archive: ${err.message}`,
        };
      }
    }

    return NextResponse.json({
      metaAppId,
      metaToken: metaToken ? `${metaToken.slice(0, 10)}...${metaToken.slice(-6)}` : '',
      hasToken: Boolean(metaToken),
      hasSecret,
      tokenInfo,
      adLibraryInfo,
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { metaAppId, metaAppSecret, metaToken, geminiKey } = body;

    const envPath = path.join(process.cwd(), '.env.local');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

    const updateEnvVar = (content: string, key: string, value: string) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(content)) {
        return content.replace(regex, `${key}="${value}"`);
      } else {
        return content + `\n${key}="${value}"`;
      }
    };

    if (typeof metaAppId === 'string' && metaAppId.trim()) {
      envContent = updateEnvVar(envContent, 'META_APP_ID', metaAppId.trim());
      process.env.META_APP_ID = metaAppId.trim();
    }

    if (typeof metaAppSecret === 'string' && metaAppSecret.trim()) {
      envContent = updateEnvVar(envContent, 'META_APP_SECRET', metaAppSecret.trim());
      process.env.META_APP_SECRET = metaAppSecret.trim();
    }

    let finalToken = typeof metaToken === 'string' ? metaToken.trim() : '';
    let extendedNotice = '';

    if (finalToken && finalToken.length > 20) {
      try {
        const { exchangeForLongLivedToken } = await import('@/lib/meta-config');
        const exchanged = await exchangeForLongLivedToken(finalToken);
        if (exchanged && exchanged.token) {
          finalToken = exchanged.token;
          extendedNotice = ' (Token estendido para validade de 60 dias!)';
        }
      } catch (e) {
        console.warn('Erro ao estender token:', e);
      }

      envContent = updateEnvVar(envContent, 'META_ACCESS_TOKEN', finalToken);
      process.env.META_ACCESS_TOKEN = finalToken;
    }

    if (typeof geminiKey === 'string' && geminiKey.trim()) {
      envContent = updateEnvVar(envContent, 'GEMINI_API_KEY', geminiKey.trim());
      process.env.GEMINI_API_KEY = geminiKey.trim();
    }

    fs.writeFileSync(envPath, envContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: `Configurações e credenciais salvas com sucesso!${extendedNotice}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
