'use client';

import React, { useState, useEffect } from 'react';
import { X, BookmarkCheck, Plus, Check, Loader2 } from 'lucide-react';
import { Ad, Collection } from '@/lib/types';

interface SaveToCollectionModalProps {
  ad: Ad | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SaveToCollectionModal({ ad, isOpen, onClose, onSuccess }: SaveToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/collections')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setCollections(data);
            if (data.length > 0) setSelectedCollectionId(data[0].id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen || !ad) return null;

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;
    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollectionName.trim() }),
      });
      const data = await res.json();
      if (data.success && data.collection) {
        setCollections([...collections, data.collection]);
        setSelectedCollectionId(data.collection.id);
        setNewCollectionName('');
        setIsCreatingCollection(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!selectedCollectionId) return;
    setIsSubmitting(true);
    setStatusMsg(null);

    try {
      const res = await fetch(`/api/collections/${selectedCollectionId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_id: ad.id,
          notes,
          tags,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg('Anúncio salvo na coleção com sucesso!');
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 800);
      }
    } catch {
      setStatusMsg('Erro ao salvar anúncio.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <BookmarkCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Salvar na Biblioteca
              </h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                {ad.headline || ad.advertiser_name}
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

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Collection Select */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">
                Selecione a Pasta / Coleção
              </label>
              <button
                type="button"
                onClick={() => setIsCreatingCollection(!isCreatingCollection)}
                className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Nova Pasta
              </button>
            </div>

            {isCreatingCollection ? (
              <div className="flex gap-2 my-2">
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Nome da nova pasta..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleCreateCollection}
                  className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold text-xs"
                >
                  Criar
                </button>
              </div>
            ) : null}

            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.items_count || 0} referências)
                </option>
              ))}
            </select>
          </div>

          {/* Personal Notes */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Notas Pessoais de Referência
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Bom gancho de curiosidade para testar no nicho de imóveis..."
              className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
              Etiquetas (Tags)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Ex: Gancho, UGC, WhatsApp"
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Adicionar
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px]"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="hover:text-emerald-900 dark:hover:text-white ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {statusMsg && (
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{statusMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || !selectedCollectionId}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <span>Salvar Referência</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
