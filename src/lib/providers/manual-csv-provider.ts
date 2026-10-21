import { IDataProvider, ProviderStatus } from './types';
import { parseAndValidateCSV } from '../csv-parser';
import { Ad } from '../types';

export class ManualAndCSVProvider implements IDataProvider {
  id = 'manual_csv';
  name = 'Importação Manual & CSV (Operacional)';

  async getStatus(): Promise<ProviderStatus> {
    return {
      id: this.id,
      name: this.name,
      type: 'manual_csv',
      isConfigured: true,
      status: 'operational',
      lastChecked: new Date().toISOString(),
      notes: 'Totalmente operacional. Permite importar planilhas CSV com validação instantânea, registrar anúncios individuais e importar lotes JSON de fontes autorizadas.',
      supportedFeatures: {
        canSearchDirectly: false,
        canImportCSV: true,
        canSyncScheduled: false,
        brazilCommercialCoverage: 'user_imported',
      },
    };
  }

  async importAds(rawContent: string, format: 'csv' | 'json'): Promise<{ ads: Partial<Ad>[]; errors: any[] }> {
    if (format === 'csv') {
      const result = parseAndValidateCSV(rawContent);
      return {
        ads: result.validAds,
        errors: result.errors,
      };
    }

    try {
      const json = JSON.parse(rawContent);
      const list = Array.isArray(json) ? json : [json];
      return {
        ads: list,
        errors: [],
      };
    } catch (e: any) {
      return {
        ads: [],
        errors: [{ row: 1, error: `JSON inválido: ${e.message}`, rawData: null }],
      };
    }
  }
}
