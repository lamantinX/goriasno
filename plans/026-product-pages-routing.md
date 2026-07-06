# Plan 026: Товарные страницы с роутингом + Product/Offer schema

> **Executor instructions**: Следуй плану шаг за шагом. Запускай каждую
> команду верификации и подтверждай ожидаемый результат перед переходом к
> следующему шагу. Если сработает любое условие из «STOP conditions» —
> остановись и доложи, не импровизируй. По завершении обнови строку статуса
> этого плана в `plans/README.md`.
>
> **Drift check (запустить первым)**: `git diff --stat dadeef4..HEAD -- src/data.ts src/types.ts src/App.tsx src/components/Catalog.tsx src/main.tsx vite.config.ts public/sitemap.xml package.json`
> Если любой файл в scope изменился — сравни выдержки «Current state» с
> живым кодом; при расхождении считай это STOP-условием.

## Status

- **Priority**: P1
- **Effort**: L
- **Risk**: MED
- **Depends on**: `plans/025-static-prerender-home.md` (нужен SSG-пайплайн для пререндера новых роутов)
- **Category**: direction (features) + tech-debt
- **Planned at**: commit `dadeef4`, 2026-07-06

## Why this matters

Сейчас весь сайт — один URL `/`. 8 товаров из `src/data.ts` схлопнуты на
главную через каталог `Catalog.tsx`. GSC показывает 0 показов за 90 дней:
нет страниц, которые могли бы ранжироваться под продуктовые запросы
(«антрацит донецк цена», «дрова дуб донецк», «уголь марки Т купить» и т.д.).
Внутренняя навигация — `<button onClick>` скролл, а не `<a href>`, поэтому
Googlebot видит **ноль внутренних ссылок**.

Цель: создать индексируемые, линкуемые товарные страницы (по одной на
каждый кластер товаров), с уникальным H1 (товар + город), содержанием
(спеки/применение, ~600–900 слов), static `Product` + `Offer` JSON-LD и
real `<a href>` ссылками с главной. SSG-пайплайн из плана 025 пререндерит
каждую страницу в статический HTML. Это крупнейший лифт SEO-аудита
(находка №2 и №9).

## Current state

**Стек после плана 025**: Vite 6 + React 19 + `vite-react-ssg`. Точка
входа в `src/main.tsx` использует `ViteReactSSG({ App })`. Роутинга пока
нет.

**Файлы** (роль):

- `src/data.ts` — массив `PRODUCTS: Product[]` из 8 элементов (см.
  выдержку в `src/data.ts:8-117`). Каждый товар имеет `id`, `name`,
  `category`, спецификации (`ashValue`, `heatValue`, `fraction` и т.д.),
  `priceEstimate`, `unit`, `image`. **Это источник данных для страниц.**
- `src/types.ts:6-23` — интерфейс `Product`.
- `src/App.tsx` — корневой компонент; рендерит `<Header>`, `<Hero>`,
  `<Catalog>`, `<HowWeWork>`, `<FeedbackSection>`. Будет роут-корнем.
- `src/components/Catalog.tsx` — карточки товаров; кнопка
  «Рассчитать заказ» (`Catalog.tsx:225-231`) открывает модалку. Карточки
  нужно обернуть в `<a href="/<slug>">`.
- `public/sitemap.xml` — текущий (2 URL: `/`, `/privacy.html`). Нужно
  расширить.
- `index.html` — `<head>` с static `LocalBusiness` JSON-LD. **Не трогать**
  global head — у каждой страницы будет свой head через SSG `head`-хук.

**Конвенции репо** (соблюдать):

- Компоненты — PascalCase в `src/components/`; типы — в `src/types.ts`.
- Tailwind v4 + тёмная тема «уголь» (`#0a0a0c`), акцентные цвета через
  `theme`-проп (`slate-fire`/`cool-slate`/`cozy-wood`; зафиксирован
  `cozy-wood` — см. `src/App.tsx:22`). Образец стилизации —
  `src/components/Hero.tsx`.
- TypeScript strict; линтер `tsc --noEmit`.
- Проверочный гейт: `bash scripts/run-quiet.sh verify`.
- E2e: `tests/example.spec.ts` (4 теста на dev-сервере :3000).

