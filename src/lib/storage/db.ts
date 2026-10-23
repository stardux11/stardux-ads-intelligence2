import fs from 'fs';
import path from 'path';
import {
  Ad,
  Advertiser,
  ResearchProject,
  Niche,
  Collection,
  CollectionItem,
  Report,
  AdSearchFilters,
} from '../types';
import {
  INITIAL_NICHES,
  INITIAL_PROJECTS,
  INITIAL_ADVERTISERS,
  INITIAL_ADS,
  INITIAL_COLLECTIONS,
} from './initial-demo-data';
import { calculateISC } from '../isc';

interface StarduxDBState {
  niches: Niche[];
  projects: ResearchProject[];
  advertisers: Advertiser[];
  ads: Ad[];
  collections: Collection[];
  collectionItems: CollectionItem[];
  reports: Report[];
  lastUpdated: string;
}

const DATA_DIR = path.join(process.cwd(), '.stardux-data');
const DB_FILE = path.join(DATA_DIR, 'stardux-db.json');

export class StarduxDatabase {
  private static instance: StarduxDatabase;
  private state: StarduxDBState;

  private constructor() {
    this.state = this.loadFromDisk();
  }

  public static get(): StarduxDatabase {
    if (!StarduxDatabase.instance) {
      StarduxDatabase.instance = new StarduxDatabase();
    }
    return StarduxDatabase.instance;
  }

  private loadFromDisk(): StarduxDBState {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.ads && Array.isArray(parsed.ads)) {
          parsed.ads = parsed.ads.filter((a: any) => !a.is_demo);
          parsed.advertisers = (parsed.advertisers || []).filter((adv: any) => !adv.id.startsWith('adv-'));
          parsed.projects = (parsed.projects || []).filter((p: any) => !p.id.startsWith('proj-'));
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Erro ao ler .stardux-data/stardux-db.json, inicializando com dados padrão:', err);
    }

    // Inicialização 100% limpa (0 anúncios fictícios, apenas dados reais da Meta)
    const initialState: StarduxDBState = {
      niches: [...INITIAL_NICHES],
      projects: [],
      advertisers: [],
      ads: [],
      collections: [],
      collectionItems: [],
      reports: [],
      lastUpdated: new Date().toISOString(),
    };

