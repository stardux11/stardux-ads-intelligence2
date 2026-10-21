import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseAndValidateCSV, exportAdsToCSV } from './csv-parser';
import { Ad } from './types';

describe('CSV Parser e Validador de Anúncios', () => {
  it('deve processar linhas válidas com cálculo de dias ativos e ISC', () => {
    const csvData = `external_id,advertiser_name,headline,body_text,format,platforms,started_at,status_observed
AD-01,Stardux Imóveis,Lançamento Jardins,Apartamentos de luxo de 200m²,video,facebook;instagram,2026-01-01,active
AD-02,Clinica Sorriso,Alinhadores Invisíveis,Dentes alinhados sem dor,image,instagram,2026-06-01,active`;

    const res = parseAndValidateCSV(csvData, 'org-test');
    assert.equal(res.validAds.length, 2);
    assert.equal(res.errors.length, 0);
    assert.equal(res.validAds[0].advertiser_name, 'Stardux Imóveis');
    assert.equal(res.validAds[0].format, 'video');
    assert.ok(res.validAds[0].days_active_observed! > 30);
    assert.ok(res.validAds[0].isc_score! > 0);
  });

  it('deve registrar erros para linhas sem anunciante ou sem texto', () => {
    const csvData = `external_id,advertiser_name,headline,body_text,started_at
AD-INVALID-1,,Título Teste,Texto Teste,2026-01-01
AD-INVALID-2,Empresa Teste,,,2026-01-01
AD-INVALID-3,Empresa Teste,Título,Texto,data-invalida-xyz`;

    const res = parseAndValidateCSV(csvData, 'org-test');
    assert.equal(res.validAds.length, 0);
    assert.equal(res.errors.length, 3);
    assert.match(res.errors[0].error, /advertiser_name/);
    assert.match(res.errors[1].error, /headline.*body_text/);
    assert.match(res.errors[2].error, /Data de início inválida/);
  });

  it('deve ignorar registros duplicados pelo external_id', () => {
    const csvData = `external_id,advertiser_name,headline,body_text
DEDUP-01,Imóveis ABC,Título 1,Texto 1
DEDUP-01,Imóveis ABC,Título 2,Texto 2`;

    const res = parseAndValidateCSV(csvData, 'org-test');
    assert.equal(res.validAds.length, 1);
    assert.equal(res.errors.length, 1);
    assert.match(res.errors[0].error, /duplicado/);
  });

  it('deve exportar anúncios corretamente para string CSV', () => {
    const mockAd: Ad = {
      id: 'ad-1',
      organization_id: 'org-test',
      advertiser_id: 'adv-1',
      advertiser_name: 'Anunciante Export',
      original_url: 'https://facebook.com/ads/library/?id=1',
      source: 'csv_import',
      country: 'BR',
      platforms: ['facebook', 'instagram'],
      format: 'image',
      status_observed: 'active',
      started_at: '2026-01-01T00:00:00.000Z',
      last_verified_at: '2026-10-20T00:00:00.000Z',
      days_active_observed: 290,
      headline: 'Título Export',
      body_text: 'Corpo Export',
      isc_score: 85,
      isc_breakdown: {} as any,
      is_demo: false,
      data_confidence: 'verified_source',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const csvOutput = exportAdsToCSV([mockAd]);
    assert.match(csvOutput, /Anunciante Export/);
    assert.match(csvOutput, /Título Export/);
    assert.match(csvOutput, /290/);
  });
});
