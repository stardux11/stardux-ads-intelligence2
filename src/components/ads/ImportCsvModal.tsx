'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { parseAndValidateCSV } from '@/lib/csv-parser';
import { Ad } from '@/lib/types';

interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (importedCount: number) => void;
  projects?: Array<{ id: string; name: string }>;
}

export function ImportCsvModal({ isOpen, onClose, onSuccess, projects = [] }: ImportCsvModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [csvContent, setCsvContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{
    validAds: Partial<Ad>[];
    errors: Array<{ row: number; error: string; rawData: any }>;
    totalRows: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const text = await file.text();
      setCsvContent(text);
      validateContent(text);
    }
  };

  const handlePasteChange = (text: string) => {
    setCsvContent(text);
    if (text.trim().length > 10) {
      validateContent(text);
    } else {
      setValidationResult(null);
    }
  };

  const validateContent = (text: string) => {
    const res = parseAndValidateCSV(text);
    setValidationResult(res);
  };

  const handleSubmit = async () => {
    if (!validationResult || validationResult.validAds.length === 0) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/ads/import-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csvContent,
          project_id: selectedProjectId || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({ type: 'success', text: data.message });
        setTimeout(() => {
          onSuccess(data.importedCount);
          onClose();
        }, 1200);
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Falha ao importar anúncios.' });
      }
    } catch {
      setStatusMessage({ type: 'error', text: 'Erro de comunicação ao importar arquivo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Importação de Anúncios (CSV)
              </h3>
              <p className="text-[11px] text-slate-400">
                Adicione campanhas observadas com validação automática de dados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Template & Project Option */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Modelo Oficial Stardux</p>
              <p className="text-[11px] text-slate-400">Baixe o modelo CSV com cabeçalhos e exemplos.</p>
            </div>
            <a
              href="/templates/modelo-importacao-anuncios.csv"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 text-[11px] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Baixar Modelo CSV</span>
            </a>
          </div>

          {/* Project Association */}
          {projects.length > 0 && (
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Associar a um Projeto (Opcional):
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
              >
                <option value="">Nenhum (Disponível em todo o workspace)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Input Method Switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'upload'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Arquivo CSV
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'paste'
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Colar Texto CSV
            </button>
          </div>

          {activeTab === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/80 rounded-xl p-8 text-center cursor-pointer transition-colors"
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  {selectedFile ? selectedFile.name : 'Clique para selecionar o arquivo .csv'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Formato CSV delimitado por vírgula com cabeçalho padrão</p>
              </div>
            </div>
          ) : (
            <div>
              <textarea
                value={csvContent}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder="external_id,advertiser_name,headline,body_text,format,platforms,started_at&#10;AD-01,Empresa X,Lançamento Jardins,Apartamentos de luxo,video,facebook;instagram,2026-05-01"
                className="w-full h-36 p-3 font-mono text-[11px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
              />
            </div>
          )}

          {/* Validation Feedback & Preview */}
          {validationResult && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Resumo da Prévia:</span>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                    <CheckCircle className="w-3 h-3" />
                    {validationResult.validAds.length} válidos
                  </span>
                  {validationResult.errors.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                      <AlertCircle className="w-3 h-3" />
                      {validationResult.errors.length} erros
                    </span>
                  )}
                </div>
              </div>

              {/* Errors Table */}
              {validationResult.errors.length > 0 && (
                <div className="max-h-28 overflow-y-auto rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/20 p-2 text-[11px] space-y-1">
                  {validationResult.errors.map((err, i) => (
                    <div key={i} className="text-rose-700 dark:text-rose-400 flex items-start gap-1">
                      <span className="font-bold shrink-0">Linha {err.row}:</span>
                      <span>{err.error}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Preview of Valid Ads */}
              {validationResult.validAds.length > 0 && (
                <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold sticky top-0">
                      <tr>
                        <th className="p-2">Anunciante</th>
                        <th className="p-2">Título</th>
                        <th className="p-2">Formato</th>
                        <th className="p-2">Dias Observados</th>
                        <th className="p-2">ISC Estimado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {validationResult.validAds.slice(0, 10).map((ad, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-2 font-medium text-slate-900 dark:text-white truncate max-w-[120px]">
                            {ad.advertiser_name}
                          </td>
                          <td className="p-2 text-slate-600 dark:text-slate-300 truncate max-w-[160px]">
                            {ad.headline}
                          </td>
                          <td className="p-2 uppercase text-slate-500 text-[10px]">
                            {ad.format}
                          </td>
                          <td className="p-2 font-semibold text-slate-700 dark:text-slate-300">
                            {ad.days_active_observed}d
                          </td>
                          <td className="p-2 font-bold text-emerald-600 dark:text-emerald-400">
                            {ad.isc_score}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !validationResult || validationResult.validAds.length === 0}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <span>Importar {validationResult ? `${validationResult.validAds.length} Anúncios` : ''}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
