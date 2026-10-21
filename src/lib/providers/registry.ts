import { IDataProvider, ProviderStatus } from './types';
import { MetaAdLibraryProvider } from './meta-provider';
import { ManualAndCSVProvider } from './manual-csv-provider';

export class ProviderRegistry {
  private static providers: Map<string, IDataProvider> = new Map();

  static initialize() {
    if (this.providers.size === 0) {
      this.register(new ManualAndCSVProvider());
      this.register(new MetaAdLibraryProvider());
    }
  }

  static register(provider: IDataProvider) {
    this.providers.set(provider.id, provider);
  }

  static getProvider(id: string): IDataProvider | undefined {
    this.initialize();
    return this.providers.get(id);
  }

  static async getAllStatuses(): Promise<ProviderStatus[]> {
    this.initialize();
    const statuses: ProviderStatus[] = [];
    for (const provider of this.providers.values()) {
      statuses.push(await provider.getStatus());
    }
    // Adiciona parceiros futuros e n8n na listagem
    statuses.push({
      id: 'commercial_partner_api',
      name: 'Conector Comercial Autorizado (Futuro)',
      type: 'commercial_api',
      isConfigured: false,
      status: 'requires_auth',
      lastChecked: new Date().toISOString(),
      notes: 'Interface preparada para fornecedores terceiros homologados com contratos comerciais e SLAs de dados.',
      supportedFeatures: {
        canSearchDirectly: true,
        canImportCSV: true,
        canSyncScheduled: true,
        brazilCommercialCoverage: 'full',
      },
    });
    statuses.push({
      id: 'n8n_webhooks',
      name: 'n8n Automação & Webhooks',
      type: 'webhook',
      isConfigured: false,
      status: 'operational',
      lastChecked: new Date().toISOString(),
      notes: 'Pronto para receber webhooks autenticados de fluxos de trabalho do n8n para ingestão periódica de pesquisas.',
      supportedFeatures: {
        canSearchDirectly: false,
        canImportCSV: true,
        canSyncScheduled: true,
        brazilCommercialCoverage: 'user_imported',
      },
    });
    return statuses;
  }
}
