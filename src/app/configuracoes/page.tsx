'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Key,
  Database,
  Building2,
  Sparkles,
  ShieldCheck,
  Check,
  Trash2,
  RefreshCw,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Shell } from '@/components/layout/Shell';

export default function ConfiguracoesPage() {
  const [geminiKey, setGeminiKey] = useState('');
  const [metaToken, setMetaToken] = useState('');
  const [metaAppId, setMetaAppId] = useState('');
  const [metaAppSecret, setMetaAppSecret] = useState('');
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [adLibraryInfo, setAdLibraryInfo] = useState<any>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [hasConfiguredToken, setHasConfiguredToken] = useState(false);
  const [maskedToken, setMaskedToken] = useState('');

  const loadSettings = () => {
    setIsTesting(true);
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.metaAppId) setMetaAppId(data.metaAppId);
        if (data.tokenInfo) setTokenInfo(data.tokenInfo);
        if (data.adLibraryInfo) setAdLibraryInfo(data.adLibraryInfo);
        if (data.hasToken) setHasConfiguredToken(true);
        if (data.metaToken) setMaskedToken(data.metaToken);
      })
      .catch(() => {})
      .finally(() => setIsTesting(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveKeys = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metaAppId,
          metaAppSecret,
          metaToken,
          geminiKey,
        }),
      });
      const data = await res.json();
      setSavedSuccess(data.message || 'Configurações salvas permanentemente no sistema!');
      
      // Recarrega status
      const checkRes = await fetch('/api/settings');
      const checkData = await checkRes.json();
      if (checkData.tokenInfo) setTokenInfo(checkData.tokenInfo);

      setTimeout(() => setSavedSuccess(null), 4000);
    } catch {
      setSavedSuccess('Erro ao salvar as credenciais.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedDemo = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/demo-data/seed', { method: 'POST' });
      const data = await res.json();
      setSavedSuccess(data.message);
      setTimeout(() => setSavedSuccess(null), 3000);
    } catch {
      setSavedSuccess('Falha ao carregar dados demonstrativos.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleResetDemo = async () => {
    if (!confirm('Deseja realmente apagar os dados demonstrativos e começar com a base limpa?')) {
      return;
    }
    setIsResetting(true);
    try {
      const res = await fetch('/api/demo-data/reset', { method: 'POST' });
      const data = await res.json();
      setSavedSuccess(data.message);
      setTimeout(() => setSavedSuccess(null), 3000);
    } catch {
      setSavedSuccess('Falha ao limpar dados demonstrativos.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Shell>
      <div className="space-y-8 max-w-4xl">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Configurações da Plataforma
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gerenciamento de credenciais, inteligência artificial, organização e armazenamento de dados.
          </p>
        </div>

        {savedSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{savedSuccess}</span>
          </div>
        )}

        {/* 1. Organização & Perfil */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-4 h-4 text-emerald-500" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Organização & Workspace
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Nome da Agência
              </span>
              <input
                type="text"
                disabled
                value="Agência Stardux"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs"
              />
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Plano Atual
              </span>
              <input
                type="text"
                disabled
                value="Agency Enterprise (Ilimitado)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        {/* 2. Armazenamento e Banco de Dados */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Persistência & Banco de Dados
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
              Persistência Ativa (.stardux-data)
            </span>
          </div>

          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
            O sistema opera por padrão com persistência local em disco no diretório <code>.stardux-data/stardux-db.json</code>, mantendo todos os seus projetos, concorrentes e anúncios mesmo após reiniciar a máquina. Para produção na nuvem, adicione as credenciais do Supabase em <code>.env.local</code>.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={handleSeedDemo}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recarregar Dados Demonstrativos (5 Nichos)</span>
            </button>

            <button
              onClick={handleResetDemo}
              disabled={isResetting}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Limpar Dados de Demonstração</span>
            </button>

            <a
              href="/api/ads/export?format=json"
              download
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup Geral em JSON</span>
            </a>
          </div>
        </div>

        {/* 3. Credenciais e APIs */}
        <form onSubmit={handleSaveKeys} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Chaves de API & Conexão Meta Oficial
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadSettings}
                disabled={isTesting}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300 font-medium transition-colors"
                title="Executar teste ao vivo na Graph API e na Ad Library"
              >
                <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin text-emerald-500' : ''}`} />
                <span>{isTesting ? 'Testando...' : 'Testar Conexão'}</span>
              </button>

              {tokenInfo && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  tokenInfo.isValid 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                }`}>
                  {tokenInfo.isValid ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  <span>{tokenInfo.isValid ? 'Token Meta Válido' : 'Token Inválido'}</span>
                </span>
              )}
            </div>
          </div>

          {tokenInfo && (
            <div className="space-y-2">
              <div className={`p-3.5 rounded-xl border space-y-1.5 text-[11px] ${
                tokenInfo.isValid
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40'
                  : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-900/60'
              }`}>
                {tokenInfo.application && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">App Meta Conectado:</span>
                    <strong className="text-slate-900 dark:text-white font-mono">{tokenInfo.application} (ID: {tokenInfo.appId})</strong>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Validade do Token:</span>
                  <strong className={tokenInfo.isValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                    {tokenInfo.expiresAt}
                  </strong>
                </div>
                {tokenInfo.scopes && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Permissões do Token:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono text-[10px]">
                      {Array.isArray(tokenInfo.scopes) ? tokenInfo.scopes.join(', ') : tokenInfo.scopes}
                    </span>
                  </div>
                )}
                {tokenInfo.errorMessage && (
                  <p className="text-rose-600 dark:text-rose-400 font-medium pt-1 text-[10px]">
                    Detalhe: {tokenInfo.errorMessage}
                  </p>
                )}
              </div>

              {/* Status específico do endpoint Ad Library (/ads_archive) */}
              {adLibraryInfo && (
                <div className={`p-3.5 rounded-xl border text-[11px] space-y-2 ${
                  adLibraryInfo.hasAccess
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {adLibraryInfo.hasAccess ? (
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <p className="font-bold">
                        {adLibraryInfo.hasAccess
                          ? 'Endpoint Ad Library (/ads_archive): Liberado e Operacional'
                          : `Ad Library (/ads_archive): ${adLibraryInfo.title || 'Autorização Requerida'} (Subcódigo ${adLibraryInfo.subcode || adLibraryInfo.code || ''})`}
                      </p>
                      <p className="text-[11px] leading-relaxed opacity-90">
                        {adLibraryInfo.hasAccess
                          ? 'Seu token tem permissão completa para buscar anúncios na API da Biblioteca da Meta.'
                          : adLibraryInfo.userMsg || adLibraryInfo.message}
                      </p>
                      {!adLibraryInfo.hasAccess && (
                        <div className="mt-2 p-2.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40 text-[10px] space-y-1 text-slate-800 dark:text-slate-200">
                          <p className="font-semibold text-amber-900 dark:text-amber-300">Como resolver no Meta for Developers:</p>
                          <ol className="list-decimal list-inside space-y-0.5">
                            <li>Confirme sua identidade pessoal com documento em <a href="https://www.facebook.com/ID" target="_blank" rel="noreferrer" className="underline font-bold text-amber-800 dark:text-amber-300">facebook.com/ID</a></li>
                            <li>Acesse <a href="https://www.facebook.com/ads/library/api" target="_blank" rel="noreferrer" className="underline font-bold text-amber-800 dark:text-amber-300">facebook.com/ads/library/api</a> e vincule seu aplicativo</li>
                            <li>Dica: enquanto a Meta analisa a verificação, você pode usar normalmente a <strong>Importação Manual / CSV</strong> na aba Anúncios.</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Meta App ID
                </label>
                <input
                  type="text"
                  value={metaAppId}
                  onChange={(e) => setMetaAppId(e.target.value)}
                  placeholder="Ex: 948501160976665"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Meta App Secret (Para renovação/extensão)
                </label>
                <input
                  type="password"
                  value={metaAppSecret}
                  onChange={(e) => setMetaAppSecret(e.target.value)}
                  placeholder="Chave secreta do seu aplicativo Meta"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Meta Access Token (System User Permanente ou Graph API Token)
              </label>
              <input
                type="password"
                value={metaToken}
                onChange={(e) => setMetaToken(e.target.value)}
                placeholder={maskedToken ? `Token atual salvo: ${maskedToken} (cole para substituir)` : "Cole o novo token aqui (ex: EAANeq...)"}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Conectado diretamente ao endpoint <code>/ads_archive</code> da Meta. Salvo em disco para não perder ao reiniciar.
              </p>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Google Gemini API Key (Opcional)
              </label>
              <input
                type="password"
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy... (Deixe em branco para usar o analisador heurístico sem custo)"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Permite acionar o modelo Gemini 1.5 Flash para perguntas avançadas em linguagem natural.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all hover:scale-[1.02] flex items-center gap-1.5"
            >
              {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>{isSaving ? 'Salvando...' : 'Salvar Credenciais Permanentemente'}</span>
            </button>
          </div>
        </form>
      </div>
    </Shell>
  );
}
