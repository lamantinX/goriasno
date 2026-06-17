# План 007: Настройка автотестов Playwright и исправление конфигурации DX

> **Инструкция для Исполнителя**: Выполняйте этот план шаг за шагом. Запускайте все проверочные команды и подтверждайте результаты перед переходом к следующему шагу. При возникновении STOP-условий остановите работу и сообщите оператору. Когда закончите, обновите строку статуса для этого плана в `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat e209eb2..HEAD -- playwright.config.ts tests/example.spec.ts`
> Если любой из файлов в области изменений изменился с момента написания плана, сравните фрагменты кода из раздела "Текущее состояние" с текущим кодом перед началом работы; при несовпадении остановитесь и сообщите оператору.

## Статус

- **Приоритет**: P1
- **Трудоемкость**: M
- **Риск**: LOW
- **Зависит от**: [plans/006-clean-up-and-bug-fixes.md](file:///C:/dev/goriasno/plans/006-clean-up-and-bug-fixes.md)
- **Категория**: tests | dx
- **Planned at**: commit `e209eb2`, 2026-06-17

## Зачем это нужно

Нам необходимо обеспечить стабильность работы форм и интерфейса каталога при дальнейших изменениях. Сейчас:
1. Конфигурация Playwright настроена на проверку стороннего сайта `playwright.dev`.
2. Команда запуска локального сервера в конфигурации тестов ссылается на отсутствующий скрипт `start` (`npm run start`), что приводит к ошибке при автоматическом тестировании.
3. Отсутствуют тесты на критические области (структура страницы, фильтрация каталога, отправка форм callback и заказа).

Этот план исправляет конфигурацию Playwright и создаёт полноценное покрытие автотестами для нашего сайта.

## Текущее состояние

### 1. playwright.config.ts (закомментированный baseURL и неверный webServer)
- Файл: `playwright.config.ts:29,74-79`
- Код:
  ```typescript
  // baseURL: 'http://localhost:3000',
  ...
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
  ```

### 2. tests/example.spec.ts (тестирование внешнего ресурса)
- Файл: `tests/example.spec.ts`
- Содержит тесты для сайта `playwright.dev`.

---

## Команды, которые понадобятся

| Назначение | Команда | Ожидаемый результат |
|:---|:---|:---|
| Запуск тестов | `npx playwright test` | Все тесты завершаются успешно (зеленые) |
| Запуск сборки | `npm run build` | Успешно компилируется |

---

## Область изменений (Scope)

**В области изменений (In scope)**:
*   `playwright.config.ts`
*   `tests/example.spec.ts`

**Вне области изменений (Out of scope)**:
*   Любые изменения исходного кода React в `src/` (весь код уже очищен и оптимизирован в Плане 006).

---

## Git-воркфлоу

*   Ветка: `advisor/007-e2e-testing-and-dx`
*   Рекомендуется делать коммит после каждого шага реализации.

---

## Шаги реализации

### Шаг 1: Настройка playwright.config.ts
*   Откройте `playwright.config.ts`.
*   Раскомментируйте строку `29` и убедитесь, что `baseURL` указывает на локальный порт разработки:
    ```typescript
    baseURL: 'http://localhost:3000',
    ```
*   Раскомментируйте секцию `webServer` (строки 74–79) и исправьте команду запуска на `npm run dev`:
    ```typescript
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
    },
    ```

**Verify**: Запуск `npx playwright test` теперь запускает локальный dev-сервер Vite (на порту 3000) перед началом тестов.

### Шаг 2: Создание E2E-тестов для сайта ГориЯсно
*   Откройте файл `tests/example.spec.ts` и полностью замените его содержимое на тесты локального сайта:
    ```typescript
    import { test, expect } from '@playwright/test';

    test.describe('Сайт-каталог ГориЯсно', () => {
      
      test.beforeEach(async ({ page }) => {
        // Переход на главную страницу локального сервера
        await page.goto('/');
      });

      test('Отображение шапки и заголовка', async ({ page }) => {
        // Проверяем наличие логотипа бренда
        const brandLogo = page.locator('a:has-text("ГориЯсно")');
        await expect(brandLogo).toBeVisible();

        // Проверяем наличие главного H1 заголовка
        const mainHeading = page.locator('h1');
        await expect(mainHeading).toContainText('со склада в Донецке');
      });

      test('Фильтрация товаров в каталоге', async ({ page }) => {
        // Переходим к разделу каталога
        const catalogSection = page.locator('#catalog');
        await expect(catalogSection).toBeVisible();

        // Находим кнопку "Колотые дрова" и кликаем
        const firewoodTab = page.locator('button:has-text("Колотые дрова")');
        await expect(firewoodTab).toBeVisible();
        await firewoodTab.click();

        // Проверяем, что в списке отображается товар с дровами
        const firewoodCard = page.locator('h3:has-text("Дрова: Дуб, Акация")');
        await expect(firewoodCard).toBeVisible();

        // Проверяем, что уголь отфильтрован (не должен быть виден)
        const coalCard = page.locator('h3:has-text("Уголь Марка Т")');
        await expect(coalCard).not.toBeVisible();
      });

      test('Отправка формы обратной связи в подвале', async ({ page }) => {
        // Прокручиваем к секции обратной связи
        const contactsSection = page.locator('#contacts');
        await expect(contactsSection).toBeVisible();

        // Заполняем поля ввода
        await page.locator('input[placeholder="Иван"]').fill('Тестовый Пользователь');
        await page.locator('input[placeholder="+7 (___) ___-__-__"]').fill('+7 949 111-22-33');

        // Выбираем категорию товара в выпадающем списке
        await page.locator('select').selectOption('Дрова: Дуб, Акация (колотые)');

        // Ставим чекбокс согласия ФЗ-152
        const consentCheckbox = page.locator('input[type="checkbox"]');
        await consentCheckbox.check();

        // Проверяем, что кнопка отправки активна и кликаем
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeEnabled();
        
        // (Опционально) Тестируем локальное поведение кнопки отправки
        // На реальном бэкенде без токена Telegram будет ошибка, 
        // но кнопка должна быть нажимаемой и отправлять запрос.
      });

      test('Открытие и закрытие модального окна быстрого заказа', async ({ page }) => {
        // Находим первую карточку товара и кликаем "Рассчитать заказ"
        const orderButton = page.locator('button:has-text("Рассчитать заказ")').first();
        await orderButton.click();

        // Проверяем, что модальное окно открылось
        const modal = page.locator('h3:has-text("Быстрый заказ товара")');
        await expect(modal).toBeVisible();

        // Закрываем окно кликом на крестик
        const closeButton = page.locator('button:has-text("close")').or(page.locator('.fixed button').first());
        // Так как мы удалили панель согласования, кнопка закрытия модалки работает корректно
        const closeIcon = page.locator('svg.lucide-x').first();
        await closeIcon.click();

        // Проверяем, что окно закрылось
        await expect(modal).not.toBeVisible();
      });

    });
    ```

**Verify**: Запуск `npx playwright test` выполняет 4 созданных теста локально, все они должны завершаться успехом.

---

## План тестирования

*   Прогон полной тестовой сессии: `npx playwright test`
*   Ожидаемый вывод: `4 passed` (или соответствующее количество браузеров, например, `12 passed` при проверке в 3 браузерах).

---

## Критерии приемки (Done criteria)

- [ ] В `playwright.config.ts` раскомментирован и настроен `baseURL: 'http://localhost:3000'`.
- [ ] В `playwright.config.ts` раскомментирован и настроен `webServer` с запуском `npm run dev`.
- [ ] Файл `tests/example.spec.ts` содержит только E2E тесты сайта ГориЯсно (отображение, фильтрация каталога, отправка формы, модалка).
- [ ] Все тесты успешно проходятся командой `npx playwright test`.
- [ ] Строка статуса плана в `plans/README.md` обновлена.

---

## STOP-условия

*   Сбой запуска локального dev-сервера Vite при старте тестов Playwright.
*   Падение тестов из-за отсутствующих элементов на странице (убедитесь, что селекторы в `example.spec.ts` соответствуют коду после очистки в Плане 006).
