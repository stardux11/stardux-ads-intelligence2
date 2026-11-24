import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=(path:string)=>readFileSync(path,'utf8');
const shell=read('src/components/layout/Shell.tsx');
const sidebar=read('src/components/layout/Sidebar.tsx');
const css=read('src/app/globals.css');
const explorer=read('src/app/explorar/page.tsx');
const filters=read('src/components/ads/AdFilters.tsx');
const dashboard=read('src/app/dashboard/page.tsx');
const card=read('src/components/ads/AdCard.tsx');
const pages=[
 'concorrentes','projetos','ia-analista','biblioteca','relatorios','configuracoes'
].map(name=>read('src/app/'+name+'/page.tsx'));

test('Embedded Ads Intelligence uses an app-level tab bar instead of double sidebars',()=>{
 assert.match(shell,/window\.self !== window\.top/);
 assert.match(shell,/data-testid="ads-embedded-header"/);
 assert.match(shell,/data-testid="ads-module-tabs"/);
 assert.match(shell,/!embedded && \(/);
 assert.match(shell,/aria-current=/);
 assert.match(sidebar,/AD_NAV_ITEMS/);
 for(const route of ['/dashboard','/explorar','/concorrentes','/projetos','/ia-analista','/biblioteca','/relatorios','/configuracoes']) {
   assert.ok(sidebar.includes(route),'Missing route: '+route);
 }
});

test('Theme sync uses explicit sender origin and does not require third-party storage',()=>{
 assert.match(shell,/event\.origin !== STARDUX_OS_ORIGIN/);
 assert.match(shell,/event\.source !== window\.parent/);
 assert.match(shell,/type === 'stardux:theme'/);
 assert.match(shell,/try \{ savedTheme = window\.localStorage/);
 assert.match(shell,/document\.documentElement\.classList\.toggle\('dark'/);
 assert.match(css,/\.ads-workspace/);
 assert.match(css,/\.ads-hero/);
 assert.match(css,/\.ads-page-title/);
});

test('Search and sort controls retain existing handlers and all filters',()=>{
 for(const handle of ['handleKeywordChange','handleNicheChange','handleFormatChange',
  'handlePlatformChange','handleLongevityChange','handleSortChange','handleReset']) {
   assert.ok(filters.includes(handle),handle);
 }
 for(const prop of ['keyword','niche','format','platform','country','minDaysActive','sortBy']) {
   assert.ok(filters.includes('filters.'+prop),prop);
 }
 assert.match(filters,/role="group" aria-label="Visualização de resultados"/);
 assert.match(filters,/aria-label="Mostrar grade"/);
 assert.match(filters,/aria-label="Mostrar tabela"/);
 assert.match(explorer,/fetch\(`\/api\/ads\?/);
 assert.match(explorer,/onSaveToCollection=/);
 assert.match(explorer,/onOpenISC=/);
});

test('All existing backend-facing workflows and modules are still referenced',()=>{
 assert.match(dashboard,/fetch\('\/api\/stats'\)/);
 assert.match(dashboard,/AdDetailModal/);
 assert.match(dashboard,/SaveToCollectionModal/);
 for(const page of pages) {
   assert.match(page,/<Shell>/);
   assert.match(page,/ads-page-title/);
   assert.match(page,/ads-eyebrow/);
 }
 assert.match(card,/onOpenDetail\(ad\)/);
 assert.match(card,/onSaveToCollection\(ad\)/);
 assert.match(card,/onOpenISC\(ad\)/);
 assert.match(card,/ads-surface/);
});

test('Responsive layout has mobile navigation, accessible tabs and horizontal table overflow',()=>{
 assert.match(shell,/aria-label="Abrir navegação"/);
 assert.match(shell,/lg:hidden/);
 assert.match(shell,/overflow-x-auto/);
 assert.match(explorer,/min-w-\[860px\]/);
 assert.match(explorer,/overflow-x-auto/);
 assert.match(css,/@media \(prefers-reduced-motion: reduce\)/);
});
