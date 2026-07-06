# План реализации: Сайт-каталог "#ГориЯсно#" (React + Vite + Tailwind v4)

Этот каталог содержит пошаговый план разработки сайта-каталога "#ГориЯсно#"
для угольного склада в Донецке на основе согласованного макета. Планы
спроектированы для достижения максимальной скорости загрузки на плохом
3G-интернете в РФ с учетом блокировок и замедления зарубежных сервисов.

Планы 001–007 (первоначальная сборка сайта) — все DONE. Планы 008–017
сгенерированы аудитом `/improve` 2026-06-17 (commit `69c19dc`) для исправления
найденных багов, техдолга и усиления DX/безопасности. Планы 019–024
сгенерированы аудитом `/improve` 2026-06-30 (commit `b1ac6d3`) — баг модалки,
FZ-152 на сервере, a11y, security-заголовки и честный 404; выполнены через
`execute` (ветки `advisor/*`, merge `c3bf4dd`). Планы 025–029 сгенерированы
SEO-аудитом + `/improve plan` 2026-07-06 (commit `dadeef4`) — устранение
нулевых показов в GSC через статический пререндер, товарные страницы,
WebP-оптимизацию и NAP-консистентность. Каждый план самодостаточен —
исполнитель читает только файл плана.

## Порядок выполнения и статус

| Шаг | Файл плана | Приоритет | Трудоемкость | Зависимости | Статус |
|:---|:---|:---:|:---:|:---|:---:|
| 001 | [plans/001-setup-design-system.md](plans/001-setup-design-system.md) | P1 | S | — | DONE |
| 002 | [plans/002-layout-and-hero.md](plans/002-layout-and-hero.md) | P1 | M | 001 | DONE |
| 003 | [plans/003-catalog-and-filters.md](plans/003-catalog-and-filters.md) | P1 | M | 002 | DONE |
| 004 | [plans/004-forms-and-integrations.md](plans/004-forms-and-integrations.md) | P1 | M | 003 | DONE |
| 005 | [plans/005-seo-and-verification.md](plans/005-seo-and-verification.md) | P2 | M | 004 | DONE |
| 006 | [plans/006-clean-up-and-bug-fixes.md](plans/006-clean-up-and-bug-fixes.md) | P1 | M | 005 | DONE |
| 007 | [plans/007-e2e-testing-and-dx.md](plans/007-e2e-testing-and-dx.md) | P1 | M | 006 | DONE |
| 008 | [plans/008-stale-e2e-suite.md](plans/008-stale-e2e-suite.md) | P1 | M | — | DONE |
| 009 | [plans/009-undefined-tailwind-color-tokens.md](plans/009-undefined-tailwind-color-tokens.md) | P1 | S-M | — | DONE |
| 010 | [plans/010-self-hosted-fonts-fix.md](plans/010-self-hosted-fonts-fix.md) | P1 | M | 009 | DONE |
| 011 | [plans/011-service-worker-fix.md](plans/011-service-worker-fix.md) | P1 | M | 010 | DONE |
| 012 | [plans/012-self-host-map-media-hygiene.md](plans/012-self-host-map-media-hygiene.md) | P2 | S | — | DONE |
| 013 | [plans/013-small-correctness-fixes.md](plans/013-small-correctness-fixes.md) | P2 | S | — | DONE |
| 014 | [plans/014-dead-code-cleanup.md](plans/014-dead-code-cleanup.md) | P2 | M | 012, 013 | DONE |
| 015 | [plans/015-ai-studio-template-leftovers.md](plans/015-ai-studio-template-leftovers.md) | P2 | S | — | DONE |
| 016 | [plans/016-security-headers.md](plans/016-security-headers.md) | P2 | S | 012 | DONE |
| 017 | [plans/017-strict-typecheck-and-linter.md](plans/017-strict-typecheck-and-linter.md) | P3 | M | 014, 015 | DONE |
| 018 | [plans/018-quiet-test-output.md](plans/018-quiet-test-output.md) | P2 | S | — | DONE |
| 019 | [plans/019-modal-hook-order-crash.md](plans/019-modal-hook-order-crash.md) | P1 | S | — | DONE |
| 020 | [plans/020-server-consent-enforcement.md](plans/020-server-consent-enforcement.md) | P1 | S | — | DONE |
| 021 | [plans/021-form-a11y-labels-and-contrast.md](plans/021-form-a11y-labels-and-contrast.md) | P2 | S | — | DONE |
| 022 | [plans/022-main-landmark-and-focus-visible.md](plans/022-main-landmark-and-focus-visible.md) | P2 | S | — | DONE |
| 023 | [plans/023-headers-csp-twitter-card.md](plans/023-headers-csp-twitter-card.md) | P2 | S | — | DONE |
| 024 | [plans/024-real-404-for-unknown-urls.md](plans/024-real-404-for-unknown-urls.md) | P2 | S | — | DONE |
| 025 | [plans/025-static-prerender-home.md](plans/025-static-prerender-home.md) | P1 | M | — | DONE |
| 026 | [plans/026-product-pages-routing.md](plans/026-product-pages-routing.md) | P1 | L | 025 | DONE |
| 027 | [plans/027-meta-img-webp.md](plans/027-meta-img-webp.md) | P2 | M | — | DONE |
| 028 | [plans/028-server-cache-gzip.md](plans/028-server-cache-gzip.md) | P3 | S | — | DONE |
| 029 | [plans/029-seo-checklist-nap.md](plans/029-seo-checklist-nap.md) | P3 | S | — | DONE |

