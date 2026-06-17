# План 006: Очистка кода, удаление калькулятора и панели согласования, исправление багов

> **Инструкция для Исполнителя**: Выполняйте этот план шаг за шагом. Запускайте все проверочные команды и подтверждайте результаты перед переходом к следующему шагу. При возникновении STOP-условий остановите работу и сообщите оператору. Когда закончите, обновите строку статуса для этого плана в `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat e209eb2..HEAD -- package.json public/sw.js server.js src/App.tsx src/types.ts src/components/Modal.tsx src/components/SuccessState.tsx`
> Если любой из файлов в области изменений изменился с момента написания плана, сравните фрагменты кода из раздела "Текущее состояние" с текущим кодом перед началом работы; при несовпадении остановитесь и сообщите оператору.

## Статус

- **Приоритет**: P1
- **Трудоемкость**: M
- **Риск**: LOW
- **Зависит от**: [plans/005-seo-and-verification.md](file:///C:/dev/goriasno/plans/005-seo-and-verification.md)
- **Категория**: bug | tech-debt
- **Planned at**: commit `e209eb2`, 2026-06-17

## Зачем это нужно

Этот план выполняет масштабную очистку кодовой базы и исправляет ряд технических ошибок:
1. **Предотвращение удаления исходного кода**: Исправляет ошибку в скрипте `clean`, удаляющую `server.js`.
2. **Активация Service Worker**: Убирает несуществующий в продакшене файл `/src/main.tsx` из списка предкэширования, что позволяет Service Worker успешно устанавливаться.
3. **Безопасная доставка заявок в Telegram**: Добавляет экранирование HTML в запросах к API Telegram, чтобы специальные символы (`<`, `>`, `&`) не приводили к ошибке 400 Bad Request.
4. **Удаление панели согласования**: Полностью удаляет интерактивный виджет отзывов и разметки с экрана.
5. **Удаление калькулятора**: Полностью вычищает неиспользуемый калькулятор доставки из интерфейса и типов.
6. **Фиксация дизайна**: Закрепляет теплую цветовую схему "cozy-wood" (теплые дрова) как единственную и проверяет читаемость.

## Текущее состояние

### 1. package.json (ошибка в clean)
- Файл: `package.json:10`
- Код:
  ```json
  "clean": "rm -rf dist server.js",
  ```

### 2. public/sw.js (ошибка в ASSETS)
- Файл: `public/sw.js:5`
- Код:
  ```javascript
  const ASSETS = [
    '/',
    '/index.html',
    '/src/main.tsx',
    '/fonts/...',
  ```

### 3. server.js (HTML-инъекция в Telegram)
- Файл: `server.js:28-36`
- Код:
  ```javascript
  const text = `
  🆕 <b>Новая заявка с сайта</b>
  
  👤 <b>Имя:</b> ${name || 'Не указано'}
  ...
  ```

### 4. src/App.tsx (активные комментарии и панель)
- В файле присутствуют импорты:
  ```typescript
  import DesignReviewToolbar from "./components/DesignReviewToolbar";
  ```
- Есть стейты `notes`, `hoveredNoteId` и обработчики кликов:
  ```typescript
  const [notes, setNotes] = useState<DesignNote[]>([]);
  ...
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => { ... }
  ```
- В рендере в самом конце вызывается `<DesignReviewToolbar ... />` и рендерятся оранжевые пины комментариев.
- Цветовая гамма сейчас динамическая через `config.theme`.

### 5. Калькулятор в коде
- В `App.tsx` стейты `calcDetails` и метод `handleSelectCalculatorForOrder` объявлены, но не вызываются с UI.
- В `Modal.tsx` и `SuccessState.tsx` есть блоки условного рендеринга деталей калькулятора (`formType === "calculator"` и `submission.calculatorDetails`).

---

## Команды, которые понадобятся

| Назначение | Команда | Ожидаемый результат |
|:---|:---|:---|
| Сборка проекта | `npm run build` | Успешно компилируется без ошибок |
| Проверка типов | `npm run lint` | Выполняет `tsc --noEmit` без ошибок |

---

## Область изменений (Scope)

**В области изменений (In scope)**:
*   `package.json`
*   `public/sw.js`
*   `server.js`
*   `src/App.tsx`
*   `src/types.ts`
*   `src/components/Modal.tsx`
*   `src/components/SuccessState.tsx`
*   `src/components/DesignReviewToolbar.tsx` (удалить полностью)

**Вне области изменений (Out of scope)**:
*   Изменение контента каталога товаров, шапки или подвала.
*   Удаление анимаций или изменение логики сборщика Vite.

---

## Git-воркфлоу

*   Ветка: `advisor/006-clean-up-and-bug-fixes`
*   Рекомендуется делать коммит после каждого шага реализации.

---

## Шаги реализации

### Шаг 1: Исправление скрипта clean в package.json
*   Откройте `package.json` и найдите строку `10`.
*   Измените скрипт `"clean"`:
    ```diff
    -    "clean": "rm -rf dist server.js",
    +    "clean": "rm -rf dist",
    ```

**Verify**: `npm run clean` не должен удалять файл `server.js`.

### Шаг 2: Исправление Service Worker
*   Откройте `public/sw.js`.
*   Удалите строку `5` с `'/src/main.tsx',`.

**Verify**: `npm run build` завершается успешно.

### Шаг 3: Добавление экранирования HTML в server.js
*   Откройте `server.js`.
*   Добавьте вспомогательную функцию экранирования HTML в начало файла (после импортов):
    ```javascript
    function escapeHTML(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }
    ```
*   Примените эту функцию ко всем входящим параметрам в обработчике `POST /api/leads`:
    ```javascript
    const name = escapeHTML(req.body.name);
    const phone = escapeHTML(req.body.phone);
    const productName = escapeHTML(req.body.productName);
    const message = escapeHTML(req.body.message);
    const sourceForm = escapeHTML(req.body.sourceForm);
    ```

**Verify**: `npm run build` проходит, сервер запускается через `node server.js`.

### Шаг 4: Удаление панели согласования и комментариев
*   Удалите файл `src/components/DesignReviewToolbar.tsx` полностью.
*   Откройте `src/App.tsx` и очистите его от логики правок:
    *   Удалите импорт `DesignReviewToolbar`.
    *   Удалите стейт `notes` (и его `useEffect` загрузки/сохранения), стейт `hoveredNoteId` и `containerRef`.
    *   Удалите функции `saveNotes`, `handlePageClick`, `deleteNote`, `clearSubmissions`, `simulateSampleSubmission`.
    *   Удалите обработчик кликов `onClick={handlePageClick}` и `ref={containerRef}` с корневого `div`.
    *   Удалите блок рендеринга меток (`notes.map(...)`).
    *   Удалите компонент `<DesignReviewToolbar ... />` в конце JSX.
    *   Удалите верхнюю презентационную плашку `Мкет Согласования Дизайна...` (строки 275–278).
    *   Замените стейт `config` на фиксированные значения (всегда `theme: "cozy-wood"` и `showGuides: false`):
        ```typescript
        const [config, setConfig] = useState<MockupConfig>({
          theme: "cozy-wood",
          showGuides: false,
          mockupStage: "landing",
          placedNotesEnabled: false,
        });
        ```

**Verify**: `npm run lint` не выдает ошибок импорта или отсутствующих переменных.

### Шаг 5: Удаление калькулятора из кода
*   Откройте `src/types.ts`:
    *   Удалите тип `calculatorDetails` из `FeedbackSubmission`.
    *   Уберите `"calculator"` из union-типа `sourceForm`.
*   Откройте `src/App.tsx`:
    *   Удалите стейт `calcDetails`.
    *   Измените тип `modalFormType` на `"callback" | "order"`.
    *   Удалите функцию `handleSelectCalculatorForOrder`.
    *   Удалите `calculatorDetails={calcDetails}` из пропсов `<Modal>`.
*   Откройте `src/components/Modal.tsx`:
    *   Удалите проп `calculatorDetails` из интерфейса `ModalProps` и деструктуризации компонента.
    *   Уберите `"calculator"` из типа `formType`.
    *   Удалите условие `formType === "calculator"` и соответствующий рендер деталей калькулятора в шапке (строки 188–209).
    *   Удалите сборку строки `calculatorDetails` в тексте заявки (строки 93–95).
    *   Удалите кнопку "Оформить заказ доставки" (строка 301).
*   Откройте `src/components/SuccessState.tsx`:
    *   Удалите проп `calculatorDetails` и условный рендер его параметров `submission.calculatorDetails` (строки 120–137).

**Verify**: `npm run lint` и `npm run build` завершаются успешно.

### Шаг 6: Проверка читаемости текста
*   При переключении на тему `cozy-wood` цвет основного текста становится `text-slate-350`, а акцентные надписи — `text-amber-500` на фоне `#0a0a0c`.
*   Убедитесь, что нигде не осталось слишком темного серого цвета на черном фоне.
*   Если есть элементы с цветом `text-slate-500` (например, дисклеймер оферты в футере или описания в HowWeWork), проверьте, чтобы они оставались читаемыми.

---

## План тестирования

*   Поскольку мы изменили структуры типов и удалили компоненты, основным тестом является успешность сборки и линтинга.
*   Команда проверки: `npm run build && npm run lint`.

---

## Критерии приемки (Done criteria)

- [ ] Файл `src/components/DesignReviewToolbar.tsx` полностью удален.
- [ ] Калькулятор (`calcDetails`, `handleSelectCalculatorForOrder`, тип `"calculator"`) полностью удален из React-компонентов и интерфейсов.
- [ ] Ошибка удаления `server.js` в скрипте `clean` исправлена.
- [ ] Исходный код `/src/main.tsx` убран из Service Worker `public/sw.js`.
- [ ] Telegram-сообщения экранируются функцией `escapeHTML` в `server.js`.
- [ ] Тема принудительно зафиксирована в состоянии как `"cozy-wood"`.
- [ ] Сборка проекта `npm run build` проходит без предупреждений и ошибок.
- [ ] Типизация `npm run lint` проходит с кодом 0.
- [ ] Строка статуса плана в `plans/README.md` обновлена.

---

## STOP-условия

*   Появление ошибок компиляции TypeScript после удаления компонентов, которые не удается исправить за 2 попытки.
*   Удаление рабочих элементов форм заказа товаров или обратного звонка (они должны остаться полностью функциональными).

---

## Примечания по поддержке

*   При изменении макетов в будущем учитывайте, что тема зафиксирована на уровне стейта `App.tsx` и не подлежит выбору пользователем.
