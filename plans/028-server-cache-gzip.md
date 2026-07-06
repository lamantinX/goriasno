# Plan 028: Кеш-заголовки и gzip для статических ассетов в server.js (dev/preview)

> **Executor instructions**: Следуй плану шаг за шагом. При
> срабатывании STOP-условия — остановись и доложи. По завершении обнови
> строку статуса в `plans/README.md`.
>
> **Drift check**: `git diff --stat dadeef4..HEAD -- server.js nginx.conf`
> При расхождении выдержек с живым кодом — STOP.

## Status

- **Priority**: P3
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: perf (DX + preview fidelity)
- **Planned at**: commit `dadeef4`, 2026-07-06

## Why this matters

В аудите отмечено: прод-фронт через **nginx** уже кэширует статику на 1
год и жмёт gzip (`nginx.conf` — gzip on, `location ~* \.(?:...)$ expires
1y`). Но dev/preview-сервер **`server.js` (Express)**, который также
используется как fallback и в CI-превью, отдаёт `/assets/*` с
`Cache-Control: public, max-age=0` и без gzip (проверено: `curl -sI
https://goryasno.ru/src/main.tsx` → `X-Powered-By: Express`, no
`Content-Encoding`). Это:

1. Искажает метрики Lighthouse/PageSpeed при тестировании против
   preview-деплоя (не соответствует проду).
2. Замедляет dev-проверки на медленном соединении.

Цель: добавить в `server.js` immutable-кеш для хэшированных ассетов
`/assets/*` и gzip/brotli для текстовых ответов, чтобы поведение Express-
сервера соответствовало прод-nginx.

## Current state

**`server.js`** — Express-приложение. Релевантные части (полностью файл
прочитан в рекогносцировке):

```js
// Security headers middleware (строки ~22-33)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // ... остальные security headers ...
  next();
});

// POST /api/leads (строки ~45-100) — Telegram-релей

// Serve static files in production (строка ~115)
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback (строки ~117-119) — план 024 сделал это честным 404
app.get('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

**`nginx.conf`** — прод-эталон: gzip on, `expires 1y` для статики,
security headers.

**Конвенции репо**:

- `server.js` — прод-бэкенд (Telegram-релей + static serving). Не
  dev-only: используется и в превью.
- Security headers в `server.js` дублируют `nginx.conf` с комментарием
  «keep in sync with nginx.conf» (`server.js:22`). Эту же конвенцию
  соблюдать для кеша.
- TypeScript-strict не применяется к `server.js` (это .js, не .ts); но
  `@types/express` стоит в devDeps.
- Гейт: `bash scripts/run-quiet.sh verify`.

## Commands you will need

| Purpose   | Command                            | Expected |
|-----------|------------------------------------|----------|
| Start server | `node server.js` (или `tsx server.js`) | слушает :3001 |
| Typecheck | `npm run lint`                     | exit 0   |
| Verify    | `bash scripts/run-quiet.sh verify` | exit 0   |
| Curl check | `curl -sI -H 'Accept-Encoding: gzip' http://localhost:3001/assets/index-XXX.js` | `content-encoding: gzip` |

## Suggested executor toolkit

- Express-пакеты для компрессии: встроенный `express.static` не делает
  gzip. Варианты:
  1. `compression` middleware (npm) — самое простое.
  2. `shrink-ray-current` (brotli+gzip) — тяжелее по deps.
  3. Ручная обработка через zlib — больше кода, меньше deps.
- Рекомендуется `compression` (минимальный footprint, стандарт).

## Scope

**In scope** (только эти файлы):

- `server.js` — добавить:
  1. `compression` middleware перед static-serving.
  2. Кастомный static-handler для `/assets/*` с
     `Cache-Control: public, max-age=31536000, immutable`.
- `package.json` — добавить `compression` в dependencies.

**Out of scope** (НЕ трогать):

- `nginx.conf` — уже корректно настроен для прода; не дублировать.
- `vite.config.ts` — dev-сервер Vite имеет свою компрессию; не трогать.
- `public/sw.js` — кеширование SW отдельно (план 011).
- Любые правила для HTML (`/`, `/index.html`) — HTML должен оставаться
  `max-age=0` + ETag (правильно для свежести контента).
- `src/` — не связано.

## Git workflow

- Branch: `advisor/028-server-cache-gzip`
- Conventional commits: `perf(server): gzip + immutable cache for assets`.
- НЕ пушить без инструкции.

## Steps

### Step 1: Установить compression

```bash
npm install compression
npm install -D @types/compression
```

**Verify**: `node -e "require('compression')"` → exit 0.

### Step 2: Добавить compression middleware

В `server.js` после `app.use(express.json(...))` и ДО security-headers
middleware (или сразу после — порядок не критичен для gzip), добавить:

```js
import compression from 'compression';

// ... existing code ...

// gzip/brotli для текстовых ответов (HTML, JS, CSS, JSON).
// Синхронизировать с nginx.conf gzip on.
app.use(compression({
  // Только для ответов > 1KB (мелкие не стоят CPU).
  threshold: 1024,
  // Brotli для поддерживающих браузеров (compression v1.8+).
  enableBrotli: true,
}));
```

