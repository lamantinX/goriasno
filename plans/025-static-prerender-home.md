# Plan 025: Статический пререндер HTML главной — контент в исходном HTML

> **Executor instructions**: Следуй плану шаг за шагом. Запускай каждую
> команду верификации и подтверждай ожидаемый результат перед переходом к
> следующему шагу. Если сработает любое условие из «STOP conditions» —
> остановись и доложи, не импровизируй. По завершении обнови строку статуса
> этого плана в `plans/README.md` (если только ревьюер не сказал, что индекс
> держит он).
>
> **Drift check (запустить первым)**: `git diff --stat dadeef4..HEAD -- index.html src/main.tsx src/App.tsx vite.config.ts package.json`
> Если любой файл в scope изменился с момента написания плана — сравни
> выдержки «Current state» с живым кодом; при расхождении считай это STOP-условием.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: tech-debt (SEO infrastructure)
- **Planned at**: commit `dadeef4`, 2026-07-06

## Why this matters

Сейчас `index.html` содержит только `<div id="root"></div>` — весь контент
(H1, названия товаров, цены, копирайт) рендерится клиентским React из
`/assets/index-*.js`. Проверка: `curl -s https://goryasno.ru/ | grep -c
'<h[12]\|<p>'` → **0**. Googlebot умеет рендерить SPA во второй проход, но
это даёт задержку обхода и более слабые контентные сигналы; для
одностраничного сайта это и причина нулевых показов в GSC.

Цель: чтобы HTML, который отдаёт сервер, **уже содержал** H1, вводный
копирайт, список товаров (название + цена + короткое описание) и контактный
блок — в виде статического HTML, который React потом гидрирует. Это
блокирующая находка №1 SEO-аудита и фундамент для плана 026 (товарные
страницы).

## Current state

**Стек**: React 19 + Vite 6 + TypeScript + Tailwind v4 (через
`@tailwindcss/vite`). Роутинга нет — одностраничный сайт. Прод-фронт через
nginx (`nginx.conf`) отдаёт `dist/`; Express (`server.js`) — это API
`/api/leads` + статик-фоллбэк для dev/preview.

**Файлы в scope** (роль каждого):

- `index.html` — текущий HTML-шаблон Vite; содержит `<head>` с meta, OG,
  static `LocalBusiness` JSON-LD и `<body><div id="root"></div></body>`.
  Полное содержимое релевантной части:
  ```html
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
  ```
- `src/main.tsx` — точка входа:
  ```tsx
  import {StrictMode} from 'react';
  import {createRoot} from 'react-dom/client';
  import App from './App.tsx';
  import './index.css';

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  if ('serviceWorker' in navigator) { /* регистрация sw.js */ }
  ```
- `src/App.tsx` — корневой компонент; рендерит `<Header>`, `<Hero>`,
  `<Catalog>`, `<HowWeWork>`, `<FeedbackSection>` (см. выдержку в
  `src/App.tsx:101-152`). Источник данных товаров — `PRODUCTS` из
  `src/data.ts`.
- `vite.config.ts` — конфиг сборки; плагины `[react(), tailwindcss()]`,
  `base: process.env.BASE_PATH ?? '/'`.
- `package.json` — скрипты: `build: vite build`, `dev`, `verify: npm run
  lint && npm run build`, `lint: tsc --noEmit`. **Нет** react-router, **нет**
  SSG-плагина.

**Конвенции репо** (соблюдать):

- Имена файлов компонентов — PascalCase в `src/components/`; типы — в
  `src/types.ts`. См. `src/components/Hero.tsx` как образец.
- TypeScript strict; используется `tsc --noEmit` как линтер (план 017).
- Biome для форматирования (`npm run format`).
- Проверочный гейт перед коммитом: `bash scripts/run-quiet.sh verify` (или
  `npm run verify` для чтения вывода). Тихая обёртка печатает вывод только
  на провале и возвращает реальный exit-code.

## Commands you will need

| Purpose   | Command                                  | Expected on success |
|-----------|------------------------------------------|---------------------|
| Install   | `npm install`                            | exit 0              |
| Typecheck | `npm run lint` (= `tsc --noEmit`)        | exit 0, no errors   |
| Build     | `npm run build`                          | exit 0, `dist/` создан |
| Verify gate | `bash scripts/run-quiet.sh verify`     | exit 0, silent on pass |
| Dev server | `npm run dev`                           | сервер на :3000     |

## Suggested executor toolkit

- Прочитать `vite.config.ts` и `src/main.tsx` полностью перед стартом.
- Ознакомиться с разделом «Render» документации Vite: параметры
  `experimental.renderBuiltUrl` здесь НЕ нужны — нужен только пререндер.

## Scope

**In scope** (только эти файлы):

- `package.json` — добавить devDependency `vite-react-ssg` (или
  эквивалент); обновить скрипты `build`/`dev` по необходимости.
