# Plan 027: Сокращение meta description + width/height картинок + WebP

> **Executor instructions**: Следуй плану шаг за шагом. Запускай каждую
> команду верификации. При срабатывании STOP-условия — остановись и доложи.
> По завершении обнови строку статуса в `plans/README.md`.
>
> **Drift check**: `git diff --stat dadeef4..HEAD -- index.html src/components/Catalog.tsx src/components/FeedbackSection.tsx public/images/products/`
> При расхождении выдержек с живым кодом — STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: none (независимо от 025/026; правит текущие файлы)
- **Category**: perf + on-page SEO
- **Planned at**: commit `dadeef4`, 2026-07-06

## Why this matters

Три быстрых выигрыша срочного характера:

1. **meta description на главной — 405 символов** (проверено: `wc -c`).
   Google показывает ~155–160 символов и обрезает корректно, но лишний
   текст не несёт пользы и разбавляет сигнал. Нужно ужать до ~150–160
   символов с самым сильным оффером.
2. **Картинки товаров — JPG 95–360 KB без WebP** (проверено `ls
   public/images/products/`: anthracite-bags.jpg 360 KB, firewood.jpg 266
   KB, debris-removal.jpg 181 KB). Для аудитории на медленном 3G в РФ это
   значимая доля LCP. WebP даёт 25–35% сжатия без потери качества при
   том же разрешении.
3. **У `<img>` нет `width`/`height`** (`Catalog.tsx:138`,
   `FeedbackSection.tsx:324`) — риск CLS (Cumulative Layout Shift), одна
   из Core Web Vitals.

Цель: meta description ≤160 символов, WebP-варианты всех товарных картинок
с `<picture>`-фолбэком, явные `width`/`height` на всех `<img>`.

## Current state

**Файлы** (роль + текущее состояние):

- `index.html:14` — meta description (405 символов):
  ```html
  <meta name="description" content="Угольный склад ГориЯсно в Донецке: антрацит АО/АМ/АС, уголь марки Т и ДГ, дрова (берёза, дуб, акация), песок, шлак, щебень, вывоз строительного мусора. Цены от 600 ₽/мешок, от 9000 ₽/т. Доставка по ДНР. Тел: +7 (949) 340-10-11, МТС: +7 (988) 994-68-96." />
  ```
- `src/components/Catalog.tsx:138-144` — `<img>` без размеров:
  ```tsx
  <img
    src={product.image}
    alt={product.name}
    loading="lazy"
    decoding="async"
    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
  />
  ```
- `src/components/FeedbackSection.tsx:324-330` — плейсхолдер карты без
  размеров.
- `public/images/products/` — 6 JPG (anthracite-bags, coal-dg, coal-ton,
  debris-removal, firewood, sand-gravel).
- `vite.config.ts` — **нет** плагина обработки изображений
  (`vite-imagetools`/`sharp`).

**Конвенции репо** (соблюдать):

- Tailwind v4; изображения через обычный `<img src="/images/...">` (не
  импортируются в JS).
- Self-hosted политика (план 010/012): никаких внешних CDN, всё в
  `public/`. WebP тоже клади локально.
- TypeScript strict; гейт `bash scripts/run-quiet.sh verify`.

## Commands you will need

| Purpose   | Command                          | Expected |
|-----------|----------------------------------|----------|
| Typecheck | `npm run lint`                   | exit 0   |
| Build     | `npm run build`                  | exit 0   |
| Verify    | `bash scripts/run-quiet.sh verify` | exit 0 |
| Image conv (если есть `cwebp`) | `cwebp -q 80 in.jpg -o out.webp` | exit 0 |

## Suggested executor toolkit

- Проверить наличие `cwebp` (часть libwebp): `which cwebp`. Если нет —
  установить через пакетный менеджер (`sudo apt install webp` на Debian/
  Ubuntu) ИЛИ использовать `sharp` через одноразовый Node-скрипт.
- Для проверки CLS после фикса — Chrome DevTools → Lighthouse → CLS score.