    this.saveToDisk(initialState);
    return initialState;

  }

  private saveToDisk(state: StarduxDBState) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (err) {
      console.error('Erro ao salvar .stardux-data/stardux-db.json:', err);
    }
  }

  // Métodos de Anúncios
  public getAds(filters: AdSearchFilters = {}): { ads: Ad[]; total: number } {
    let list = [...this.state.ads];

    if (filters.niche && filters.niche !== 'all') {
      const q = filters.niche.toLowerCase();
      list = list.filter(a => a.niche_id?.toLowerCase() === q || a.niche_name?.toLowerCase().includes(q));
    }

    if (filters.keyword && filters.keyword.trim()) {
      const kw = filters.keyword.toLowerCase().trim();
      list = list.filter(a =>
        a.headline.toLowerCase().includes(kw) ||
        a.body_text.toLowerCase().includes(kw) ||
        a.advertiser_name.toLowerCase().includes(kw) ||
        a.description?.toLowerCase().includes(kw)
      );
    }

    if (filters.advertiser_id) {
      list = list.filter(a => a.advertiser_id === filters.advertiser_id);
    }

    if (filters.advertiser_name) {
      const advName = filters.advertiser_name.toLowerCase();
      list = list.filter(a => a.advertiser_name.toLowerCase().includes(advName));
    }

    if (filters.project_id) {
      list = list.filter(a => a.project_id === filters.project_id);
    }

    if (filters.format && filters.format !== 'all') {
      list = list.filter(a => a.format === filters.format);
    }

    if (filters.platform && filters.platform !== 'all') {
      list = list.filter(a => a.platforms.includes(filters.platform as any));
    }

    if (filters.status && filters.status !== 'all') {
      list = list.filter(a => a.status_observed === filters.status);
    }

    if (filters.source && filters.source !== 'all') {
      list = list.filter(a => a.source === filters.source);
    }

    if (filters.minDaysActive && filters.minDaysActive > 0) {
      list = list.filter(a => a.days_active_observed >= (filters.minDaysActive || 0));
    }

    // Filtro de país: aplica sempre que country != 'ALL'
    if (filters.country && filters.country !== 'ALL') {
      list = list.filter(a => !a.country || a.country === filters.country);
    }

    if (filters.onlyDemo) {
      list = list.filter(a => a.is_demo);
    }

    // Ordenação
    const sortBy = filters.sortBy || 'longevity';
    const order = filters.sortOrder || 'desc';

    list.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortBy === 'longevity') {
        valA = a.days_active_observed;
        valB = b.days_active_observed;
      } else if (sortBy === 'isc') {
        valA = a.isc_score;
        valB = b.isc_score;
      } else if (sortBy === 'recent') {
        valA = new Date(a.started_at).getTime();
        valB = new Date(b.started_at).getTime();
      } else if (sortBy === 'oldest') {
        valA = new Date(a.started_at).getTime();
        valB = new Date(b.started_at).getTime();
        return valA - valB;
      } else if (sortBy === 'advertiser') {
        return a.advertiser_name.localeCompare(b.advertiser_name);
      }

      return order === 'desc' ? valB - valA : valA - valB;
    });

    const total = list.length;
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const paginated = list.slice((page - 1) * limit, page * limit);

    return { ads: paginated, total };
  }

  public getAdById(id: string): Ad | undefined {
    return this.state.ads.find(a => a.id === id);
  }

  public createAd(adData: Partial<Ad>): Ad {
    const id = adData.id || `ad-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const startedAt = adData.started_at || now;
    const diff = Math.max(0, Date.now() - new Date(startedAt).getTime());
    const daysActive = adData.days_active_observed || Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));

    // Certifica advertiser
    let advertiser = this.state.advertisers.find(adv => adv.name.toLowerCase() === (adData.advertiser_name || '').toLowerCase());
    if (!advertiser && adData.advertiser_name) {
      advertiser = this.createAdvertiser({
        name: adData.advertiser_name,
        country: adData.country || 'BR',
        is_competitor: true,
        project_id: adData.project_id,
        niche_id: adData.niche_id,
        niche_name: adData.niche_name,
      });
    }

    const isc = calculateISC({
      daysActive,
      variationCount: 1,
      advertiserActiveAdsCount: (advertiser?.active_ads_count || 1) + 1,
      format: adData.format || 'image',
      platforms: adData.platforms || ['facebook', 'instagram'],
      source: adData.source || 'manual_import',
      originalUrl: adData.original_url,
    });

    const newAd: Ad = {
      id,
      organization_id: adData.organization_id || 'org-default',
      advertiser_id: advertiser?.id || adData.advertiser_id || 'adv-unknown',
      advertiser_name: adData.advertiser_name || advertiser?.name || 'Anunciante Sem Nome',
      project_id: adData.project_id,
      niche_id: adData.niche_id || advertiser?.niche_id,
      niche_name: adData.niche_name || advertiser?.niche_name,
      external_id: adData.external_id || `MANUAL-${Date.now()}`,
      original_url: adData.original_url || `https://www.facebook.com/ads/library/?q=${encodeURIComponent(adData.advertiser_name || '')}`,
      source: adData.source || 'manual_import',
      country: adData.country || 'BR',
      platforms: adData.platforms || ['facebook', 'instagram'],
      format: adData.format || 'image',
      status_observed: adData.status_observed || 'active',
      started_at: startedAt,
      ended_at: adData.ended_at,
      last_verified_at: now,
      days_active_observed: daysActive,
      headline: adData.headline || 'Sem título informado',
      body_text: adData.body_text || '',
      description: adData.description || '',
      cta_text: adData.cta_text || 'Saiba mais',
      destination_url: adData.destination_url || '',
      media_url: adData.media_url || '',
      thumbnail_url: adData.thumbnail_url || adData.media_url,
      isc_score: isc.totalScore,
      isc_breakdown: isc,
      is_demo: Boolean(adData.is_demo),
      data_confidence: adData.original_url?.includes('facebook.com') ? 'verified_source' : 'user_reported',
      created_at: now,
      updated_at: now,
    };

    this.state.ads.unshift(newAd);
    this.updateAdvertiserMetrics();
    this.saveToDisk(this.state);
    return newAd;
  }

  public batchCreateAds(adsData: Partial<Ad>[]): { created: Ad[]; errors: any[] } {
    const created: Ad[] = [];
    const errors: any[] = [];

    adsData.forEach((data, idx) => {
      try {
        const ad = this.createAd(data);
        created.push(ad);
      } catch (err: any) {
        errors.push({ index: idx, error: err.message });
      }
    });

    return { created, errors };
  }

  public deleteAd(id: string): boolean {
    const prevLen = this.state.ads.length;
    this.state.ads = this.state.ads.filter(a => a.id !== id);
    if (this.state.ads.length !== prevLen) {
      this.updateAdvertiserMetrics();
      this.saveToDisk(this.state);
      return true;
    }
    return false;
  }

  // Anunciantes
  public getAdvertisers(): Advertiser[] {
    return this.state.advertisers;
  }

  public createAdvertiser(data: Partial<Advertiser>): Advertiser {
    const id = data.id || `adv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const adv: Advertiser = {
      id,
      organization_id: data.organization_id || 'org-default',
      project_id: data.project_id,
      niche_id: data.niche_id,
      niche_name: data.niche_name,
      name: data.name || 'Novo Concorrente',
      website_url: data.website_url,
      facebook_page_url: data.facebook_page_url,
      instagram_handle: data.instagram_handle,
      country: data.country || 'BR',
      is_competitor: data.is_competitor !== false,
      notes: data.notes || '',
      active_ads_count: 0,
      total_ads_count: 0,
      max_longevity_days: 0,
      created_at: now,
      updated_at: now,
    };

    this.state.advertisers.push(adv);
    this.updateAdvertiserMetrics();
    this.saveToDisk(this.state);
    return adv;
  }

  private updateAdvertiserMetrics() {
    this.state.advertisers.forEach(adv => {
      const ads = this.state.ads.filter(a => a.advertiser_id === adv.id || a.advertiser_name.toLowerCase() === adv.name.toLowerCase());
      adv.total_ads_count = ads.length;
      adv.active_ads_count = ads.filter(a => a.status_observed === 'active').length;
      adv.max_longevity_days = ads.length > 0 ? Math.max(...ads.map(a => a.days_active_observed)) : 0;
      adv.avg_isc = ads.length > 0 ? Math.round(ads.reduce((acc, a) => acc + a.isc_score, 0) / ads.length) : 0;
    });
  }

  // Projetos
  public getProjects(): ResearchProject[] {
    return this.state.projects;
  }

  public createProject(data: Partial<ResearchProject>): ResearchProject {
    const id = data.id || `proj-${Date.now()}`;
    const now = new Date().toISOString();
    const proj: ResearchProject = {
      id,
      organization_id: 'org-default',
      niche_id: data.niche_id,
      niche_name: data.niche_name || 'Geral',
      name: data.name || 'Novo Projeto',
      description: data.description || '',
      status: 'active',
      competitors_count: 0,
      ads_count: 0,
      created_at: now,
      updated_at: now,
    };
    this.state.projects.push(proj);
    this.saveToDisk(this.state);
    return proj;
  }

  // Nichos
  public getNiches(): Niche[] {
    return this.state.niches;
  }

  // Coleções e Favoritos
  public getCollections(): Collection[] {
    // Atualiza contagem de itens
    this.state.collections.forEach(c => {
      c.items_count = this.state.collectionItems.filter(item => item.collection_id === c.id).length;
    });
    return this.state.collections;
  }

  public createCollection(data: Partial<Collection>): Collection {
    const id = data.id || `coll-${Date.now()}`;
    const now = new Date().toISOString();
    const coll: Collection = {
      id,
      organization_id: 'org-default',
      name: data.name || 'Nova Coleção',
      description: data.description || '',
      color: data.color || '#10b981',
      items_count: 0,
      created_at: now,
      updated_at: now,
    };
    this.state.collections.push(coll);
    this.saveToDisk(this.state);
    return coll;
  }

  public getCollectionItems(collectionId: string): (CollectionItem & { ad?: Ad })[] {
    const items = this.state.collectionItems.filter(i => i.collection_id === collectionId);
    return items.map(item => ({
      ...item,
      ad: this.getAdById(item.ad_id),
    }));
  }

  public saveAdToCollection(params: { collectionId: string; adId: string; notes?: string; tags?: string[] }): CollectionItem {
    const existing = this.state.collectionItems.find(
      i => i.collection_id === params.collectionId && i.ad_id === params.adId
    );

    if (existing) {
      existing.personal_notes = params.notes || existing.personal_notes;
      existing.tags = params.tags || existing.tags;
      this.saveToDisk(this.state);
      return existing;
    }

    const newItem: CollectionItem = {
      id: `item-${Date.now()}`,
      collection_id: params.collectionId,
      ad_id: params.adId,
      personal_notes: params.notes || '',
      tags: params.tags || [],
      saved_at: new Date().toISOString(),
    };

    this.state.collectionItems.push(newItem);
    this.saveToDisk(this.state);
    return newItem;
  }

  public removeAdFromCollection(collectionId: string, adId: string): boolean {
    const prev = this.state.collectionItems.length;
    this.state.collectionItems = this.state.collectionItems.filter(
      i => !(i.collection_id === collectionId && i.ad_id === adId)
    );
    if (this.state.collectionItems.length !== prev) {
      this.saveToDisk(this.state);
      return true;
    }
    return false;
  }

  // Relatórios
  public getReports(): Report[] {
    return this.state.reports;
  }

  public createReport(data: Partial<Report>): Report {
    const id = data.id || `rep-${Date.now()}`;
    const report: Report = {
      id,
      organization_id: 'org-default',
      project_id: data.project_id,
      title: data.title || 'Relatório de Inteligência Competitiva',
      niche_name: data.niche_name || 'Geral',
      period_start: data.period_start || new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10),
      period_end: data.period_end || new Date().toISOString().slice(0, 10),
      ads_count: data.ads_count || 0,
      competitors_analyzed: data.competitors_analyzed || [],
      summary: data.summary || '',
      trends_identified: data.trends_identified || [],
      strategic_recommendations: data.strategic_recommendations || [],
      disclaimer: data.disclaimer || 'Relatório gerado estritamente a partir de sinais observáveis na Biblioteca da Meta. Não inventa métricas de vendas, faturamento ou ROAS.',
      created_at: new Date().toISOString(),
    };

    this.state.reports.unshift(report);
    this.saveToDisk(this.state);
    return report;
  }

  // Reset e Seed de Demonstração
  public resetDemoData(): void {
    // Remove apenas dados de demonstração
    this.state.ads = this.state.ads.filter(a => !a.is_demo);
    this.state.projects = this.state.projects.filter(p => !p.id.startsWith('proj-'));
    this.state.advertisers = this.state.advertisers.filter(adv => !adv.id.startsWith('adv-'));
    this.state.collectionItems = this.state.collectionItems.filter(ci => !ci.id.startsWith('item-'));
    this.updateAdvertiserMetrics();
    this.saveToDisk(this.state);
  }

  public seedDemoData(): void {
    // Recarrega os dados padrão
    this.resetDemoData();
    this.state.niches = [...INITIAL_NICHES];
    this.state.projects.push(...INITIAL_PROJECTS);
    this.state.advertisers.push(...INITIAL_ADVERTISERS);
    this.state.ads.push(...INITIAL_ADS);
    this.updateAdvertiserMetrics();
    this.saveToDisk(this.state);
  }

  // Estatísticas Gerais para o Dashboard
  public getDashboardStats() {
    const totalAds = this.state.ads.length;
    const activeAds = this.state.ads.filter(a => a.status_observed === 'active').length;
    const totalAdvertisers = this.state.advertisers.length;
    const totalProjects = this.state.projects.length;

    // Formatos mais frequentes
    const formatCounts: Record<string, number> = {};
    this.state.ads.forEach(a => {
      formatCounts[a.format] = (formatCounts[a.format] || 0) + 1;
    });

    // Média de longevidade observada
    const totalDays = this.state.ads.reduce((acc, a) => acc + a.days_active_observed, 0);
    const avgLongevity = totalAds > 0 ? Math.round(totalDays / totalAds) : 0;

    // Top longevidade
    const topLongevityAds = [...this.state.ads]
      .sort((a, b) => b.days_active_observed - a.days_active_observed)
      .slice(0, 5);

    // Média ISC
    const totalISC = this.state.ads.reduce((acc, a) => acc + a.isc_score, 0);
    const avgISC = totalAds > 0 ? Math.round(totalISC / totalAds) : 0;

    // Distribuição por Nicho
    const nicheDistribution: Record<string, number> = {};
    this.state.ads.forEach(a => {
      const n = a.niche_name || 'Outros';
      nicheDistribution[n] = (nicheDistribution[n] || 0) + 1;
    });

    return {
      totalAds,
      activeAds,
      totalAdvertisers,
      totalProjects,
      avgLongevity,
      avgISC,
      formatCounts,
      topLongevityAds,
      nicheDistribution,
    };
  }
}
