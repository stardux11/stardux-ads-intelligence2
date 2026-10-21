import { Ad, AdSearchFilters } from '../types';

export interface ProviderStatus {
  id: string;
  name: string;
  type: 'meta_api' | 'manual_csv' | 'commercial_api' | 'webhook';
  isConfigured: boolean;
  status: 'operational' | 'requires_auth' | 'rate_limited' | 'error';
  lastChecked: string;
  notes: string;
  supportedFeatures: {
    canSearchDirectly: boolean;
    canImportCSV: boolean;
    canSyncScheduled: boolean;
    brazilCommercialCoverage: 'full' | 'partial_social_only' | 'user_imported';
  };
}

export interface IDataProvider {
  id: string;
  name: string;
  getStatus(): Promise<ProviderStatus>;
  searchAds?(filters: AdSearchFilters): Promise<{ ads: Ad[]; totalCount: number; notice?: string }>;
  importAds?(rawContent: string, format: 'csv' | 'json'): Promise<{ ads: Partial<Ad>[]; errors: any[] }>;
}