## Scope

**In scope** (только эти файлы):

- `index.html` — сократить meta description (строка 14).
- `public/images/products/*.webp` (новые файлы) — WebP-версии 6 картинок.
- `src/data.ts` — добавить опциональное поле `imageWebp?: string` в
  данные товаров ИЛИ использовать конвенцию `<image>.webp` рядом с jpg
  (предпочтительно — конвенция, меньше правок).
- `src/types.ts` — если добавляешь поле `imageWebp`, описать его.
- `src/components/Catalog.tsx` — заменить `<img>` на `<picture>` с
  WebP-source + jpg-fallback + `width`/`height`.
- `src/components/FeedbackSection.tsx` — добавить `width`/`height` к
  плейсхолдеру карты (строка ~324).

**Out of scope** (НЕ трогать):

- `src/components/Hero.tsx`, `HowWeWork.tsx`, `SuccessState.tsx`,
  `Header.tsx`, `Modal.tsx` — нет product-images без размеров.
- OG/Twitter images в `index.html` (`og:image`, `twitter:image`) —
  соцсети не все поддерживают WebP; оставить JPG. (Если хочется — отдельный
  будущий план.)
- `public/images/map-placeholder.svg` — SVG, размеры не критичны.
- `server.js`, `nginx.conf`, `public/sw.js`.

## Git workflow

- Branch: `advisor/027-meta-img-webp`
- Conventional commits: `perf(seo): trim meta desc, add webp + img dims`.
- НЕ пушить без инструкции.

## Steps

### Step 1: Сократить meta description

В `index.html:14` заменить содержимое `content=` на ужатую версию
(~150–160 символов). Предлагаемый текст (158 символов):

```
Антрацит, уголь Т и ДГ, дрова, песок и щебень со склада в Донецке. Цены от 600 ₽/мешок, от 9000 ₽/т. Доставка по ДНР в день звонка. Тел: +7 (949) 340-10-11.
```

Это сохраняет: ключевые товары, ценовые якоря, локальный модификатор
(Донецк/ДНР), один контактный телефон (второй есть на странице и в
schema). Убирает дублирование и перечисление всех пород дров.

**Verify**: `rg -o 'content="[^"]+"' index.html | head -1 | wc -c`
возвращает ~165 (длина строки + `content=""`).

### Step 2: Сгенерировать WebP-версии картинок

Для каждого из 6 JPG в `public/images/products/` создать `.webp` рядом:

```bash
cd public/images/products
for f in *.jpg; do
  cwebp -q 80 "$f" -o "${f%.jpg}.webp"
done
cd -
```

Если `cwebp` недоступен — STOP и доложить; предложить `sharp`-скрипт как
альтернативу (одноразовый `node convert-to-webp.mjs` через
`npm i -D sharp`, запустить, потом удалить).

**Verify**: `ls public/images/products/*.webp | wc -l` → 6. Размеры
WebP должны быть заметно меньше JPG (проверить: `du -b
public/images/products/anthracite-bags.{jpg,webp}`).

### Step 3: Добавить width/height в типы картинок (опционально)

Если выбираешь конвенцию `<image>.webp` (без нового поля в типе) —
пропусти шаг. Если добавляешь поле — в `src/types.ts`:
```ts
imageWebp?: string;
```
и в `src/data.ts` для каждого товара допиши `imageWebp: "/images/products/<slug>.webp"`.

**Рекомендация**: конвенция `<image>.webp` проще и требует меньше правок
— WebP-путь выводится из `product.image` заменой расширения. Используй её.

**Verify**: `npm run lint` → exit 0.

### Step 4: Catalog.tsx — `<picture>` + размеры

В `src/components/Catalog.tsx:138-144` заменить `<img>` на:

```tsx
{/* product.image = "/images/products/anthracite-bags.jpg" → webp */}
<picture>
  <source
    type="image/webp"
    srcSet={product.image.replace(/\.jpg$/, '.webp')}
  />
  <img
    src={product.image}
    alt={product.name}
    width={400}
    height={192}  /* h-48 = 12rem = 192px при 16px base */
    loading="lazy"
    decoding="async"
    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
  />
</picture>
```