*Значения статуса: `TODO` | `IN PROGRESS` | `DONE` | `BLOCKED` (с причиной
в одну строку) | `REJECTED` (с обоснованием в одну строку)*

## Зависимости (планы 008–017)

Рекомендуемый порядок выполнения:

> **Сначала блок 008–017** (техдолг и DX первоначального аудита), **затем
> блок 025–029** (SEO-аудит 2026-07-06) — см. отдельную секцию ниже.

1. **008** (E2E) — первым: восстанавливает верификационныйbaseline, чтобы
   последующие планы можно было проверять. Не зависит ни от чего.
2. **009** (цвета `@theme`) — независимо; правит только `src/index.css`
   (`--color-*` токены).
3. **010** (шрифты) — зависит от 009 (оба правят `src/index.css`, но разные
   секции: 009 — `--color-*`, 010 — `@font-face`/`--font-*`). Меняет шрифты
   на `@fontsource` (хэшированные `dist/assets`), удаляет `public/fonts/*`,
   прореживает `public/sw.js` `ASSETS` до `['/', '/index.html']`.
4. **011** (Service Worker) — зависит от 010 (шрифты уже хэшированные в
   `dist/assets`, `ASSETS` уже прорежен). Полная переработка SW.
5. **012** (карта/медиа) — независимо; самохостинг SVG-плейсхолдера +
   гигиена iframe. Правит `FeedbackSection.tsx`, `SuccessState.tsx`.
6. **013** (мелкие баги) — независимо; Hero scroll-target + Sunday в
   JSON-LD. Правит `Hero.tsx`, `index.html`.
7. **014** (мёртвый код) — зависит от 012 и 013 (правит те же файлы
   `Hero.tsx`/`FeedbackSection.tsx` для drive-by fix-ups, поэтому должен
   идти после их стабилизации).
8. **015** (AI Studio leftovers) — независимо; удаляет `@google/genai` +
   `motion`, переписывает `README.md` и `.env.example`, правит строку в
   этом файле (см. ниже).
9. **016** (security headers) — зависит от 012 (CSP использует
   `img-src 'self'` — внешних Unsplash-картинок уже не должно быть).
   Правит `nginx.conf` + `server.js`.
10. **017** (strict typecheck + linter) — зависит от 014 и 015; выполнять
    ПОСЛЕДНИМ. Включение `noUnusedLocals` должно находить чистую кодовую
    базу после очистки 014/015, иначе всплывёт большая пачка ошибок.

### 018 (Meta-harness, вне набора 008–017)

**018** (quiet test output) — независимый Meta-harness план (не продуктный
аудит). Добавляет `scripts/run-quiet.sh` — обёртку, которая гоняет
`npm run <script>` без вывода в контекст агента на успехе и печатает вывод
только на провале. Правит `AGENTS.md`, `docs/harness/README.md`,
`.claude/rules/testing.md` (документация контракт тест-команд). НЕ правит
`package.json` (иначе Core-risk). Не зависит от 008–017 и не блокирует их;
можно выполнять в любой момент.

Конфликты общих файлов (учтены в зависимостях):
- `src/index.css` — 009 и 010 (разные секции, 010 зависит от 009).
- `public/sw.js` — 010 (prune) и 011 (rewrite); 011 после 010.
- `src/components/FeedbackSection.tsx` — 012 (карта), 014 (`substr` fix);
  014 после 012.