- `vite.config.ts` — подключить SSG-плагин.
- `src/main.tsx` — переключить `createRoot` → SSG-точку входа
  (`renderRoot`/`ViteReactSSG`-паттерн).
- `index.html` — оставить как шаблон (SSG инжектит пререндер в `#root`);
  убедиться, что static JSON-LD и meta остаются в `<head>` без изменений.

**Out of scope** (НЕ трогать, хотя выглядит связанным):

- `src/components/*` — внутренности компонентов. Пререндер должен работать
  на текущем дереве без правки компонентов. Если SSG падает на
  клиент-onlyкоде (например, `window`/`localStorage`/`import.meta` в
  `App.tsx:41-49`) — это обрабатывается в Step 2, а не правкой компонентов.
- `server.js` — не относится к статической генерации (это API + static
  fallback).
- `nginx.conf` — прод-раздача `dist/`; формат вывода сборки не меняется.
- Товарные страницы/роутинг — это план 026. Здесь пререндерим только `/`.
- `public/sw.js`, `public/sitemap.xml` — отдельные планы.
- Любые правки meta/JSON-LD — план 027.

## Git workflow

- Branch: `advisor/025-static-prerender-home`
- Commit per step; стиль сообщений — conventional commits (как
  `git log --oneline -5`: `fix(ci): ...`, `feat(ci): ...`). Пример:
  `feat(seo): prerender home HTML via vite-react-ssg`.
- НЕ пушить и НЕ открывать PR, если оператор не сказал иное.

## Steps

### Step 1: Выбрать и установить SSG-решение

**Контекст решения.** В стеке Vite 6 + React 19 кандидаты:

1. **`vite-react-ssg`** (рекомендуется) — дроп-ин для Vite, пререндерит
   роуты в статический HTML на этапе сборки, минимальные правки
   `main.tsx`. Поддерживает React 19.
2. **`vite-plugin-prerender`** — рендерит указанные пути через puppeteer;
   тяжелее по зависимостям, но не требует правки точки входа.
3. **Свой скрипт на `react-dom/server.renderToString`** — больше контроля,
   но требует ручной работы с ассетами Vite.

**Действие**: установить `vite-react-ssg` как devDependency:
```bash
npm install -D vite-react-ssg
```

**Verify**: `node -e "require('vite-react-ssg')" 2>&1 | head -1 || echo "import check"` →
модуль резолвится без ошибки (exit 0). Если пакет не поддерживает React 19
или Vite 6 — это STOP-условие, сообщить и предложить вариант 2 или 3.

### Step 2: Обезопасить клиент-only код в App.tsx

`src/App.tsx:40-49` обращается к `localStorage` в `useEffect`. `useEffect`
не выполняется при SSR-прендере, поэтому этот код безопасен. Однако перед
сборкой убедиться, что в `App.tsx` и компонентах нет **top-level** (вне
`useEffect`/обработчиков) обращений к `window`/`document`/
`localStorage`/`import.meta.env.BASE_URL`-зависимым сайд-эффектам.

**Действие**: проверить поиском:
```bash
rg -n "window\.|document\.|localStorage\." src/ --glob '!**/*.test.*'
```
Все обращения должны быть внутри `useEffect` или обработчиков событий
(уже так в текущем коде — `App.tsx:40`, `Hero.tsx:37-49`, `Catalog.tsx`,
`Header.tsx:29-35`). Если найдено top-level обращение — обернуть в
`useEffect` или `typeof window !== 'undefined'` guard. **Не править
компоненты косметически** — только функциональные guard-обёртки при
необходимости.

**Verify**: `rg -n "window\.|document\.|localStorage\." src/` показывает
только строки внутри `useEffect`/обработчиков (визуальная проверка по
выдержкам выше). Если найдено top-level — STOP и доложить.

### Step 3: Переписать точку входа на SSG

Заменить содержимое `src/main.tsx` на SSG-совместимую точку входа. Целевая
форма (паттерн `vite-react-ssg`):

