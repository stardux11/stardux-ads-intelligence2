import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { analyzeAdCreatively } from './heuristic-analyzer';
import { Ad } from './types';

describe('Analista Criativo Heurístico', () => {
  it('deve extrair as 10 dimensões analíticas de um anúncio imobiliário', () => {
    const mockAd: Ad = {
      id: 'ad-test-imo',
      organization_id: 'org-1',
      advertiser_id: 'adv-1',
      advertiser_name: 'Stardux Luxury Real Estate',
      original_url: 'https://facebook.com/ads/library/?id=123',
      source: 'meta_ad_library',
      country: 'BR',
      platforms: ['facebook', 'instagram'],
      format: 'video',
      status_observed: 'active',
      started_at: '2026-04-01T00:00:00.000Z',
      last_verified_at: '2026-10-20T00:00:00.000Z',
      days_active_observed: 200,
      headline: 'Apartamentos de Alto Padrão nos Jardins',
      body_text: 'More a 5 minutos do Parque Ibirapuera com vista permanente. Condições especiais de pré-lançamento. Poucas unidades disponíveis.',
      isc_score: 92,
      isc_breakdown: {} as any,
      is_demo: false,
      data_confidence: 'verified_source',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const analysis = analyzeAdCreatively(mockAd);

    assert.equal(analysis.is_offline_heuristic, true);
    assert.equal(analysis.ad_id, 'ad-test-imo');
    assert.ok(analysis.hook_analysis.length > 5);
    assert.ok(analysis.copy_structure.length > 5);
    assert.ok(analysis.problem_addressed.length > 5);
    assert.ok(analysis.desire_explored.length > 5);
    assert.ok(analysis.offer_analysis.length > 5);
    assert.ok(analysis.audience_inferred.length > 5);
    assert.ok(analysis.longevity_hypotheses.length > 5);
    assert.ok(analysis.recommendations.length >= 3);
  });
});
