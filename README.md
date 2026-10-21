# STARDUX AD INTELLIGENCE ⚡

Plataforma profissional de inteligência competitiva em publicidade digital da **Agência Stardux**.

Reúne informações publicamente acessíveis da Biblioteca de Anúncios da Meta e importações de dados autorizadas em uma interface SaaS moderna, permitindo analisar concorrentes, identificar padrões criativos duradouros e gerar relatórios estratégicos para clientes.

---

## 💎 PRINCIPAIS RECURSOS

1. **Dashboard Geral de Inteligência (`/dashboard`)**:
   - KPIs de anúncios monitorados, taxa de anúncios ativos, concorrentes e longevidade média observada.
   - Gráficos dinâmicos com **Recharts** (formatos de criativos e distribuição por nichos de mercado).
   - Ranking de anúncios com maior longevidade no ar.

2. **Explorar Anúncios (`/explorar`)**:
   - Barra de busca destacada: *"Descubra o que os anunciantes do seu mercado estão fazendo."*
   - Filtros instantâneos por nicho, formato (vídeo, imagem, carrossel), plataforma (Facebook, Instagram) e longevidade (&gt;15d, &gt;30d, &gt;60d, &gt;90d).
   - Alternância entre visualização em **Grade de Cartões** e **Tabela**.
   - Selo interativo com o **Índice de Sinais Criativos (ISC)**.

3. **Detalhes do Anúncio & 10 Dimensões Estratégicas (`/anuncio/[id]`)**:
   - Visualização do criativo, cópia completa, headline, CTA e link direto para a Biblioteca oficial da Meta.
   - Decomposição em **10 dimensões analíticas**: Gancho (Hook), Estrutura de copy, Problema abordado, Desejo explorado, Mecanismo de oferta, Público inferido, Prova social, Objeções trabalhadas, Estilo criativo e Hipóteses de longevidade.
   - Botão para copiar texto com 1 clique e salvar em coleções.

4. **Análise de Concorrentes & Benchmarking (`/concorrentes`)**:
   - Cadastro de concorrentes em projetos de pesquisa.
   - Seleção múltipla para **comparativo direto lado a lado** (mix de formatos, longevidade máxima, média de ISC e criativos âncora).

5. **Analista Criativo com Inteligência Artificial (`/ia-analista`)**:
   - Perguntas estratégicas em linguagem natural (ex: *"Quais os ganchos mais usados nas imobiliárias?"*, *"Quais ofertas aparecem com maior frequência?"*).
   - **Controle de Custos Inteligente**: Integração com **Google Gemini 1.5 Flash** quando a chave for configurada, e **Motor Heurístico Offline nativo** quando não houver chave (custo zero).

6. **Biblioteca & Favoritos (`/biblioteca`)**:
   - Organização de referências em pastas/coleções temáticas.
   - Inclusão de notas pessoais de copywriters e etiquetas (`#tags`).
   - Exportação em CSV.

7. **Relatórios Estratégicos Executivos (`/relatorios`)**:
   - Documento profissional formatado para envio a clientes da Stardux.
   - Resumo executivo, tendências mapeadas na amostra e recomendações práticas para testes.
   - Botão de **Imprimir / Salvar em PDF** otimizado para navegadores via CSS print.

8. **Conectores & Provedores de Dados (`/integracoes`)**:
   - Arquitetura *Data Providers* suportando a API oficial da Meta, importação manual/CSV e futura integração com n8n webhooks.

---

## 🛡️ DIRETRIZ DE TRANSPARÊNCIA DOS DADOS

A plataforma segue rigorosamente o princípio de **não inventar nem prometer dados que a Meta não fornece publicamente**:
- A Biblioteca da Meta **não disponibiliza** faturamento, ROAS, CPA, CPL ou volume de vendas para anúncios comerciais comuns no Brasil.
- A classificação do sistema é baseada estritamente no **Índice de Sinais Criativos (ISC)** e na **Longevidade Observada** (tempo contínuo de veiculação e recorrência de criativo).
- Pontuações altas indicam maior probabilidade técnica de sustentação do anúncio pelo concorrente, **sem nunca inventar estimativas financeiras**.

---

## 🛠️ TECNOLOGIAS UTILIZADAS

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Recharts.
- **Backend**: Next.js Route Handlers e validação com Zod.
- **Processamento de Dados**: PapaParse (CSV parser e exporter).
- **Persistência**: Arquitetura híbrida com **banco local persistente em disco** (`.stardux-data/stardux-db.json`) e suporte completo a **Supabase PostgreSQL** via migrations com Row Level Security (RLS).
- **Inteligência Artificial**: Google Gemini API com fallback inteligente para Analista Heurístico Offline.
- **Testes**: Node.js Native Test Runner com `tsx` (TypeScript executor).

---

## 🚀 COMO EXECUTAR LOCALMENTE

### 1. Pré-requisitos
- Node.js versão 18+ (recomendado Node.js 20 ou 24).
- npm versão 9+.

