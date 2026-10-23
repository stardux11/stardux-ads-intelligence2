export const DEFAULT_META_ACCESS_TOKEN =
  'EAANeqCLE4RkBS3q70hZComZBhMIEfjXlTaPdZAMZCj4pZCVJmjBDnZCyFc9OGodC2cHvjfCBywtvS4F4wTp8ZAqVZAuFYAZCI3ZA0IO5CxD2ZCZBALA9ZBhPSsc6TcZCAWZB6aIumQ84H2KMBBMjeng8ry2yjafVD6xZCOPk7FBmSJWZBwS9UdZCWXZBr8SBU9nmlUyi9xcYZB2s9g3VHGdAIyEzxlXXMZAjCzSzqftbtGJNZCgac0DHACf1ViZBonCRqQMbF3oiLxCNjPnA1ZBYr4yjZCirOQ5EZD';

export const DEFAULT_META_APP_ID = '948501160976665';

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