`width`/`height` дают браузеру aspect-ratio до загрузки, устраняя CLS.
Реальные размеры картинок нужно проверить (`file public/images/products/*.jpg`
покажет dimensions) и вписать фактические — значение выше (400×192)
примерное; вписать реальные, чтобы не искажать.

**Verify**: `npm run lint` → exit 0. `rg -n 'width=|height='
src/components/Catalog.tsx` → ≥2 совпадения.

### Step 5: FeedbackSection.tsx — размеры плейсхолдера

В `src/components/FeedbackSection.tsx:324` (картинка map-placeholder.svg)
добавить `width`/`height` (контейнер `h-64` = 256px высоты; ширина 100%).
Поставить реальные intrinsic-размеры SVG (проверить через `file
public/images/map-placeholder.svg` или открыть в редакторе).

**Verify**: `npm run lint` → exit 0.

### Step 6: Сборка + verify gate

```bash
bash scripts/run-quiet.sh verify
```

**Verify**: exit 0.

### Step 7: Регресс e2e

```bash
npm run dev &
sleep 3
npm run test
kill %1
```

**Verify**: все 4 существующих теста проходят (визуальных регресс-тестов
нет, но catalog-test проверяет видимость карточек).

## Test plan

- **Новых unit/e2e тестов не требуется** — изменение косметическое +
  бинарные ассеты.
- Регресс: 4 существующих e2e должны проходить (каталог показывает
  картинки).
- **Ручная проверка** (желательно): Lighthouse → Performance → CLS ≤0.1
  и LCP improvement; Network → продукты грузятся как `image/webp`.

## Done criteria

Machine-checkable. ALL must hold:

- [ ] `index.html` meta description ≤160 символов (`rg -o
      'name="description" content="[^"]+"' index.html`)
- [ ] `ls public/images/products/*.webp | wc -l` → 6
- [ ] `rg -n 'width=|height=' src/components/Catalog.tsx` → ≥2
- [ ] `rg -n '<picture>' src/components/Catalog.tsx` → ≥1
- [ ] `npm run lint` exits 0
- [ ] `npm run build` exits 0
- [ ] `npm run test` → все 4 e2e проходят
- [ ] `bash scripts/run-quiet.sh verify` → exit 0
- [ ] Никакие файлы вне in-scope списка не изменены
- [ ] `plans/README.md` строка статуса обновлена

## STOP conditions

Остановись и доложи, если:

- `cwebp` недоступен и `sharp`-установка блокируется средой.
- Реальные размеры картинок сильно отличаются от assumption 400×192 и
  правка требует переделки layout (доложить размеры и попросить
  подтверждения).
- `<picture>` ломает существующий e2e тест каталога.
- Код в «Current state» не совпадает с выдержками.

## Maintenance notes

- **После этого плана** WebP — стандарт для товарных картинок. Будущие
  картинки клади сразу в JPG+WebP парой.
- **OG/Twitter images** остались JPG умышленно (совместимость с
  соцсетями) — если Facebook/X/Telegram начнут принимать WebP, можно
  переключить.
- **План 026** (товарные страницы) должен использовать тот же
  `<picture>`-паттерн для картинок на ProductPage.
- **Ревьюер**: проверить (1) реальные intrinsic-размеры в `width`/
  `height` (не заглушки); (2) что WebP реально отдаётся nginx (MIME-тип
  `image/webp` — добавить в `nginx.conf gzip_types` если нет, хотя
  binary-gzip неэффективен; проверить что `location ~* \.webp$` попадает в
  existing static-cache regex — `\.(?:...|webp)$` уже включает webp ✓).
- **Отложено**: AVIF (следующее поколение после WebP; требует broader
  browser support в РФ-аудитории); lazy-loading polyfill (нативный
  `loading="lazy"` поддерживается в РФ-браузерах достаточно давно).
