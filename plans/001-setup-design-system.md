# Plan 001: Инициализация, локализация шрифтов, настройка Tailwind v4 и Service Worker (PWA)

> **Инструкция для Исполнителя**: Выполняйте этот план шаг за шагом. Запускайте все проверочные команды и подтверждайте результаты перед переходом к следующему шагу. При возникновении STOP-условий остановите работу и сообщите оператору.
>
> **Drift check (run first)**: `git diff --stat HEAD -- src/index.css src/main.tsx package.json`

## Статус

- **Приоритет**: P1
- **Трудоемкость**: S
- **Риск**: LOW
- **Зависит от**: none
- **Категория**: dx | perf | design
- **Planned at**: 2026-06-17

---

## Зачем это нужно

Для обеспечения максимальной скорости загрузки на плохом 3G-интернете в РФ и обхода замедления/блокировок внешних Google Fonts:
1.  **Локальные шрифты (Self-hosted WOFF2)** устраняют внешние запросы к Google Fonts.
2.  **Service Worker (PWA)** кэширует статику локально в браузере, позволяя сайту загружаться мгновенно при повторном входе.
3.  **Tailwind v4 `@theme`** определяет дизайн-систему (шрифты Rubik, Outfit, Playfair Display, цвета Slate & Fire) в едином месте.

---

## Текущее состояние

Проект содержит React-код с внешним импортом Google Fonts в `src/index.css`. Service Worker отсутствует. Зависимости установлены.

---

## Команды, которые понадобятся

| Назначение | Команда | Ожидаемый результат |
|:---|:---|:---|
| Проверка сборки | `npm run build` | Успешная компиляция без ошибок TS/Vite |
| Локальный запуск | `npm run dev` | dev-сервер запущен на http://localhost:3000 |

---

## Область изменений (Scope)

**В области изменений (In scope)**:
*   `src/index.css` (убрать Google Fonts `@import`, добавить `@font-face` для локальных файлов, настроить `@theme` в Tailwind v4)
*   `public/fonts/` (создать папку и положить локальные woff2 файлы для Outfit, Rubik, Playfair Display)
*   `public/sw.js` (создать Service Worker для кэширования статики)
*   `src/main.tsx` (добавить регистрацию Service Worker)

**Вне области изменений (Out of scope)**:
*   Внешние CDN ссылки и Google Fonts.
*   Кастомная логика анимаций (пока используем существующие motion-компоненты).

---

## Шаги реализации

### Шаг 1: Скачивание и добавление локальных шрифтов
*   Создайте папку `public/fonts/`.
*   Поместите туда woff2-версии шрифтов:
    *   Outfit (Regular, Medium, Bold)
    *   Rubik (Regular, Medium, Bold)
    *   Playfair Display (Regular, Bold)
*   *Примечание*: Вы можете использовать готовые woff2 файлы или сгенерировать их.

### Шаг 2: Настройка `src/index.css`
*   Удалите первую строчку с `@import url('https://fonts.googleapis.com/...')`.
*   Добавьте правила `@font-face` для локальных шрифтов, например:
    ```css
    @font-face {
      font-family: 'Outfit';
      src: url('/fonts/Outfit-Regular.woff2') format('woff2');
      font-weight: 400;
      font-style: normal;
      font-display: swap;
    }
    /* Повторить для остальных начертаний и шрифтов Rubik и Playfair Display */
    ```
*   Убедитесь, что `@theme` в Tailwind v4 правильно мапит шрифты:
    ```css
    @theme {
      --font-display: "Rubik", sans-serif;
      --font-sans: "Outfit", sans-serif;
      --font-serif: "Playfair Display", serif;
    }
    ```

### Шаг 3: Реализация Service Worker в `public/sw.js`
*   Создайте файл `public/sw.js` с базовым кэшированием Cache-First:
    ```javascript
    const CACHE_NAME = 'goryasno-v1';
    const ASSETS = [
      '/',
      '/index.html',
      '/src/main.tsx',
      '/fonts/Outfit-Regular.woff2',
      '/fonts/Rubik-Bold.woff2',
      '/fonts/PlayfairDisplay-Regular.woff2',
    ];

    self.addEventListener('install', (e) => {
      e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
      );
    });

    self.addEventListener('fetch', (e) => {
      e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
          return cachedResponse || fetch(e.request).then((response) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, response.clone());
              return response;
            });
          });
        })
      );
    });
    ```

### Шаг 4: Регистрация SW в `src/main.tsx`
*   В конец `src/main.tsx` добавьте регистрацию Service Worker:
    ```typescript
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(reg => console.log('SW registered:', reg))
          .catch(err => console.error('SW registration failed:', err));
      });
    }
    ```

---

## Критерии приемки (Done criteria)

- [ ] Удалены все внешние импорты шрифтов в `src/index.css`
- [ ] Шрифты Outfit, Rubik, Playfair Display загружаются локально из `/fonts/`
- [ ] Service Worker регистрируется на клиенте при сборке и запуске приложения
- [ ] Проект успешно собирается через `npm run build`
- [ ] `plans/README.md` строка статуса обновлена на DONE после прохождения

---

## STOP-условия

*   Ошибки сборки Vite из-за отсутствующих файлов шрифтов или некорректных путей.
*   Сохранение внешних запросов к `fonts.googleapis.com` в панели Network.