## Commands you will need

| Purpose   | Command                                  | Expected on success |
|-----------|------------------------------------------|---------------------|
| Install   | `npm install`                            | exit 0              |
| Typecheck | `npm run lint`                           | exit 0              |
| Build     | `npm run build`                          | exit 0, `dist/` + SSG |
| Verify    | `bash scripts/run-quiet.sh verify`       | exit 0, silent      |
| E2E       | `npm run test` (после `npm run dev &`)   | все тесты pass      |

## Scope

**In scope** (только эти файлы):

- `package.json` — добавить `react-router-dom` (или
  `@gatsbyjs/reach-router` — но React 19 лучше с react-router v7) в
  dependencies.
- `src/main.tsx` — настроить SSG с роутами (см. Step 2).
- `src/App.tsx` — превратить в layout с `<Outlet>`/маршрутами.
- `src/routes/` (новая директория) — страницы:
  - `src/routes/Home.tsx` — текущая главная (Hero+Catalog+HowWeWork+Feedback).
  - `src/routes/ProductPage.tsx` — товарная страница.
  - `src/routes/NotFound.tsx` — 404.
- `src/data.ts` — расширить `Product` слагом и содержанием для страницы
  (через `src/types.ts`).
- `src/types.ts` — добавить поля `slug: string`, `longDescription: string`,
  `faqs?: {q:string; a:string}[]` в `Product`.
- `src/components/Catalog.tsx` — обернуть карточку в `<a href>`.
- `public/sitemap.xml` — добавить товарные URL (или генерировать при сборке).
- `tests/example.spec.ts` — добавить тест навигации на товарную страницу.

**Out of scope** (НЕ трогать):

- `server.js`, `nginx.conf` — инфраструктура раздачи. SSG-`dist/` уже
  корректно раздается существующим `try_files` (нужно убедиться, что
  `nginx.conf location /` отдаёт 200 для новых путей — см. Maintenance).
- `index.html` global `<head>` (meta, OG, LocalBusiness JSON-LD) —
  остаётся как есть; per-page head добавляется через SSG.
- `src/components/Hero.tsx`, `HowWeWork.tsx`, `FeedbackSection.tsx`,
  `Header.tsx`, `Modal.tsx`, `SuccessState.tsx` — внутренности не править.
- Городские страницы доставки — отдельный будущий план (после этого).
- Сравнительные/FAQ-страницы как самостоятельные URL — будущий план.

## Git workflow

- Branch: `advisor/026-product-pages-routing`
- Commit per step; conventional commits (`feat(seo): ...`).
- НЕ пушить/PR без инструкции оператора.

## Steps

### Step 1: Установить react-router-dom

```bash
npm install react-router-dom
```

**Verify**: `node -e "require('react-router-dom')"` → exit 0. Проверить
совместимость с React 19 (`package.json` peerDeps). Если несовместимо —
STOP, доложить.

### Step 2: Расширить тип Product и данные

В `src/types.ts` расширить `Product` (поля пометить опциональными, чтобы
не ломать существующий `Catalog.tsx`):

```ts
export interface Product {
  // ... существующие поля ...
  slug?: string;            // URL-слаг, напр. "anthracite"
  longDescription?: string; // ~600-900 слов для товарной страницы
  faqs?: { q: string; a: string }[];
}
```

В `src/data.ts` для **каждого** из 8 товаров добавить `slug` и
`longDescription`. Слаг по кластерам (один слаг на несколько SKU —
см. «Map products to routes» ниже):

| slug              | Товары (id из data.ts)                          |
|-------------------|-------------------------------------------------|
| `anthracite`      | `anthracite-bags`, `anthracite-ton`             |
| `ugol-marki-t`    | `coal-t`                                        |
| `ugol-dg`         | `coal-dg`, `coal-dg-bags`                       |
| `drova`           | `firewood`                                      |
| `pesok-shcheben`  | `sand-gravel`                                   |
| `vyvoz-musora`    | `debris-removal`                                |

`longDescription` — написать содержательный копирайт на русском для
каждого кластера (~150–250 слов на страницу; полный объём 600–900
набирается спеками + FAQ). Темы: применение (котлы/печи/бани), марки,
фракции,为什么 наш склад, доставка по ДНР.

