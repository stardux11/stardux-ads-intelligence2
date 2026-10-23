export const DEFAULT_META_ACCESS_TOKEN =
  'EAANeqCLE4RkBSZCNzmXadu2ubF2i1MCYhOkmr2geBS98JOGjiqTS9HuYzQ0FKzcI1VstCL72ZBEmY0MgcNfXbRUfz4cMxhwZCZBdRZB51dyQ1RjpdLx2PeesZAeKXliriiUlBRyVsjBBzmOv4tSlaXySRupMxcr1cAh9VMaCMIcqVUY0vDQAZB9hZC7XSSEe';

export const DEFAULT_META_APP_ID = '948501160976665';
export const DEFAULT_META_APP_SECRET = 'ec5342e38e1ec47cc1dca48cea8daa94';

/**
 * Retorna o token de acesso da Meta com fallback automático para o token verificado.
 * Evita que o app quebre em produção (Vercel) caso o env esteja vazio ou com token antigo.
 */
export function getMetaAccessToken(): string {
  const envToken = process.env.META_ACCESS_TOKEN?.trim();
  // Se o token for vazio ou for o token antigo do robô de sistema que dava erro 2332002:
  if (!envToken || envToken.startsWith('EAANeqCLE4RkBSx')) {
    return DEFAULT_META_ACCESS_TOKEN;
  }
  return envToken;
}

export function getMetaAppId(): string {
  return process.env.META_APP_ID?.trim() || DEFAULT_META_APP_ID;
}

export function getMetaAppSecret(): string {
  return process.env.META_APP_SECRET?.trim() || DEFAULT_META_APP_SECRET;
}

/**
 * Troca um User Token temporário (1-2 horas) por um Long-Lived Token oficial de 60 dias.
 */
export async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{ token: string; expiresIn: number } | null> {
  try {
    const appId = getMetaAppId();
    const appSecret = getMetaAppSecret();
    const url = new URL('https://graph.facebook.com/v21.0/oauth/access_token');
    url.searchParams.set('grant_type', 'fb_exchange_token');
    url.searchParams.set('client_id', appId);
    url.searchParams.set('client_secret', appSecret);
    url.searchParams.set('fb_exchange_token', shortLivedToken);

    const res = await fetch(url.toString());
    const data = await res.json();
    if (data && data.access_token) {
      return {
        token: data.access_token,
        expiresIn: data.expires_in || 5184000, // ~60 dias
      };
    }
  } catch (err) {
    console.warn('Erro ao trocar token por Long-Lived:', err);
  }
  return null;
}
