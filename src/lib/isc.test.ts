import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateISC } from './isc';

describe('Índice de Sinais Criativos (ISC)', () => {
  it('deve calcular pontuação alta para anúncio de longa duração e alta consistência', () => {
    const res = calculateISC({
      daysActive: 120,
      variationCount: 6,
      advertiserActiveAdsCount: 15,
      format: 'video',
      platforms: ['facebook', 'instagram'],
      source: 'meta_ad_library',
      originalUrl: 'https://www.facebook.com/ads/library/?id=123',
    });

    assert.ok(res.totalScore >= 80, `Esperado >= 80, obtido: ${res.totalScore}`);
    assert.equal(res.tier, 'excellent');
    assert.equal(res.longevityScore, 35);
    assert.equal(res.recurrenceScore, 25);
    assert.equal(res.advertiserConsistencyScore, 15);
    assert.equal(res.multiFormatScore, 15);
    assert.equal(res.sourceConfidenceScore, 10);
  });

  it('deve calcular pontuação inicial para anúncio recém-publicado de 1 dia', () => {
    const res = calculateISC({
      daysActive: 1,
      variationCount: 1,
      advertiserActiveAdsCount: 1,
      format: 'image',
      platforms: ['facebook'],
      source: 'manual_import',
    });

    assert.ok(res.totalScore < 40, `Esperado < 40, obtido: ${res.totalScore}`);
    assert.equal(res.tier, 'initial');
    assert.equal(res.longevityScore, 6);
  });

  it('deve manter pontuação entre 0 e 100 mesmo com valores extremos', () => {
    const resMax = calculateISC({
      daysActive: 9999,
      variationCount: 100,
      advertiserActiveAdsCount: 100,
      format: 'video',
      platforms: ['facebook', 'instagram', 'audience_network'],
      source: 'meta_ad_library',
      originalUrl: 'https://facebook.com/ads/library/?id=999',
    });
    assert.ok(resMax.totalScore <= 100);

    const resMin = calculateISC({
      daysActive: 0,
      variationCount: 0,
      advertiserActiveAdsCount: 0,
      format: 'unknown',
      platforms: [],
      source: 'manual_import',
    });
    assert.ok(resMin.totalScore >= 0);
  });

  it('deve incluir explicação transparente sem promessas de faturamento', () => {
    const res = calculateISC({
      daysActive: 45,
      variationCount: 3,
      advertiserActiveAdsCount: 4,
      format: 'carousel',
      platforms: ['facebook', 'instagram'],
      source: 'csv_import',
      originalUrl: 'https://www.facebook.com/ads/library/?id=456',
    });

    assert.match(res.explanation, /ISC/);
    assert.match(res.explanation, /veiculação contínua observada/);
    assert.doesNotMatch(res.explanation, /faturamento garantido/);
  });
});
