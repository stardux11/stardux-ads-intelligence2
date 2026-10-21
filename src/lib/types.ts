export type Platform = 'facebook' | 'instagram' | 'audience_network' | 'messenger';
export type AdFormat = 'image' | 'video' | 'carousel' | 'story_reels' | 'unknown';
export type AdStatus = 'active' | 'inactive' | 'unverified';
export type AdSource = 'meta_ad_library' | 'manual_import' | 'csv_import' | 'authorized_partner';
export type DataConfidence = 'verified_source' | 'high_confidence' | 'estimated' | 'user_reported';

export interface ISCBreakdown {
  totalScore: number; // 0 - 100
  longevityScore: number; // 0 - 35
  recurrenceScore: number; // 0 - 25
  advertiserConsistencyScore: number; // 0 - 15
  multiFormatScore: number; // 0 - 15
  sourceConfidenceScore: number; // 0 - 10
  tier: 'excellent' | 'good' | 'moderate' | 'initial';
  tierLabel: string;
  explanation: string;
  calculatedDays: number;
  variationCount: number;
}

export interface Ad {
  id: string;
  organization_id: string;
  advertiser_id: string;
  advertiser_name: string;
  project_id?: string;
  niche_id?: string;
  niche_name?: string;
  external_id?: string;
  original_url: string;
  source: AdSource;
  country: string;
  platforms: Platform[];
  format: AdFormat;
  status_observed: AdStatus;
  
  // Observabilidade Real (Não inventar vendas/ROAS)
  started_at: string; // ISO String
  ended_at?: string;  // ISO String
  last_verified_at: string;
  days_active_observed: number;
  
  // Conteúdo Criativo
  headline: string;
  body_text: string;
  description?: string;
  cta_text?: string;
  destination_url?: string;
  media_url?: string;
  thumbnail_url?: string;
  snapshot_url?: string;
  
  // Análise Algorítmica de Sinais
  isc_score: number;
  isc_breakdown: ISCBreakdown;
  
  // Metadados
  is_demo: boolean;
  data_confidence: DataConfidence;
  created_at: string;
  updated_at: string;
}

export interface AdObservation {
  id: string;
  ad_id: string;
  observed_at: string;
  status_observed: AdStatus;
  source: string;
  notes?: string;
}

export interface Advertiser {
  id: string;
  organization_id: string;
  project_id?: string;
  niche_id?: string;
  niche_name?: string;
  page_id?: string;
  name: string;
  website_url?: string;
  facebook_page_url?: string;
  instagram_handle?: string;
  country: string;
  is_competitor: boolean;
  notes?: string;
  active_ads_count?: number;
  total_ads_count?: number;
  top_format?: AdFormat;
  max_longevity_days?: number;
  avg_isc?: number;
  created_at: string;
  updated_at: string;
}

export interface ResearchProject {
  id: string;
  organization_id: string;
  niche_id?: string;
  niche_name?: string;
  name: string;
  description?: string;
  status: 'active' | 'archived';
  competitors_count?: number;
  ads_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Niche {
  id: string;
  organization_id?: string;
  name: string;
  slug: string;
  description?: string;
  is_global: boolean;
  ads_count?: number;
  advertisers_count?: number;
  created_at: string;
}

export interface Collection {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  color: string;
  items_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionItem {
  id: string;
  collection_id: string;
  ad_id: string;
  ad?: Ad;
  personal_notes?: string;
  tags: string[];
  saved_at: string;
}

export interface AIAnalysis {
  id: string;
  organization_id: string;
  ad_id?: string;
  project_id?: string;
  advertiser_id?: string;
  niche_name?: string;
  analysis_type: 'single_ad' | 'competitor_benchmark' | 'niche_overview' | 'strategic_query';
  model_used: string;
  prompt_tokens: number;
  completion_tokens: number;
  estimated_cost_usd: number;
  is_offline_heuristic: boolean;
  
  executive_summary: string;
  hook_analysis: string;
  copy_structure: string;
  problem_addressed: string;
  desire_explored: string;
  offer_analysis: string;
  audience_inferred: string;
  social_proof: string;
  objections_handled: string;
  creative_style: string;
  longevity_hypotheses: string;
  recommendations: string[];
  supported_ad_ids?: string[];
  is_cached?: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  organization_id: string;
  project_id?: string;
  title: string;
  niche_name: string;
  period_start: string;
  period_end: string;
  ads_count: number;
  competitors_analyzed: string[];
  summary: string;
  trends_identified: Array<{ title: string; description: string; frequency: string }>;
  strategic_recommendations: Array<{ priority: 'alta' | 'média' | 'baixa'; action: string; rationale: string }>;
  disclaimer: string;
  created_at: string;
}

export interface ImportJob {
  id: string;
  organization_id: string;
  filename: string;
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  errors_log: Array<{ row: number; error: string; rawData?: any }>;
  status: 'completed' | 'failed' | 'processing';
  created_at: string;
}

export interface IntegrationConfig {
  id: string;
  provider_name: 'meta_ad_library' | 'authorized_partner' | 'n8n_webhook';
  display_name: string;
  is_active: boolean;
  auth_status: 'unconfigured' | 'connected' | 'invalid_token' | 'rate_limited' | 'error';
  last_sync_at?: string;
  last_error?: string;
  sync_frequency: string;
  permissions_summary: string;
  notes: string;
}

export interface AdSearchFilters {
  niche?: string;
  keyword?: string;
  advertiser_id?: string;
  advertiser_name?: string;
  project_id?: string;
  country?: string;
  platform?: Platform | 'all';
  format?: AdFormat | 'all';
  status?: AdStatus | 'all';
  minDaysActive?: number;
  source?: AdSource | 'all';
  onlyDemo?: boolean;
  sortBy?: 'longevity' | 'recent' | 'oldest' | 'isc' | 'advertiser';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}