```tsx
import {StrictMode} from 'react';
import {ViteReactSSG} from 'vite-react-ssg';
import App from './App.tsx';
import './index.css';

export const createRoot = ViteReactSSG({ App });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`)
      .then(reg => console.log('SW registered:', reg))
      .catch(err => console.error('SW registration failed:', err));
  });
}
```

**Verify**: `npm run lint` → exit 0 (типы корректны). Если
`ViteReactSSG`-экспорт назван иначе в установленной версии — свериться с
`node_modules/vite-react-ssg/dist/index.d.ts` и поправить имя.

### Step 4: Подключить SSG-плагин в vite.config.ts

Добавить `ssgOptions` и обернуть плагины. Целевая форма `vite.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: process.env.BASE_PATH ?? '/',
    plugins: [
      react(),
      tailwindcss(),
      // Пререндер указанных роутов в статический HTML на этапе сборки.
      // На главной пока один роут — '/'.
    ],
    ssgOptions: {
      script: 'async',
      format: 'html',
    },
    // ... server: { ... } остаётся без изменений
    resolve: { alias: { '@': path.resolve(__dirname, '.') } },
    server: { /* текущий блок без изменений */ },
  };
});
```

(Точная форма `ssgOptions` зависит от версии `vite-react-ssg` — свериться с
её README; цель — включить пререндер `/`.)

**Verify**: `npm run build` → exit 0, в `dist/` появляется `index.html`,
размер которого существенно больше текущих ~4 KB (т.к. содержит
отрендеренный контент).

### Step 5: Подтвердить, что контент появился в статическом HTML

**Действие**: после сборки проверить, что H1 и названия товаров присутствуют
в `dist/index.html`:

```bash
grep -c -E '<h1|<h2|антрацит|Дрова|Углегорская' dist/index.html
```

Должно вернуть **>0** (раньше было 0 для `<h1>/<h2>`). Также убедиться, что
`dist/index.html` всё ещё содержит static `LocalBusiness` JSON-LD из
`index.html` (SSG сохраняет `<head>`):

```bash
grep -c 'application/ld+json' dist/index.html
```
→ ожидаемо ≥1.

**Verify**: обе grep-команды возвращают ≥1. Если контент не появился —
SSG не отработал; проверить лог `npm run build` и сверить с README
`vite-react-ssg`. На повторной неудаче — STOP.

### Step 6: Проверить регресс рантайма через существующий e2e

Существующий спек `tests/example.spec.ts` ходит на dev-сервер и проверяет
H1, фильтр каталога, форму и модалку. SSG-сборка не должна ломать гидрацию.

**Действие**: поднять dev-сервер (`npm run dev`) и прогнать Playwright:

```bash
npm run dev &
sleep 3
npm run test
kill %1
```

**Verify**: `npm run test` → все 4 теста проходят. Если падает на
гидрации/отсутствии элементов — STOP, доложить какой тест и ошибку.

### Step 7: Финальный гейт

```bash
bash scripts/run-quiet.sh verify
```

**Verify**: exit 0 (silent on pass).

## Test plan

- **Новых unit-тестов не требуется** — это инфраструктурное изменение.
- Регрессионное покрытие: существующий `tests/example.spec.ts` (4 теста)
  гоняется в Step 6 и должен проходить без правок.
- **Ручная проверка** (опционально, но желательно): открыть
  `dist/index.html` в браузере с отключённым JS — должна быть видна H1 и
  скелет контента (доказательство, что контент статичен).

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0; `dist/index.html` существует и весит
      существенно больше ~4 KB
- [ ] `grep -c -E '<h1|<h2|антрацит|Углегорская' dist/index.html` → ≥1
- [ ] `grep -c 'application/ld+json' dist/index.html` → ≥1 (static
      LocalBusiness сохранился)
- [ ] `npm run test` → все 4 существующих e2e теста проходят
- [ ] `bash scripts/run-quiet.sh verify` → exit 0
- [ ] Никакие файлы вне in-scope списка не изменены (`git status`)
- [ ] `plans/README.md` строка статуса обновлена

## STOP conditions

Остановись и доложи (не импровизируй), если:

- Код в «Current state» не совпадает с выдержками (код уехал с момента
  написания плана).
- `vite-react-ssg` несовместим с React 19 или Vite 6 (сообщить и просить
  выбрать вариант 2/3 из Step 1).
- Шаг верификации провален дважды после разумной попытки фикса.
- Фикс требует правки out-of-scope файла (например, компонента).
- Найден top-level клиент-only код (`window`/`document`) в `src/`, который
  нельзя изолировать guard-ом без косметической правки компонентов —
  доложить и просить расширения scope.

## Maintenance notes

- **После этого плана** `dist/index.html` содержит реальный контент — это
  новая инварианта. Будущие изменения в `src/App.tsx`/компонентах
  автоматически отражаются в пререндере при `npm run build`.
- **План 026** (товарные страницы) расширяет пререндер на новые роуты —
  нужно будет добавить их в `ssgOptions` (или использовать встроенный
  crawler `vite-react-ssg`).
- **Ревьюер должен scrutinize**: (1) что static JSON-LD в `<head>` не
  дублируется и не теряется; (2) что Service Worker регистрация
  остаётся в bundle (не вырезана tree-shaking'ом); (3) что
  `BASE_PATH` subpath-deploy всё ещё работает (проверить через
  `BASE_PATH=/goriasno/ npm run build` если применимо к CI).
- **Отложено** из этого плана: пререндер товарных страниц (план 026);
  сжатие/immutable-кеш ассетов (план 028); правки meta/JSON-LD (план 027).
