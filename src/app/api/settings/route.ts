import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const metaAppId = process.env.META_APP_ID || '';
    const metaToken = process.env.META_ACCESS_TOKEN || '';
    const hasSecret = Boolean(process.env.META_APP_SECRET);

    // Valida o token atual
    let tokenInfo: any = null;
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
    }

    return NextResponse.json({
      metaAppId,
      metaToken: metaToken ? `${metaToken.slice(0, 10)}...${metaToken.slice(-6)}` : '',
      hasToken: Boolean(metaToken),
      hasSecret,
      tokenInfo,
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

    if (typeof metaToken === 'string' && metaToken.trim()) {
      envContent = updateEnvVar(envContent, 'META_ACCESS_TOKEN', metaToken.trim());
      process.env.META_ACCESS_TOKEN = metaToken.trim();
    }

    if (typeof geminiKey === 'string' && geminiKey.trim()) {
      envContent = updateEnvVar(envContent, 'GEMINI_API_KEY', geminiKey.trim());
      process.env.GEMINI_API_KEY = geminiKey.trim();
    }

    fs.writeFileSync(envPath, envContent, 'utf-8');

    return NextResponse.json({ success: true, message: 'Configurações e credenciais salvas com sucesso!' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
