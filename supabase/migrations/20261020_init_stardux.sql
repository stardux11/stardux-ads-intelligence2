-- ==============================================================================
-- STARDUX AD INTELLIGENCE — SUPABASE SCHEMA MIGRATION
-- Data: 2026-10-20
-- Descrição: Estrutura completa de tabelas normalizadas, índices e RLS
-- Multi-tenant com suporte a Organizações, Projetos, Anúncios e Observações
-- ==============================================================================

-- 1. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABELA DE ORGANIZAÇÕES
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'agency_pro',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERFIS DE USUÁRIOS (vinculados ao auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MEMBROS DA ORGANIZAÇÃO
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- 5. NICHOS DE MERCADO
CREATE TABLE IF NOT EXISTS public.niches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    is_global BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PROJETOS DE PESQUISA
CREATE TABLE IF NOT EXISTS public.research_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    niche_id UUID REFERENCES public.niches(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ANUNCIANTES / CONCORRENTES
CREATE TABLE IF NOT EXISTS public.advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE SET NULL,
    niche_id UUID REFERENCES public.niches(id) ON DELETE SET NULL,
    page_id VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    website_url TEXT,
    facebook_page_url TEXT,
    instagram_handle VARCHAR(100),
    country VARCHAR(10) DEFAULT 'BR',
    is_competitor BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ANÚNCIOS (Registro mestre e atual)
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    advertiser_id UUID NOT NULL REFERENCES public.advertisers(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE SET NULL,
    niche_id UUID REFERENCES public.niches(id) ON DELETE SET NULL,
    external_id VARCHAR(255),
    original_url TEXT,
    source VARCHAR(50) DEFAULT 'manual_import' CHECK (source IN ('meta_api', 'manual_import', 'csv_import', 'authorized_partner')),
    country VARCHAR(10) DEFAULT 'BR',
    platforms TEXT[] DEFAULT ARRAY['facebook', 'instagram'],
    format VARCHAR(50) DEFAULT 'image' CHECK (format IN ('image', 'video', 'carousel', 'story_reels', 'unknown')),
    status_observed VARCHAR(50) DEFAULT 'active' CHECK (status_observed IN ('active', 'inactive', 'unverified')),
    
    -- Datas observadas (Não inventadas)
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ DEFAULT NOW(),
    days_active_observed INT DEFAULT 1,
    
    -- Conteúdo do Anúncio
    headline TEXT,
    body_text TEXT,
    description TEXT,
    cta_text VARCHAR(100),
    cta_type VARCHAR(50),
    destination_url TEXT,
    media_url TEXT,
    thumbnail_url TEXT,
    
    -- Índice de Sinais Criativos (ISC) - Calculado
    isc_score NUMERIC(5,2) DEFAULT 0.0,
    isc_breakdown JSONB DEFAULT '{}'::jsonb,
    
    -- Metadados de confiabilidade e integridade
    is_demo BOOLEAN DEFAULT FALSE,
    data_confidence VARCHAR(50) DEFAULT 'verified_source',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. HISTÓRICO DE OBSERVAÇÕES SUCESSIVAS (Evita sobrescrever verificações)
CREATE TABLE IF NOT EXISTS public.ad_observations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
    observed_at TIMESTAMPTZ DEFAULT NOW(),
    status_observed VARCHAR(50) NOT NULL,
    source VARCHAR(50) NOT NULL,
    raw_payload JSONB,
    notes TEXT
);

-- 10. CRIATIVOS E MÍDIAS ASSOCIADAS
CREATE TABLE IF NOT EXISTS public.ad_creatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
    media_type VARCHAR(50) NOT NULL CHECK (media_type IN ('image', 'video', 'carousel_card')),
    media_url TEXT,
    storage_path TEXT,
    aspect_ratio VARCHAR(20),
    duration_seconds INT,
    authorized_for_download BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. VARIAÇÕES CRIATIVAS
CREATE TABLE IF NOT EXISTS public.creative_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
    variant_type VARCHAR(50) NOT NULL CHECK (variant_type IN ('copy', 'headline', 'media', 'cta')),
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. COLEÇÕES / PASTAS DE FAVORITOS
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(30) DEFAULT '#10b981',
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ITENS DE COLEÇÃO (Mapeamento Anúncio -> Coleção com notas)
CREATE TABLE IF NOT EXISTS public.collection_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
    personal_notes TEXT,
    tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(collection_id, ad_id)
);

-- 14. ANÁLISES DE INTELIGÊNCIA ARTIFICIAL
CREATE TABLE IF NOT EXISTS public.ai_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    ad_id UUID REFERENCES public.ads(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    advertiser_id UUID REFERENCES public.advertisers(id) ON DELETE CASCADE,
    niche_id UUID REFERENCES public.niches(id) ON DELETE SET NULL,
    
    analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('single_ad', 'competitor_benchmark', 'niche_overview', 'strategic_query')),
    model_used VARCHAR(100) DEFAULT 'gemini-1.5-flash',
    prompt_tokens INT DEFAULT 0,
    completion_tokens INT DEFAULT 0,
    estimated_cost_usd NUMERIC(8,5) DEFAULT 0.0,
    
    executive_summary TEXT,
    hook_analysis TEXT,
    copy_structure TEXT,
    problem_addressed TEXT,
    desire_explored TEXT,
    offer_analysis TEXT,
    audience_inferred TEXT,
    social_proof TEXT,
    objections_handled TEXT,
    creative_style TEXT,
    longevity_hypotheses TEXT,
    recommendations JSONB DEFAULT '[]'::jsonb,
    full_output JSONB DEFAULT '{}'::jsonb,
    is_cached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. RELATÓRIOS ESTRATÉGICOS
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    niche_name VARCHAR(100),
    period_start DATE,
    period_end DATE,
    ads_count INT DEFAULT 0,
    competitors_analyzed TEXT[],
    summary TEXT,
    trends_identified JSONB DEFAULT '[]'::jsonb,
    strategic_recommendations JSONB DEFAULT '[]'::jsonb,
    disclaimer TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. JOBS DE IMPORTAÇÃO (Histórico e Auditoria de CSV / JSON)
CREATE TABLE IF NOT EXISTS public.import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    filename VARCHAR(255),
    total_rows INT DEFAULT 0,
    successful_rows INT DEFAULT 0,
    failed_rows INT DEFAULT 0,
    errors_log JSONB DEFAULT '[]'::jsonb,
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. CONECTORES E INTEGRAÇÕES EXTERNAS
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    provider_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    auth_status VARCHAR(50) DEFAULT 'unconfigured' CHECK (auth_status IN ('unconfigured', 'connected', 'invalid_token', 'rate_limited', 'error')),
    credentials_encrypted JSONB DEFAULT '{}'::jsonb,
    last_sync_at TIMESTAMPTZ,
    last_error TEXT,
    sync_frequency VARCHAR(50) DEFAULT 'manual',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. LOGS DE AUDITORIA E ATIVIDADES
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ÍNDICES DE PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_ads_org_status ON public.ads(organization_id, status_observed);
CREATE INDEX IF NOT EXISTS idx_ads_advertiser ON public.ads(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_ads_days_active ON public.ads(days_active_observed DESC);
CREATE INDEX IF NOT EXISTS idx_ads_isc_score ON public.ads(isc_score DESC);
CREATE INDEX IF NOT EXISTS idx_ads_started_at ON public.ads(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_advertisers_org ON public.advertisers(organization_id);
CREATE INDEX IF NOT EXISTS idx_research_projects_org ON public.research_projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_collection_items_coll ON public.collection_items(collection_id);
CREATE INDEX IF NOT EXISTS idx_observations_ad ON public.ad_observations(ad_id, observed_at DESC);

-- ==============================================================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- Garante isolamento estrito entre organizações
-- ==============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Exemplo de política padrão de isolamento por organização
CREATE POLICY "Users can access their organization's ads"
ON public.ads
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can access their organization's projects"
ON public.research_projects
FOR ALL
USING (
    organization_id IN (
        SELECT organization_id FROM public.organization_members
        WHERE user_id = auth.uid()
    )
);