- `src/components/Hero.tsx` — 013 (scroll), 014 (удаление импорта
  `DELIVERY_AREAS`); 014 после 013.
- `index.html` — 013 (Sunday в JSON-LD).
- `nginx.conf`, `server.js` — 016.
- `tsconfig.json`, `package.json`, `biome.json` — 017.

## Находки, рассмотренные и отклонённые (Findings considered and rejected)

Чтобы не переаудировать в следующий раз:

- **Удаление 3-сторонней темы** (`slate-fire`/`cool-slate`/`cozy-wood` и всех
  `getTheme*Class()` в 7 компонентах): план 006 сознательно зафиксировал
  тему `cozy-wood` «как единственную», но ветвление оставил — это
  by-design по decision-doc. Не находка. План 009 лишь определяет
  мёртвые цветовые токены (`orange-550`/`sky-450`/`sky-550`), чтобы
  мёртвые ветки не ломались дальше; сама система темы не удаляется.
- **`public/privacy.html` отсутствует**: проверено — файл существует,
  ссылки согласия работают. Не находка.
- **Несоответствие `og:url`/`@id` домену**: проверено — `goryasno.ru` это
  прод-канон (nip.io — staging по `DEPLOY_NIP_IO.md`). Не находка.
- **Размер бандла от `motion`/`@google/genai`**: tree-shaken (не
  импортируются) → на бандл не влияют, только install/DX. Это находка #9
  (план 015), не perf-находка.
- **D1 vite-plugin-pwa (направление)**: не выбрано пользователем; план 011
  чинит hand-rolled SW вместо этого. Если позже выбрано D1 — план 011
  superseded (удалить `public/sw.js` и регистрацию в `main.tsx`).
- **D2 Product JSON-LD (направление)**: не выбрано; `data.ts` уже содержит
  данные для будущего Product/Offer schema. Не отклонено, просто не
  запланировано.
- **D3 Delivery-zone rate display (направление)**: не выбрано; `DELIVERY_AREAS`
  сохранён в `data.ts` (план 014 удаляет только неиспользуемый импорт из
  Hero, не экспорт), чтобы D3 можно было реализовать позже.
- **#12 Modal a11y (Escape/focus trap)**: не выбрано пользователем для
  планирования; остаётся открытой находкой для будущего плана. Не
  отклонено по существу — просто вне текущего набора.

---

## Зависимости и порядок (планы 025–029, SEO-аудит 2026-07-06)

Блок устраняет структурные SEO-проблемы, выявленные аудитом goryasno.ru:
сервер отдаёт пустой `<div id="root"></div>` (весь контент — client-rendered
React), сайт состоит из одного URL, картинки без WebP/размеров, NAP в
`docs/local_seo_checklist.md` разошёлся с кодом.

Рекомендуемый порядок:

1. **025** (статический пререндер `/`) — P1, фундамент. Переводит
   одностраничный Vite+React на `vite-react-ssg`, чтобы HTML главной
   содержал реальный H1/контент. Блокирующая находка №1 аудита. Не
   зависит ни от чего.
2. **026** (товарные страницы + роутинг) — P1, крупнейший лифт. **Зависит
   от 025** (нужен SSG-пайплайн для пререндера новых роутов). Добавляет
   react-router, 6 товарных кластер-страниц (`/anthracite`, `/ugol-marki-t`,
   `/ugol-dg`, `/drova`, `/pesok-shcheben`, `/vyvoz-musora`) с
   `Product`+`Offer` JSON-LD и real `<a href>` ссылками с главной. Это
   находка №2 и №9.
3. **027** (meta description + WebP + img dimensions) — P2, быстрый
   выигрыш. Независимо от 025/026 (правит текущие файлы). meta description
   405 символов → ≤160; WebP для 6 товарных картинок (95–360 KB JPG);
   `width`/`height` на `<img>` против CLS.
4. **028** (кеш/gzip для server.js) — P3, fidelity dev/preview. Прод уже
   на nginx с gzip+1y-кешем; этот план приводит Express-сервер в
   соответствие. Независимо.
5. **029** (NAP в чек-листе) — P3, тривиальная правка документации.
   Независимо. Приводит `docs/local_seo_checklist.md` в соответствие с
   каноническим адресом «Углегорская, 1».

Конфликты общих файлов (учтены в зависимостях):

