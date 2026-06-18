# ГориЯсно — сайт-каталог угольного склада (Донецк)

Single-page React catalog for a coal / firewood / building-materials
warehouse in Donetsk. Lead forms relay to a Telegram channel via a small
Express backend. Optimized for slow RF 3G (self-hosted fonts, no external
CDNs, offline-first Service Worker).

## Stack
React 19, Vite 6, TypeScript, Tailwind CSS v4 (via `@tailwindcss/vite`),
Lucide React, Express (lead-relay backend), Playwright (E2E).

## Prerequisites
Node.js (LTS).

## Install
`npm install`

## Develop
`npm run dev` — Vite dev server on http://localhost:3000.
The backend runs separately: `node server.js` (port 3001). In dev, Vite
proxies `/api/*` to `http://localhost:3001` (see `vite.config.ts`).

## Environment (backend)
Copy `.env.example` to `.env` and fill in:
- `TELEGRAM_BOT_TOKEN` — bot token from @BotFather
- `TELEGRAM_CHAT_ID` — target channel/chat id (bot must be a member)
- `PORT` (optional, default 3001)

Without these, `/api/leads` returns 500 "Server configuration error".

## Build
`npm run build` — outputs to `dist/`.

## Test
`npm test` — runs Playwright E2E (auto-starts the dev server).
`npm run lint` — `tsc --noEmit` typecheck.

## Deploy
Production: `goryasno.ru` via Nginx serving `dist/` (`nginx.conf`).
The Express backend (`server.js`) serves `dist/` + the `/api/leads` route
when run in production.
Staging: see `DEPLOY_NIP_IO.md` for the nip.io wildcard-DNS flow.
