# Plan 005: Ленивая карта, серверная оптимизация и Pareto SEO (Локальное продвижение в топе)

> **Инструкция для Исполнителя**: Выполняйте этот план шаг за шагом. Запускайте все проверочные команды и подтверждайте результаты перед переходом к следующему шагу. При возникновении STOP-условий остановите работу и сообщите оператору.
>
> **Drift check (run first)**: `git diff --stat HEAD -- index.html src/components/FeedbackSection.tsx public/robots.txt public/sitemap.xml`

## Статус

- **Приоритет**: P2
- **Трудоемкость**: M
- **Риск**: LOW
- **Зависит от**: [plans/004-forms-and-integrations.md](file:///C:/dev/goriasno/plans/004-forms-and-integrations.md)
- **Категория**: docs | perf | seo
- **Planned at**: 2026-06-17

---

## Зачем это нужно

Для выхода сайта-каталога локального бизнеса (угольный склад, доставка дров в Донецке) в топ поисковых систем Yandex и Google по закону Парето:
1.  **Локальная разметка (Local Business Schema.org)**: Передает поисковым ботам точный адрес, телефон, координаты и часы работы.
2.  **Заглушка карты и ленивая загрузка**: Сберегает до 1.5 МБ трафика при первой загрузке страницы, повышая мобильную оценку Core Web Vitals (критично для ранжирования).
3.  **Локальные справочники (Яндекс.Карты, 2ГИС)**: Чек-лист по добавлению бизнеса на карты поисковиков (дает до 80% горячих заявок).
4.  **Сжатие статики на сервере**: Конфигурация Nginx для сжатия Gzip/Brotli и долгосрочного кэширования статики.

---

## Текущее состояние

Интеграция интерактивных карт отсутствует (вместо неё используется статичная картинка-заглушка). В `index.html` не прописаны структурированные данные JSON-LD и мета-теги. Файлы robots/sitemap отсутствуют.

---

## Команды, которые понадобятся

Проверка верности JSON-LD разметки с помощью валидаторов Schema.org или инструментов Яндекса/Google в браузере.

---

## Область изменений (Scope)

**В области изменений (In scope)**:
*   `index.html` (мета-теги Title/Description, OpenGraph, JSON-LD Schema.org)
*   `src/components/FeedbackSection.tsx` (добавить логику ленивой загрузки iframe карты в React при клике или скролле)
*   `public/robots.txt` (создать)
*   `public/sitemap.xml` (создать)
*   `nginx.conf` (создать конфигурационный файл Nginx для сжатия)
*   `docs/local_seo_checklist.md` (создать чек-лист локального SEO)

**Вне области изменений (Out of scope)**:
*   Интеграция тяжелых внешних карт без ленивой загрузки.

---

## Шаги реализации

### Шаг 1: Интеграция ленивой Яндекс.Карты в `FeedbackSection.tsx`
*   В `FeedbackSection.tsx` добавьте локальное состояние `const [loadMap, setLoadMap] = useState(false)`.
*   Сделайте так, чтобы при клике на оверлей-кнопку "Показать интерактивную карту" или при прокрутке до секции (через `useEffect` с `IntersectionObserver` на блок карты) значение `loadMap` переключалось в `true`.
*   Когда `loadMap === true`, заменяйте статичную картинку-заглушку на тег `<iframe>` с интерактивной Яндекс.Картой склада (например, с конструктора карт):
    ```tsx
    {loadMap ? (
      <iframe 
        src="https://yandex.ru/map-widget/v1/..." 
        width="100%" 
        height="100%" 
        frameBorder="0" 
        className="rounded-2xl"
      ></iframe>
    ) : (
      <div onClick={() => setLoadMap(true)} className="cursor-pointer">
        {/* Картинка-заглушка с кнопкой "Показать карту" */}
      </div>
    )}
    ```

### Шаг 2: Внедрение разметки Schema.org (JSON-LD)
*   В `<head>` файла `index.html` добавьте структурированные данные `LocalBusiness`:
    ```html
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "ГориЯсно — угольный склад",
      "image": "https://goryasno.ru/images/products/coal-anthracite.webp",
      "@id": "https://goryasno.ru",
      "url": "https://goryasno.ru",
      "telephone": "+79493401011",
      "priceRange": "$$",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "ул. Промышленная, 14",
        "addressLocality": "Донецк",
        "addressRegion": "ДНР",
        "postalCode": "283000",
        "addressCountry": "RU"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "48.015884", 
        "longitude": "37.80285"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "08:00",
        "closes": "18:00"
      }
    }
    </script>
    ```

### Шаг 3: Настройка мета-тегов в `index.html`
*   Задайте оптимизированные теги Title и Description:
    *   `<title>Купить уголь и дрова в Донецке со склада с доставкой | ГориЯсно</title>`
    *   `<meta name="description" content="Угольный склад в Донецке предлагает качественный сортовой уголь Антрацит и колотые дрова с доставкой по ДНР. Честный вес, личный контроль при погрузке. Звоните!" />`
*   Добавьте мета-теги OpenGraph (`og:title`, `og:description`, `og:image`, `og:url`).
*   Добавьте `<link rel="dns-prefetch" href="//api-maps.yandex.ru">` для ускорения разрешения DNS-имен карт.

### Шаг 4: Создание технических файлов (`robots.txt`, `sitemap.xml`)
*   Создайте файл `public/robots.txt` с правилами обхода:
    ```text
    User-agent: *
    Allow: /
    Sitemap: https://goryasno.ru/sitemap.xml
    ```
*   Создайте `public/sitemap.xml` с указанием URL-адреса главной страницы.

### Шаг 5: Конфигурация Nginx для кэширования и сжатия (`nginx.conf`)
*   Создайте файл `nginx.conf` в корне с правилами сжатия:
    ```nginx
    server {
        listen 80;
        server_name goryasno.ru;
        root /usr/share/nginx/html;
        index index.html;

        # Gzip сжатие
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
        gzip_min_length 1000;

        # Кэширование статических ресурсов (шрифты, изображения) на 1 год
        location ~* \.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|svg|webp)$ {
            expires 1y;
            add_header Cache-Control "public, no-transform";
        }

        location / {
            try_files $uri $uri/ /index.html;
        }
    }
    ```

### Шаг 6: Создание чек-листа для регистрации в справочниках
*   Создайте файл `docs/local_seo_checklist.md` с пошаговой инструкцией для владельца склада:
    1.  Регистрация в **Яндекс.Бизнес** (с привязкой сайта, заполнением карточки товаров и регулярным обновлением фото).
    2.  Регистрация в **2ГИС** для локального охвата служб снабжения Донецка.
    3.  Регистрация в **Google My Business**.

---

## Критерии приемки (Done criteria)

- [ ] Интерактивная карта загружается лениво (только после взаимодействия пользователя с блоком)
- [ ] В `index.html` добавлены мета-теги и разметка Schema.org (JSON-LD)
- [ ] Созданы файлы `public/robots.txt`, `public/sitemap.xml` и `nginx.conf`
- [ ] Создан файл-инструкция `docs/local_seo_checklist.md`
- [ ] Проект успешно компилируется через `npm run build`
- [ ] `plans/README.md` строка статуса обновлена на DONE

---

## STOP-условия

*   Использование интерактивных виджетов карт с автозагрузкой при открытии страницы.
*   Ошибки валидации Schema.org разметки.
