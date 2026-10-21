import { Ad, AIAnalysis } from './types';

export function analyzeAdCreatively(ad: Ad): Omit<AIAnalysis, 'id' | 'created_at'> {
  const headline = ad.headline || '';
  const body = ad.body_text || '';
  const fullText = `${headline}\n${body}`.toLowerCase();
  const daysActive = ad.days_active_observed || 1;

  // 1. Gancho (Hook)
  let hook = 'Gancho direto focado em benefício imediato.';
  const firstSentence = (body.split(/[.\n!?]/)[0] || headline).trim();
  if (firstSentence) {
    if (firstSentence.includes('?')) {
      hook = `Pergunta reflexiva direcionada: "${firstSentence}"`;
    } else if (firstSentence.match(/\b(como|descubra|conheça|chega de|pare de|adeus|veja)\b/i)) {
      hook = `Gancho de curiosidade ou comando de ação: "${firstSentence}"`;
    } else {
      hook = `Declaração afirmativa de posicionamento: "${firstSentence}"`;
    }
  }

  // 2. Estrutura de Copy
  const hasQuestion = fullText.includes('?');
  const hasBullets = body.includes('•') || body.includes('- ') || body.includes('1.') || body.includes('✔');
  let copyStructure = 'Estrutura linear tradicional (Apresentação -> Benefício -> CTA).';
  if (hasQuestion && hasBullets) {
    copyStructure = 'Estrutura PAS/AIDA (Pergunta de identificação da dor -> Lista de benefícios claros -> Chamada para ação).';
  } else if (body.length > 300) {
    copyStructure = 'Storytelling ou Copy Longa (Contextualização detalhada, quebra de objeções e contextualização de autoridade).';
  } else if (body.length < 120) {
    copyStructure = 'Copy Curta e Objetiva (Foco em clique rápido e curiosidade para a página de destino).';
  }

  // 3. Problema Abordado
  let problem = 'Dificuldade de encontrar opções confiáveis no mercado.';
  if (fullText.match(/\b(dor|perda|caro|tempo|demora|difícil|complicado|sofrer|problema|inseguran|medo|custo)\b/)) {
    problem = 'Identificação de atritos comuns: perda de tempo, custos excessivos ou frustração com soluções convencionais.';
  } else if (fullText.match(/\b(dente|sorriso|metálico|aparelho)\b/)) {
    problem = 'Desconforto estético e funcional com tratamentos odontológicos convencionais (ex: aparelhos metálicos visíveis).';
  } else if (fullText.match(/\b(imóvel|apartamento|jardins|espaço|planta)\b/)) {
    problem = 'Falta de opções que combinem localização nobre, segurança patrimonial e qualidade de vida.';
  } else if (fullText.match(/\b(tribut|imposto|crédito|fiscal)\b/)) {
    problem = 'Complexidade tributária e risco de pagar tributos a mais sem o devido aproveitamento fiscal.';
  }

  // 4. Desejo Explorado
  let desire = 'Melhoria de qualidade de vida e segurança na tomada de decisão.';
  if (fullText.match(/\b(alto padrão|luxo|exclusiv|sofistica|resort|vista|nobre)\b/)) {
    desire = 'Status, exclusividade e conforto familiar em padrão premium.';
  } else if (fullText.match(/\b(rápido|em \d+ meses|ágil|imediato|72 horas)\b/)) {
    desire = 'Velocidade de transformação e resultados tangíveis em curto prazo.';
  } else if (fullText.match(/\b(grátis|desconto|cupom|sem custo|economia|frete grátis)\b/)) {
    desire = 'Vantagem financeira imediata, sensação de oportunidade e redução de risco financeiro.';
  }

  // 5. Oferta e Condições
  let offer = 'Apresentação institucional com chamada para conhecimento de produto/serviço.';
  if (fullText.match(/\b(gratuito|sem custo|diagnóstico gratuito|avaliação|amostra)\b/)) {
    offer = 'Lead magnet de entrada sem fricção: avaliação / diagnóstico sem custo inicial.';
  } else if (fullText.match(/\b(cupom|desconto|off|%|condições especiais|pré-lançamento)\b/)) {
    offer = 'Oferta de oportunidade ou pré-lançamento com incentivo de urgência/escassez.';
  } else if (fullText.match(/\b(parcelas|financiamento|entrada)\b/)) {
    offer = 'Facilitação de fluxo financeiro e formas flexíveis de pagamento.';
  }

  // 6. Público-Alvo Inferido
  let audience = 'Consumidores e tomadores de decisão qualificados pelo nicho de atuação.';
  if (fullText.match(/\b(empresa|lucro real|b2b|gestor|faturamento|crédito tributário)\b/)) {
    audience = 'CEOs, diretores financeiros e gestores de médias/grandes empresas.';
  } else if (fullText.match(/\b(alto padrão|jardins|ibirapuera|suítes|resort)\b/)) {
    audience = 'Famílias de alta renda, investidores imobiliários e compradores classe A/B+.';
  } else if (fullText.match(/\b(alinhador|sorriso|estética|discreto)\b/)) {
    audience = 'Adultos e jovens profissionais que valorizam estética discreta e bem-estar.';
  } else if (fullText.match(/\b(linho|alfaiataria|coleção|moda|look)\b/)) {
    audience = 'Mulheres com interesse em moda autoral elegante e caimento de alto padrão.';
  }

  // 7. Prova Social
  let socialProof = 'Autoridade implícita pela clareza da proposta e presença profissional.';
  if (fullText.match(/\b(\d+ anos|\d+ clientes|depoimentos|premiado|reconhecido|referência)\b/)) {
    socialProof = 'Menção a tempo de mercado, volume atendido ou reconhecimento de marca.';
  } else if (fullText.match(/\b(avaliação 3d|escaneamento|tecnologia)\b/)) {
    socialProof = 'Prova técnica e tecnológica: demonstração de precisão e processos científicos.';
  }

  // 8. Objeções Trabalhadas
  let objections = 'Redução de incerteza através de explicação objetiva do próximo passo.';
  if (fullText.match(/\b(sem dor|removível|confortável)\b/)) {
    objections = 'Quebra de objeção quanto a dor, desconforto e restrições na rotina.';
  } else if (fullText.match(/\b(sem custo inicial|garantia|segurança)\b/)) {
    objections = 'Quebra de risco financeiro percebido com garantia ou diagnóstico preliminar.';
  } else if (fullText.match(/\b(poucas unidades|estoque limitado|lote)\b/)) {
    objections = 'Combate a procrastinação gerando gatilho de escassez legítima de unidades.';
  }

  // 9. Estilo Criativo
  let creativeStyle = `Formato ${ad.format.toUpperCase()} com tom comercial consultivo.`;
  if (ad.format === 'video') {
    creativeStyle = 'Vídeo dinâmico: ideal para retenção nos primeiros 3 segundos e demonstração visual de produto.';
  } else if (ad.format === 'carousel') {
    creativeStyle = 'Carrossel educativo/expositivo: estimula interação sequencial deslizando entre benefícios ou produtos.';
  } else {
    creativeStyle = 'Imagem estática de alto contraste: mensagem rápida para consumo veloz no feed.';
  }

  // 10. Hipóteses de Longevidade
  let longevityHypotheses = `Com ${daysActive} dias de veiculação observados, o anúncio demonstra estabilidade de entrega no público-alvo. Possíveis fatores de sustentação: alinhamento claro entre gancho inicial e promessa, ausência de fadiga criativa ou atualização frequente de públicos na plataforma.`;
  if (daysActive > 60) {
    longevityHypotheses = `Longevidade alta (${daysActive} dias). Sinais técnicos sugerem que este criativo atua como peça âncora da conta: mensagem consolidada, apelo constante a dores universais do nicho e boa taxa de engajamento que mantém o custo de entrega aceitável para o anunciante.`;
  }

  const recommendations = [
    `Testar variação em formato ${ad.format === 'video' ? 'carrossel' : 'vídeo'} mantendo a mesma promessa central.`,
    `Explorar novos ganchos iniciais nos primeiros 10 segundos/primeira linha, preservando a oferta atual.`,
    `Avaliar inclusão de elementos explícitos de prova social (dados de clientes ou depoimentos em vídeo).`,
  ];

  return {
    organization_id: ad.organization_id,
    ad_id: ad.id,
    analysis_type: 'single_ad',
    model_used: 'Stardux Heuristic Engine v1 (Offline)',
    prompt_tokens: 0,
    completion_tokens: 0,
    estimated_cost_usd: 0.0,
    is_offline_heuristic: true,
    executive_summary: `Análise estrutural baseada em sinais observáveis da peça publicitária de "${ad.advertiser_name}", veiculada há ${daysActive} dias com classificação ISC ${ad.isc_score}/100.`,
    hook_analysis: hook,
    copy_structure: copyStructure,
    problem_addressed: problem,
    desire_explored: desire,
    offer_analysis: offer,
    audience_inferred: audience,
    social_proof: socialProof,
    objections_handled: objections,
    creative_style: creativeStyle,
    longevity_hypotheses: longevityHypotheses,
    recommendations,
    supported_ad_ids: [ad.id],
  };
}
