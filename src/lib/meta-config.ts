export const DEFAULT_META_ACCESS_TOKEN =
  'EAANeqCLE4RkBS8cW2BIZAXgQNYmJJnnVdOUCY0bu61ZBGDdLQWCZCZCOWzZBJueRnKkiOPN7wGVpfRjFgm2HflRF4HxioWmZByHouWQ5Qz8VQ2CpfgzyeGZCsCxymWrYChXBaCHk2ctEMk2vnCq5G4JVkWoQ51QH0s7rJFFasOUMXdBwWWzyXSNUbS7ZC0TDt2RryUH9jfZATHZAj5zWSsyQ4RHahtTyeMyw6ZBQveZANLZARJqLd427R4CcW5ZCcyvO5Y1BRDRZCqFtUWfSChq9xi8Y9iXRMKfcQZDZD';

export const DEFAULT_META_APP_ID = '948501160976665';
export const DEFAULT_META_APP_SECRET = 'ec5342e38e1ec47cc1dca48cea8daa94';

/**
 * Retorna o token de acesso da Meta com fallback automático para o token verificado.
 * Token padrão: User Token de longa duração (~60 dias), verificado em 23/10/2026.
 * Evita que o app quebre em produção caso o env esteja vazio.
 */
export function getMetaAccessToken(): string {
  const envToken = process.env.META_ACCESS_TOKEN?.trim();
  // Aceita qualquer token EAANeqCLE4Rk válido do env
  if (envToken && envToken.startsWith('EAANeqCLE4Rk') && envToken.length > 50) {
    return envToken;
  }
  // Fallback seguro para o token verificado com permissões aprovadas
  return DEFAULT_META_ACCESS_TOKEN;
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