**Verify**: `npm run lint` → exit 0. `rg -n "slug:" src/data.ts | wc -l`
→ ≥6 (по числу кластеров; можно делить слаг между SKU).

### Step 3: Создать структуру роутов

Создать `src/routes/Home.tsx`, перенеся туда текущее содержимое `App.tsx`
(Hero+Catalog+HowWeWork+Feedback, без обёртки). `App.tsx` становится
layout-роутером:

```tsx
// src/App.tsx (упрощённо)
import { Routes, Route } from 'react-router-dom';
import Home from './routes/Home';
import ProductPage from './routes/ProductPage';
import NotFound from './routes/NotFound';
// ... Header, Footer, Modal остаются в layout ...

export default function App() {
  return (
    <>
      <Header ... />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:slug" element={<ProductPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <Modal ... />
    </>
  );
}
```

**Verify**: `npm run lint` → exit 0.

### Step 4: Создать ProductPage.tsx

`src/routes/ProductPage.tsx` — читает `:slug` из `useParams`, находит
товар(ы) по слагу в `PRODUCTS`, рендерит:

- `<h1>` — `{primaryName} в Донецке` (товар + город).
- Intro-параграф (`longDescription`).
- Таблицу спецификаций (переиспользовать разметку из `Catalog.tsx:167-222`).
- Ценовой блок.
- CTA-кнопка «Заказать» → открывает тот же Modal (пробросить
  `onSelectProduct` через контекст или пропсы layout).
- `Product` + `Offer` JSON-LD (static, см. Step 6).
- FAQ-секцию (если есть `faqs`) → `FAQPage` JSON-LD.

Стиль — тот же тёмный «уголь», Tailwind-классы по образцу `Hero.tsx`.

**Verify**: `npm run lint` → exit 0.

### Step 5: Каталог — обернуть карточки в ссылки

В `src/components/Catalog.tsx` обернуть карточку товара (блок
`Catalog.tsx:113-235`) в `<a href={\`/${product.slug}\`}>` (если `slug`
есть) или добавить отдельную ссылку «Подробнее» в карточку. Сохранить
кнопку «Рассчитать заказ» (.prevent default чтобы не переходить).

**Verify**: `npm run lint` → exit 0. Визуально: карточка кликабельна в
новую страницу.

### Step 6: Product/Offer JSON-LD

