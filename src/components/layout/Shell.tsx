'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ImportCsvModal } from '../ads/ImportCsvModal';
import { CreateAdModal } from '../ads/CreateAdModal';

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [isImportCsvOpen, setIsImportCsvOpen] = useState(false);
  const [isCreateAdOpen, setIsCreateAdOpen] = useState(false);
  const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
  const [niches, setNiches] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetch('/api/projects')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(console.error);
  }, []);

  const handleRefresh = () => {
    window.dispatchEvent(new CustomEvent('stardux-data-updated'));
  };

  return (
    <div className="min-h-screen flex bg-slate-50/50 dark:bg-[#0a0b0f] text-slate-900 dark:text-slate-100 antialiased">
      {/* Sidebar Navigation */}
      <React.Suspense
        fallback={
          <aside className="w-64 border-r border-slate-200 dark:border-white/[0.05] bg-white dark:bg-[#0d0e14]" />
        }
      >
        <Sidebar />
      </React.Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Shared Global Modals */}
      <ImportCsvModal
        isOpen={isImportCsvOpen}
        onClose={() => setIsImportCsvOpen(false)}
        onSuccess={() => {
          handleRefresh();
        }}
        projects={projects}
      />

      <CreateAdModal
        isOpen={isCreateAdOpen}
        onClose={() => setIsCreateAdOpen(false)}
        onSuccess={() => {
          handleRefresh();
        }}
        niches={niches}
      />
    </div>
  );
}
