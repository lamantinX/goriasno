# AI Run: fix self-redirecting canonical loop (Yandex 0 pages)

## Meta
- **Date:** 2026-07-10
- **Task Class:** Core-risk
- **Trigger:** User reported Yandex.Webmaster notice "Всего страниц в поиске: 0" for goryasno.ru; instructed "делай и деплой".
- **Status:** SUCCESS
- **Tags:** SECURITY-SENSITIVE

## Scope
- **Goal:** Eliminate the sitemap ↔ 301 ↔ canonical trailing-slash contradiction so Yandex can index the site.
- **Files in (modified):** `public/sitemap.xml`, `src/routes/ProductPage.tsx`, `src/components/Catalog.tsx`, `index.html`
- **Files out (read only):** `server.js`, `nginx.conf`, `src/main.tsx`, `README.md`, `.github/workflows/deploy.yml`, `.claude/rules/security.md`, `.claude/rules/task-routing.md`, `docs/sprints/_TEMPLATE.md`, `docs/ai-runs/_TEMPLATE.md`
- **Sensitive surfaces touched:** `public/sitemap.xml` (SEO indexing signal served to prod); production deploy via push to main. No secrets/auth/payment/PII touched.

## Plan reference
- **Sprint artifact:** `docs/sprints/seo-canonical-trailing-slash.md`
- **Approved plan:** N/A — user gave explicit verbal approval ("делай и деплой") after the diagnosis was presented.

## Changes
- `public/sitemap.xml`: added trailing `/` to all 6 product `<loc>` URLs so they match the server's actual 200 URLs (Contract 1).
- `src/routes/ProductPage.tsx:79`: `pageUrl` now ends with `/`; drives `canonical`, `og:url` and BreadcrumbList `item` (Contracts 2, 3).
- `src/components/Catalog.tsx:169`: product link href now ends with `/` (Contract 4).
- `src/routes/ProductPage.tsx:260`: related-product link `to` now ends with `/` (Contract 4).
- `index.html`: removed non-functional `<meta name="yandex-verification" content="CODE" />` placeholder; site ownership confirmed via `275c4ce9….txt` file (Contract 5).

## Evidence
- `npm run verify` → PASS (via `bash scripts/run-quiet.sh verify`, exit 0)
- Criterion 1: `grep "<loc>" dist/sitemap.xml` → 6 product URLs all end with `/`
- Criterion 2: `grep canonical dist/anthracite/index.html` → `https://goryasno.ru/anthracite/`
- Criterion 3: `grep og:url dist/anthracite/index.html` → `https://goryasno.ru/anthracite/`
- Criterion 4: `grep 'href="/anthracite' dist/index.html` → `href="/anthracite/"`
- Criterion 5: `grep -c yandex-verification dist/index.html` → 0
- Skipped: local Playwright e2e — CI runs it on deploy; change is metadata-only with no UI/behavior delta. Remaining risk: none (CI gate gates prod).

## Failures / Rework
None.

## Workflow notes
None.

## Outcome
sitemap, canonical, og:url and internal links now uniformly reference the `/`-terminated URL the server serves as 200, breaking the self-redirecting canonical loop. Deploy triggered by merge to main; CI smoke test (200 on `/`, 404 on unknown) gates prod. Next step: monitor next Yandex search-base update for non-zero indexed pages.
