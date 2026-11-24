# Ads Intelligence · Visual Stardux OS

## Scope: frontend only
The original Next.js Ads Intelligence remains a separate application. Stardux OS embeds it in the intelligence menu using an iframe.

- Standalone: a responsive, modernized sidebar plus mobile drawer.
- Embedded: `Shell` detects `window.self !== window.top` (or `?embedded=1`) and replaces its internal sidebar with a compact horizontal module nav; the Stardux OS main menu is not duplicated.
- Light/dark theme: Stardux OS sends a `stardux:theme` message. The Ads app trusts it **only** from `https://starduxos.vercel.app` and the immediate parent frame. No credentials or private customer data are passed.
- Third-party localStorage may fail in Safari/private mode; this does not break embedded navigation.
- Layout: semantic hero, KPI, toolbar and card styles, responsive grids and overflowable tables. Original API requests, filters, Meta creative actions, collections, dashboard and AI query flow are left intact.

## Acceptance checklist
1. Open Stardux OS > Ads Intelligence. See only the **main CRM sidebar**, not a second Ads Intelligence sidebar.
2. Switch module tabs: dashboard, explore, competitors, research projects, AI analyst, collection library, reports and settings; no loss of underlying data.
3. Test light and dark themes using the CRM setting. Contrast stays legible; tab selection updates.
4. At mobile width: use horizontal tabs inside CRM, or standalone Ads mobile drawer. Results table scrolls horizontally.
5. Search ads by keyword and all preexisting filters; open an ad, copy its text and save it to a collection.
6. In dashboard verify the same API stats and graphs; test management modals in secondary screens.
7. Run UI tests, TypeScript and Next build before merging.

## Deployment distinction
Editing Stardux OS alone does not change the external Ads UI. Deploy this Ads repo to the **actual Vercel project serving** `stardux-ads-intelligence-nz2p.vercel.app`; then deploy the small iframe theme bridge in the Stardux OS repo.
