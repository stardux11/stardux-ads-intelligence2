import { Ad, AIAnalysis } from './types';
import { analyzeAdCreatively } from './heuristic-analyzer';

export interface AnalysisRequest {
  ad?: Ad;
  ads?: Ad[];
  query?: string;
  projectContext?: {
    projectName: string;
    niche: string;
    competitors: string[];
  };
}

// Cache simples em memória por chave
const analysisCache = new Map<string, AIAnalysis>();

export async function runCreativeAIAnalysis(req: AnalysisRequest): Promise<AIAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  
  // Se for análise de anúncio único e não houver chave Gemini, usa o analisador heurístico
  if (!apiKey && req.ad) {
    const heuristic = analyzeAdCreatively(req.ad);
    const result: AIAnalysis = {
      ...heuristic,
      id: `analysis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };
    return result;
  }

  // Chave de cache
  const cacheKey = req.ad
    ? `ad-${req.ad.id}-${req.ad.updated_at}`
    : `query-${req.projectContext?.projectName}-${req.query}-${req.ads?.length || 0}`;

  if (analysisCache.has(cacheKey)) {
    const cached = analysisCache.get(cacheKey)!;
    return { ...cached, is_cached: true };
  }

  // Se houver Gemini API Key configurada no servidor, faz a requisição à API oficial do Google Gemini
  if (apiKey) {
    try {
      const prompt = buildGeminiPrompt(req);
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1200,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const usage = data.usageMetadata || {};
        const promptTokens = usage.promptTokenCount || 400;
        const completionTokens = usage.candidatesTokenCount || 600;
        // Custo estimado gemini-1.5-flash: ~$0.075 / 1M input, ~$0.30 / 1M output
        const estimatedCost = (promptTokens * 0.000000075) + (completionTokens * 0.0000003);

        let parsedJson: any = {};
        try {
          parsedJson = JSON.parse(candidateText);
        } catch {
          // fallback se não parsear JSON estrito
        }

        const result: AIAnalysis = {
          id: `analysis-${Date.now()}`,
          organization_id: req.ad?.organization_id || 'org-default',
          ad_id: req.ad?.id,
          project_id: req.ad?.project_id,
          advertiser_id: req.ad?.advertiser_id,
          niche_name: req.projectContext?.niche || req.ad?.niche_name,
          analysis_type: req.ad ? 'single_ad' : 'strategic_query',
          model_used: 'Google Gemini 1.5 Flash (API Oficial)',
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          estimated_cost_usd: Number(estimatedCost.toFixed(6)),
          is_offline_heuristic: false,
          executive_summary: parsedJson.executive_summary || 'Análise executiva gerada via Gemini API.',
          hook_analysis: parsedJson.hook_analysis || 'Ganchos identificados nos anúncios.',
          copy_structure: parsedJson.copy_structure || 'Estrutura persuasiva predominante.',
          problem_addressed: parsedJson.problem_addressed || 'Dores e problemas mapeados.',
          desire_explored: parsedJson.desire_explored || 'Desejos e aspirações trabalhadas.',
          offer_analysis: parsedJson.offer_analysis || 'Mecanismos de oferta e CTAs.',
          audience_inferred: parsedJson.audience_inferred || 'Perfil de público-alvo inferido.',
          social_proof: parsedJson.social_proof || 'Provas sociais e elementos de autoridade.',
          objections_handled: parsedJson.objections_handled || 'Quebra de objeções mapeadas.',
          creative_style: parsedJson.creative_style || 'Padrões estéticos e de formato.',
          longevity_hypotheses: parsedJson.longevity_hypotheses || 'Hipóteses de continuidade de veiculação.',
          recommendations: Array.isArray(parsedJson.recommendations) ? parsedJson.recommendations : [
            'Desenvolver testes com variações de ganchos em formato de pergunta.',
            'Testar novos formatos preservando a mesma promessa central.',
            'Adicionar prova social quantificável no criativo.',
          ],
          supported_ad_ids: req.ads?.map(a => a.id).slice(0, 5) || (req.ad ? [req.ad.id] : []),
          created_at: new Date().toISOString(),
        };

        analysisCache.set(cacheKey, result);
        return result;
      }
    } catch (err) {
      console.error('Erro ao conectar na Gemini API, utilizando fallback heurístico:', err);
    }
  }

  // Fallback se não houver chave ou falhar a API para consultas livres / múltiplos anúncios
  const adsToAnalyze = req.ads || (req.ad ? [req.ad] : []);
  const sampleAd = adsToAnalyze[0];
  const totalDays = adsToAnalyze.reduce((acc, a) => acc + (a.days_active_observed || 1), 0);
  const avgDays = adsToAnalyze.length > 0 ? Math.round(totalDays / adsToAnalyze.length) : 30;

  const result: AIAnalysis = {
    id: `analysis-heuristic-${Date.now()}`,
    organization_id: sampleAd?.organization_id || 'org-default',
    ad_id: sampleAd?.id,
    project_id: sampleAd?.project_id,
    advertiser_id: sampleAd?.advertiser_id,
    niche_name: req.projectContext?.niche || sampleAd?.niche_name || 'Geral',
    analysis_type: req.query ? 'strategic_query' : 'competitor_benchmark',
    model_used: 'Stardux Heuristic Engine v1 (Offline - Sem Custo)',
    prompt_tokens: 0,
    completion_tokens: 0,
    estimated_cost_usd: 0.0,
    is_offline_heuristic: true,
    executive_summary: req.query
      ? `Resposta à pergunta: "${req.query}". Baseada na observação de ${adsToAnalyze.length} anúncios do mercado com longevidade média de ${avgDays} dias.`
      : `Análise comparativa de ${adsToAnalyze.length} anúncios do nicho "${req.projectContext?.niche || 'Geral'}" com longevidade média de ${avgDays} dias observados.`,
    hook_analysis: `Predomínio de ganchos de pergunta ("Deseja...", "Procura...") e ganchos de autoridade nos primeiros 3 segundos de vídeo ou na primeira frase do texto.`,
    copy_structure: `Estrutura frequente: Gancho provocador -> Apresentação do diferencial técnico -> Condição facilitada -> CTA direto para WhatsApp ou página de captura.`,
    problem_addressed: `Resolução de fricções imediatas do cliente: tempo de resposta, garantia de qualidade e eliminação de burocracias.`,
    desire_explored: `Busca por status, valorização patrimonial e economia com ofertas claras e palpáveis.`,
    offer_analysis: `Ofertas estruturadas em pré-lançamentos, avaliações sem custo inicial ou frete/condições facilitadas para reduzir barreiras de entrada.`,
    audience_inferred: `Público segmentado geograficamente e por interesse qualificado no nicho.`,
    social_proof: `Utilização de números de atendimentos, registros profissionais e depoimentos rápidos.`,
    objections_handled: `Mitigação de dúvidas sobre segurança, prazos de entrega e custos ocultos.`,
    creative_style: `Mix balanceado entre vídeos dinâmicos de 15 a 30 segundos e imagens estáticas de alto contraste com títulos em destaque.`,
    longevity_hypotheses: `Os anúncios mantidos por mais de 30 dias revelam equilíbrio entre taxa de cliques e retenção de público, servindo como pilares de atração contínua.`,
    recommendations: [
      'Criar variações com gancho de quebra de padrão nos primeiros 3 segundos.',
      'Testar criativo em carrossel mostrando o processo passo a passo.',
      'Incluir chamada de ação específica mencionando o benefício direto do clique.',
    ],
    supported_ad_ids: adsToAnalyze.map(a => a.id).slice(0, 5),
    created_at: new Date().toISOString(),
  };

  analysisCache.set(cacheKey, result);
  return result;
}

function buildGeminiPrompt(req: AnalysisRequest): string {
  const adsInfo = (req.ads || (req.ad ? [req.ad] : [])).map(a => ({
    id: a.id,
    advertiser: a.advertiser_name,
    headline: a.headline,
    body: a.body_text,
    format: a.format,
    days_active: a.days_active_observed,
    isc_score: a.isc_score,
    cta: a.cta_text,
  }));

  return `Você é o Analista Criativo de Marketing da Stardux Ad Intelligence.
Analise os anúncios fornecidos abaixo provenientes da Biblioteca de Anúncios da Meta.
IMPORTANTE: Não invente faturamento, ROAS, CPA ou vendas reais (dados não fornecidos pela Meta no Brasil).
Baseie-se estritamente em sinais observáveis (dias ativos, cópia, ganchos, formato, CTAs).

Pergunta/Foco: ${req.query || 'Análise Estrutural Completa'}
Contexto: Projeto "${req.projectContext?.projectName || 'Geral'}", Nicho "${req.projectContext?.niche || 'Geral'}"

Anúncios Disponíveis (${adsInfo.length}):
${JSON.stringify(adsInfo, null, 2)}

Retorne APENAS um JSON no seguinte formato estrito:
{
  "executive_summary": "Resumo executivo em 2 a 3 frases",
  "hook_analysis": "Análise detalhada dos ganchos e primeiras frases",
  "copy_structure": "Estrutura das mensagens e cadência",
  "problem_addressed": "Dores e problemas abordados",
  "desire_explored": "Desejos e aspirações exploradas",
  "offer_analysis": "Ofertas, bônus e CTAs identificados",
  "audience_inferred": "Público-alvo inferido a partir da linguagem",
  "social_proof": "Provas sociais utilizadas",
  "objections_handled": "Objeções trabalhadas",
  "creative_style": "Estilo visual e formato criativo",
  "longevity_hypotheses": "Hipóteses técnicas de longevidade observada",
  "recommendations": ["Recomendação 1", "Recomendação 2", "Recomendação 3"]
}`;
}