- `src/main.tsx` — 025 (SSG-точка входа) и 026 (роуты). **026 после 025.**
- `src/App.tsx` — 025 (гидрация) и 026 (превращение в layout-router). **026
  после 025.**
- `vite.config.ts` — 025 (`ssgOptions`), 026 (расширение ssgOptions для
  новых роутов). **026 после 025.**
- `src/data.ts`, `src/types.ts` — 026 (новые поля `slug`/`longDescription`)
  и 027 (опц. `imageWebp`, если выбран не path-convention подход).
- `src/components/Catalog.tsx` — 026 (обернуть карточку в `<a href>`) и
  027 (`<picture>` + размеры). Если оба в работе — координировать порядок
  (027 менять `<img>` → `<picture>` внутри карточки, 026 оборачивать всю
  карточку; **027 после 026**, либо объединить правку Catalog.tsx в одном
  PR).
- `public/sitemap.xml` — только 026.

### Что НЕ вошло в планирование (открытые направления из SEO-аудита)

Чтобы не переаудировать:

- **Городские страницы доставки** (Макеевка/Ясиноватая/Харцызск/Мариуполь):
  явная находка, но требует продуктовых решений по контенту (какие города,
  индивидуальные условия доставки). Будущий план после 026 —
  переиспользовать паттерн товарных страниц.
- **Страница «О складе» + E-E-A-T-контент** (годы работы, тоннаж,
  сертификация 60-тонных весов с фото): требует оригинальных фото и
  фактических данных от заказчика. Будущий план.
- **FAQ-страницы с `FAQPage` schema**: упоминается в плане 026 как
  опциональная часть товарных страниц; самостоятельные FAQ-URL — будущий
  план.
- **Сравнительные страницы** («антрацит vs уголь Т»): продуктовый контент,
  будущий план.
- **`AggregateRating`/`Review` schema**: требует реальных отзывов,
  которых пока нет в репо. Будущий план после сбора отзывов.
- **GBP/2GIS/Yandex.Business верификация и листинги**: операционная
  задача владельца бизнеса, **вне кода**. Чек-лист в
  `docs/local_seo_checklist.md` (план 029 правит там адрес) —
  исполнительный документ, но сами профили заводятся вручную.
- **Yandex.Webmaster / Bing Webmaster Tools верификация**: добавить
  файлы `yandex_*.xml`/`BingSiteAuth.xml` в `public/` — тривиально после
  регистрации в этих сервисах; не требует плана, просто drop-in файлов +
  redeploy.
- **AVIF (след. поколение после WebP)**: broader browser support в
  РФ-аудитории пока недостаточен; отложено.

---

## Архитектура и стек проекта

Сайт спроектирован как ультра-оптимизированное React-приложение:
*   **Стек**: React 19, Vite 6, TypeScript, Tailwind CSS v4 (с плагином
    `@tailwindcss/vite`), Lucide React для иконок. Анимации — CSS keyframes
    + утилиты Tailwind (`animate-*`). *(Framer Motion удалён планом 015 как
    неиспользуемый.)*
*   **Дизайн**: Идентичный согласованному макету (глубокий темный стиль
    "угольный" `#0a0a0c`, огненные желто-оранжевые акценты). Полная
    мобильная адаптивность.
*   **Оптимизация производительности для РФ**:
    *   *Self-Hosted*: Все шрифты (WOFF2 через `@fontsource`, план 010) и
        ресурсы хранятся локально (отказ от внешних CDNs).
    *   *Ленивая загрузка медиа*: Атрибуты `loading="lazy"` на всех
        изображениях каталога и карте (план 012).
    *   *Ленивая загрузка карт*: Интерактивная Яндекс.Карта подгружается
        через iframe динамически по клик-оверлею, экономя трафик.
    *   *Offline-first (PWA)*: Service Worker с app-shell кэшированием и
        версионной очисткой (план 011).
    *   *Безопасный Telegram-релей*: Express.js бэкенд (`server.js`) принимает
        заявки и пересылает в Telegram. Токен бота в `.env`, не утекает на
        клиент. Security headers — план 016.
    *   *Сжатие и кэширование*: `nginx.conf` (Gzip + кэш статики + security
        headers).
    *   *Соответствие законодательству РФ*: Согласие ФЗ-152 под формами,
        ссылка на Политику конфиденциальности (`public/privacy.html`),
        дисклеймер оферты по ст. 437 ГК РФ.