### 2. Instalação e Execução

O projeto já está configurado para **funcionar imediatamente com persistência local sem exigir contas em serviços pagos**:

```bash
# Entrar no diretório do projeto
cd "ferramenta ads"

# O arquivo de ambiente já está criado (.env.local com STORAGE_MODE="local")
# Para rodar em modo desenvolvimento:
npm run dev
```

Acesse no navegador:
👉 **`http://localhost:3000`**

### 3. Executando os Testes Automatizados

```bash
npm test
```
*Executa os testes unitários do cálculo do ISC, validador de CSV e motor analítico heurístico.*

### 4. Build de Produção

```bash
npm run build
npm run start
```

---

## 📁 ESTRUTURA DO PROJETO

```
ferramenta ads/
├── .env.example                               # Exemplo documentado de variáveis
├── IMPLEMENTATION_STATUS.md                   # Relatório de status funcional
├── public/
│   └── templates/
│       └── modelo-importacao-anuncios.csv     # Modelo oficial para importação
├── supabase/
│   └── migrations/
│       └── 20261020_init_stardux.sql          # Migrations com 17 tabelas e RLS
├── src/
│   ├── app/
│   │   ├── dashboard/page.tsx                 # Tela 1 — Dashboard
│   │   ├── explorar/page.tsx                  # Tela 2 — Explorar anúncios
│   │   ├── anuncio/[id]/page.tsx              # Tela 3 — Detalhes do anúncio
│   │   ├── concorrentes/page.tsx              # Tela 4 — Concorrentes
│   │   ├── ia-analista/page.tsx               # Tela 5 — Analista IA
│   │   ├── biblioteca/page.tsx                # Tela 6 — Biblioteca
│   │   ├── relatorios/page.tsx                # Tela 7 — Relatórios
│   │   ├── configuracoes/page.tsx             # Tela 8 — Configurações
│   │   ├── integracoes/page.tsx               # Conectores & Fontes
│   │   └── api/                               # 14 Route Handlers da API
│   ├── components/
│   │   ├── layout/ (Sidebar, Topbar, Shell)
│   │   ├── ads/ (AdCard, AdFilters, AdDetailModal, ISCBreadownModal, ImportCsvModal, CreateAdModal)
│   │   └── collections/ (SaveToCollectionModal)
│   └── lib/
│       ├── types.ts                           # Tipos e interfaces de domínio
│       ├── isc.ts & isc.test.ts               # Cálculo explicável do ISC
│       ├── csv-parser.ts & csv-parser.test.ts # Parser e validador de planilhas
│       ├── heuristic-analyzer.ts & test.ts    # Motor de análise criativa
│       ├── gemini.ts                          # Wrapper seguro da Gemini API
│       ├── storage/db.ts                      # Repositório com persistência em disco
│       └── providers/                         # Data Providers (Meta API, CSV, etc.)
```

---

## 📊 MODELO DE IMPORTAÇÃO CSV

O arquivo padrão para importação de anúncios pode ser baixado diretamente pelo aplicativo ou em:
`public/templates/modelo-importacao-anuncios.csv`

Campos suportados:
- `external_id`: Identificador original da Meta (ex: `10293847501`)
- `advertiser_name`: Nome da marca anunciante (obrigatório)
- `headline`: Título do anúncio
- `body_text`: Texto persuasivo / copy do anúncio
- `format`: `video`, `image` ou `carousel`
- `platforms`: `facebook`, `instagram` ou ambos
- `started_at`: Data de início da veiculação observada (`AAAA-MM-DD`)
- `original_url`: Link na Biblioteca de Anúncios da Meta
- `media_url`: URL de visualização da imagem ou thumbnail do vídeo
- `cta_text`: Texto da chamada para ação (ex: `Saiba mais`, `Fale conosco`)

---

## 🗄️ CONFIGURAÇÃO DO SUPABASE (PRODUÇÃO)

Para implantar na nuvem utilizando o Supabase como banco de dados:

1. Crie um projeto no [Supabase](https://supabase.com).
2. Acesse o **SQL Editor** do projeto no painel do Supabase.
3. Copie e execute o conteúdo do arquivo `supabase/migrations/20261020_init_stardux.sql`.
4. Obtenha as chaves em **Project Settings &gt; API**.
5. No arquivo `.env.local`, defina:
   ```env
   STORAGE_MODE="supabase"
   NEXT_PUBLIC_SUPABASE_URL="https://seu-projeto.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="sua-chave-anon"
   SUPABASE_SERVICE_ROLE_KEY="sua-chave-service-role"
   ```

---

## 🚀 INSTRUÇÕES DE DEPLOY

### Deploy na Vercel
1. Conecte o repositório no dashboard da Vercel.
2. Nas variáveis de ambiente do projeto na Vercel, insira as chaves do seu arquivo `.env.local`.
3. O build command padrão `npm run build` compilará todas as páginas automaticamente.

---

© 2026 **Stardux Ad Intelligence** — Todos os direitos reservados.