Импорт `compression` добавить в верхний блок импортов `server.js` (после
`import rateLimit from 'express-rate-limit';`).

**Verify**: `node -e "import('./server.js').catch(e=>console.error(e))"`
— синтаксическая проверка (может упасть на.listen в прод-режиме, это ОК;
важно, что нет SyntaxError). Альтернатива: `node --check server.js` →
exit 0.

### Step 3: Immutable cache для /assets/*

Vite генерирует хэшированные имена файлов в `dist/assets/` (напр.
`index-Bv5SYuZe.js`). Такие файлы неизменны по содержанию → можно кешировать
агрессивно.

Заменить текущий static-handler (`server.js`:
`app.use(express.static(path.join(__dirname, 'dist')));`) на два
обработчика:

```js
// Хэшированные ассеты Vite — неизменны, кешируем на 1 год.
// Синхронизировать с nginx.conf location ~* \.(?:...)$ expires 1y.
app.use('/assets', express.static(
  path.join(__dirname, 'dist', 'assets'),
  {
    maxAge: '1y',
    immutable: true,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  }
));

// Вся остальная статика (favicon, images, sw.js, site.webmanifest и т.д.)
// — обычный static, default cache 0 (HTML-подход для свежести).
app.use(express.static(path.join(__dirname, 'dist')));
```

**Verify**: `node --check server.js` → exit 0.

### Step 4: Проверить через curl

Запустить сервер и проверить заголовки:

```bash
# Сначала собрать свежий dist
npm run build
node server.js &
SERVER_PID=$!
sleep 2

# Найти хэшированный ассет
ASSET=$(ls dist/assets/index-*.js | head -1 | sed 's|dist||')

# Проверить immutable cache
echo "--- /assets/ cache ---"
curl -sI "http://localhost:3001${ASSET}" | grep -i 'cache-control\|content-encoding'

# Проверить gzip
echo "--- gzip ---"
curl -sI -H 'Accept-Encoding: gzip' "http://localhost:3001${ASSET}" | grep -i 'content-encoding'

# Проверить, что HTML НЕ immutable
echo "--- HTML cache ---"
curl -sI http://localhost:3001/ | grep -i 'cache-control'

kill $SERVER_PID
```

**Ожидаемые результаты**:
- `/assets/*.js`: `cache-control: public, max-age=31536000, immutable` +
  `content-encoding: gzip` (или br).
- `/` (HTML): НЕ содержит `immutable`, остаётся как было (`max-age=0` или
  absent).

**Verify**: все три echo-блока показывают ожидаемые заголовки. Если gzip
не появляется — `compression` middleware не отработал; проверить порядок
middleware (должен быть до static).

### Step 5: Финальный гейт

```bash
bash scripts/run-quiet.sh verify
```

**Verify**: exit 0.

## Test plan

- **Новых автотестов не требуется** — это конфигурация middleware.
- Опционально: добавить Playwright-тест, проверяющий заголовок `cache-
  control: immutable` на ассете. Но это требует запущенного server.js в
  test-окружении (сейчас Playwright гоняется против `npm run dev` = Vite
  dev-server, не Express). **Не добавлять** — خارج scope.
- **Ручная проверка**: Step 4 (curl) — единственный надёжный способ
  проверить заголовки Express.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `node --check server.js` → exit 0
- [ ] `npm run lint` → exit 0
- [ ] `npm run build` → exit 0
- [ ] `bash scripts/run-quiet.sh verify` → exit 0
- [ ] Step 4 curl-проверка: `/assets/*.js` отдаёт
      `cache-control: ...immutable` и `content-encoding: gzip|br`
- [ ] Step 4 curl-проверка: `/` НЕ отдаёт `immutable`
- [ ] `compression` и `@types/compression` появились в `package.json`
- [ ] Никакие файлы вне in-scope списка не изменены
- [ ] `plans/README.md` строка статуса обновлена

## STOP conditions

Остановись и доложи, если:

- `compression`-пакет несовместим с текущей версией Express/Node.
- Порядок middleware невозможно выстроить так, чтобы gzip работал для
  static-ответов (доложить конфликт).
- Код в «Current state» не совпадает с выдержками.

## Maintenance notes

- **После этого плана** `server.js` и `nginx.conf` настроены
  согласованно для кеша/gzip. При любых правках одного — править и другое,
  сохраняя комментарий «keep in sync with nginx.conf/server.js».
- **CI/preview-деплой** (`.github/workflows/deploy.yml`) — проверить, что
  превью использует этот server.js (а не Vite preview). Если превью идёт
  через `vite preview`, то кеш/gzip из этого плана не применятся к
  превью — это acceptable (прод на nginx уже корректен).
- **Ревьюер**: проверить (1) что HTML остаётся без immutable; (2) что
  security-headers middleware всё ещё выполняется для всех ответов
  (включая /assets/*); (3) что `compression` не ломает streaming/большие
  ответы (порог 1KB достаточен).
- **Отложено**: HTTP/2 push (устаревший, не делать); раннее указание
  `preload` для критичных ассетов (отдельный план после Lighthouse-аудита).
