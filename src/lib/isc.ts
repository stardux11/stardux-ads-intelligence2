import { ISCBreakdown, AdFormat, Platform, AdSource, DataConfidence } from './types';

export interface ISCCalculationInput {
  daysActive: number;
  variationCount?: number;
  advertiserActiveAdsCount?: number;
  format: AdFormat;
  platforms: Platform[];
  source: AdSource;
  originalUrl?: string;
  dataConfidence?: DataConfidence;
}

/**
 * Calcula o Índice de Sinais Criativos (ISC)
 * Pontuação explicável de 0 a 100 baseada exclusivamente em dados observáveis.
 * NÃO inventa nem estima métricas de faturamento ou ROAS.
 */
export function calculateISC(input: ISCCalculationInput): ISCBreakdown {
  const {
    daysActive = 1,
    variationCount = 1,
    advertiserActiveAdsCount = 1,
    format,
    platforms = [],
    source,
    originalUrl = '',
  } = input;

  // 1. Longevidade Observada (0 - 35 pts)
  let longevityScore = 0;
  if (daysActive >= 90) {
    longevityScore = 35;
  } else if (daysActive >= 60) {
    longevityScore = 32;
  } else if (daysActive >= 30) {
    longevityScore = 26;
  } else if (daysActive >= 15) {
    longevityScore = 18;
  } else if (daysActive >= 7) {
    longevityScore = 12;
  } else if (daysActive >= 1) {
    longevityScore = 6;
  } else {
    longevityScore = 2;
  }

  // 2. Recorrência & Variações Criativas (0 - 25 pts)
  let recurrenceScore = 0;
  if (variationCount >= 5) {
    recurrenceScore = 25;
  } else if (variationCount >= 3) {
    recurrenceScore = 19;
  } else if (variationCount >= 2) {
    recurrenceScore = 14;
  } else {
    recurrenceScore = 8;
  }

  // 3. Consistência do Anunciante (0 - 15 pts)
  let advertiserConsistencyScore = 0;
  if (advertiserActiveAdsCount >= 10) {
    advertiserConsistencyScore = 15;
  } else if (advertiserActiveAdsCount >= 5) {
    advertiserConsistencyScore = 12;
  } else if (advertiserActiveAdsCount >= 2) {
    advertiserConsistencyScore = 8;
  } else {
    advertiserConsistencyScore = 5;
  }

  // 4. Formato e Amplitude de Plataforma (0 - 15 pts)
  let multiFormatScore = 5;
  const isMultiPlatform = platforms.length >= 2;
  const isEngagingFormat = format === 'video' || format === 'carousel';

  if (isMultiPlatform && isEngagingFormat) {
    multiFormatScore = 15;
  } else if (isMultiPlatform || isEngagingFormat) {
    multiFormatScore = 11;
  } else {
    multiFormatScore = 6;
  }

  // 5. Confiabilidade e Verificação da Fonte (0 - 10 pts)
  let sourceConfidenceScore = 5;
  const hasMetaLibraryUrl = originalUrl.includes('facebook.com/ads/library') || originalUrl.includes('meta.com');
  
  if (source === 'meta_ad_library') {
    sourceConfidenceScore = 10;
  } else if (hasMetaLibraryUrl) {
    sourceConfidenceScore = 9;
  } else if (source === 'csv_import') {
    sourceConfidenceScore = 7;
  } else {
    sourceConfidenceScore = 5;
  }

  const rawTotal = longevityScore + recurrenceScore + advertiserConsistencyScore + multiFormatScore + sourceConfidenceScore;
  const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

  let tier: ISCBreakdown['tier'] = 'initial';
  let tierLabel = 'Sinal Inicial / Teste';

  if (totalScore >= 80) {
    tier = 'excellent';
    tierLabel = 'Excelente Sinal de Continuidade';
  } else if (totalScore >= 60) {
    tier = 'good';
    tierLabel = 'Bom Sinal de Estabilidade';
  } else if (totalScore >= 40) {
    tier = 'moderate';
    tierLabel = 'Sinal Moderado Observado';
  }

  const explanation = `O anúncio atingiu ISC ${totalScore}/100 refletindo ${daysActive} dias de veiculação contínua observada, ${variationCount} variações de formato, presença em ${platforms.length || 1} canais da Meta e validação de fonte (${sourceConfidenceScore}/10). Classificação baseada estritamente em sinais de continuidade, sem estimar faturamento.`;

  return {
    totalScore,
    longevityScore,
    recurrenceScore,
    advertiserConsistencyScore,
    multiFormatScore,
    sourceConfidenceScore,
    tier,
    tierLabel,
    explanation,
    calculatedDays: daysActive,
    variationCount,
  };
}