В `src/routes/ProductPage.tsx` добавить static JSON-LD через
`react-helmet-async` (или эквивалент SSG-хука). Целевая schema для одного
товара:

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "<название>",
  "image": ["https://goryasno.ru<image>"],
  "description": "<longDescription>",
  "brand": {"@type": "Brand", "name": "ГориЯсно"},
  "offers": {
    "@type": "Offer",
    "priceCurrency": "RUB",
    "price": "<число из priceEstimate>",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "referenceUnit": "<unit>"
    },
    "availability": "https://schema.org/InStock",
    "seller": {"@type": "Organization", "name": "ГориЯсно"}
  }
}
```

Для страниц с несколькими SKU (anthracite, ugol-dg) — массив `Offer` или
отдельный `Product` на SKU. Сверить с https://schema.org/Product.

**Verify**: после сборки `grep -c '"@type":"Product"\|"@type": "Product"'
dist/anthracite/index.html` → ≥1.

### Step 7: Пререндер новых роутов

В `src/main.tsx` (или `vite.config.ts` `ssgOptions`) включить crawl-mode
или явно перечислить роуты для пререндера. С `vite-react-ssg` по умолчанию
пререндерится то, что найдёт crawler по ссылкам с `/`. Убедиться, что
ссылки из `Catalog.tsx` (Step 5) ведут crawler по всем товарным страницам.

Альтернатива — явный список в `ssgOptions.includedPaths`:
`['/', '/anthracite', '/ugol-marki-t', '/ugol-dg', '/drova',
'/pesok-shcheben', '/vyvoz-musora']`.

**Verify**: `npm run build` → exit 0; `ls dist/` показывает директории
для каждого слага с `index.html` внутри:
```bash
ls dist/anthracite/index.html dist/drova/index.html
```
→ оба существуют.

### Step 8: Обновить sitemap.xml

В `public/sitemap.xml` добавить 6 товарных URL (или настроить
автогенерацию при сборке — опционально). Каждая запись: `<loc>`,
`<lastmod>` (дата сборки), `<changefreq>weekly</changefreq>`,
`<priority>0.8</priority>`.

**Verify**: `grep -c '<loc>' public/sitemap.xml` → ≥8 (главная + privacy
+ 6 товаров).

### Step 9: Дополнить e2e тестом навигации

В `tests/example.spec.ts` добавить тест: клик по карточке товара →
переход на `/anthracite` → виден H1 с названием товара.

Образец структуры — существующие тесты в этом файле (`test.beforeEach`
goto `/`).

**Verify**: `npm run dev &; sleep 3; npm run test; kill %1` → все тесты
(включая новый) pass.

### Step 10: Финальный гейт

```bash
bash scripts/run-quiet.sh verify
```

**Verify**: exit 0.

## Test plan

- **Новый e2e тест** в `tests/example.spec.ts`: навигация с главной на
  товарную страницу и проверка H1 (см. Step 9).
- **Новый e2e тест**: прямое открытие `/drova` → виден H1 «Дрова...».
- **Регресс**: все 4 существующих e2e теста проходят без правок.
- **Ручная проверка**: `dist/<slug>/index.html` открывается без JS и
  содержит H1 + название товара (доказательство пререндера).
- **Schema-валидация** (опционально): прогнать один товарный URL через
  https://search.google.com/test/rich-results — должен показывать Product.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0; `dist/<slug>/index.html` существует для
      всех 6 слагов
- [ ] `grep -c '<h1' dist/anthracite/index.html` → ≥1
- [ ] `grep -c '"@type":"Product"\|"@type": "Product"' dist/anthracite/index.html`
      → ≥1
- [ ] `grep -c '<loc>' public/sitemap.xml` → ≥8
- [ ] `npm run test` → все e2e (4 существующих + 1–2 новых) проходят
- [ ] `bash scripts/run-quiet.sh verify` → exit 0
- [ ] Никакие файлы вне in-scope списка не изменены (`git status`)
- [ ] `plans/README.md` строка статуса обновлена

## STOP conditions

Остановись и доложи, если:

- Код в «Current state» не совпадает с выдержками (код уехал).
- `react-router-dom` несовместим с React 19.
- SSG не пререндерит новые роуты после Step 7 (crawl не находит ссылки) и
  явный список `includedPaths` тоже не работает.
- Написание `longDescription` на русском для кластеров требует
  продуктовой/юридической информации, которой нет в репо (например,
  сертификация) — доложить и использовать заглушки с пометкой TODO.
- Фикс требует правки out-of-scope файла (Hero/FeedbackSection/Header).

## Maintenance notes

- **После этого плана** у сайта 6 индексируемых товарных страниц + главная.
  Новая инварианта: каждый товар из `data.ts` должен иметь `slug` и
  `longDescription`.
- **nginx.conf**: текущий `location / { try_files $uri $uri/ =404; }`
  корректно отдаёт `dist/<slug>/index.html`. **Но** SPA-fallback на
  unknown-роуты убран планом 024 (честный 404) — убедиться, что
  `NotFound.tsx` соответствует подходу 024 (server отдаёт реальный 404, а
  не 200 + клиентский 404). Свериться с `plans/024-real-404-for-unknown-urls.md`.
- **Будущие планы** (не этот): городские страницы доставки, FAQ-страницы,
  сравнительные страницы, страница «О складе» с E-E-A-T. Все они
  добавляются как новые роуты по той же схеме.
- **Ревьюер должен scrutinize**: (1) уникальные H1/title/description на
  каждой странице (без каннибализации с главной); (2) canonical
  self-referencing на каждой товарной; (3) `Product.price` — число, не
  строка с «от»; (4) hreflang не нужен (один язык); (5)noindex на
  `NotFound` и пагинации (если появится).
- **Отложено**: WebP-оптимизация картинок (план 027); GBP/2GIS/Yandex
  верификация (вне репо — операционная задача); кеш/gzip (план 028).
