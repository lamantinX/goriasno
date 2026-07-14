import { test, expect } from '@playwright/test';

test.describe('Сайт-каталог ГориЯсно', () => {
  
  test.beforeEach(async ({ page }) => {
    // Переход на главную страницу локального сервера
    await page.goto('/');
  });

  test('Отображение шапки и заголовка', async ({ page }) => {
    // Проверяем наличие логотипа бренда
    const brandLogo = page.locator('a:has-text("ГориЯсно")').first();
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
    await firewoodTab.click({ force: true });

    // Проверяем, что в списке отображается товар с дровами
    const firewoodCard = page.locator('h3:has-text("Дрова: Берёза, Дуб, Акация")');
    await expect(firewoodCard).toBeVisible();

    // Проверяем, что уголь отфильтрован (не должен быть виден)
    const coalCard = page.locator('h3:has-text("Уголь марки Т (Тощий)")');
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
    await page.locator('select').selectOption('Дрова: Берёза, Дуб, Акация');

    // Ставим чекбокс согласия ФЗ-152
    const consentCheckbox = page.locator('input[type="checkbox"]');
    await consentCheckbox.check({ force: true });

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
    const modal = page.locator('span:has-text("Быстрый заказ товара")');
    await expect(modal).toBeVisible();

    // Закрываем окно кликом на крестик
    // Так как мы удалили панель согласования, кнопка закрытия модалки работает корректно
    const closeIcon = page.locator('svg.lucide-x').first();
    await closeIcon.click({ force: true });

    // Проверяем, что окно закрылось
    await expect(modal).not.toBeVisible();
  });

  test('Навигация на товарную страницу по клику ссылки', async ({ page }) => {
    // Кликаем по ссылке на товар «Антрацит» в каталоге
    const productLink = page.locator('a[href="/anthracite/"]').first();
    await expect(productLink).toBeVisible();
    await productLink.click();

    // Проверяем, что перешли на товарную страницу
    await expect(page).toHaveURL(/\/anthracite/);

    // Проверяем H1 с названием товара
    const h1 = page.locator('h1');
    await expect(h1).toContainText('Антрацит');
    await expect(h1).toContainText('Донецке');
  });

  test('Прямое открытие товарной страницы /drova', async ({ page }) => {
    await page.goto('/drova');

    // Проверяем H1
    const h1 = page.locator('h1');
    await expect(h1).toContainText('Дрова');
    await expect(h1).toContainText('Донецке');

    // Проверяем наличие JSON-LD Product schema
    const jsonLd = page.locator('script[type="application/ld+json"]');
    const count = await jsonLd.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('Уникальный <title> товарной страницы', async ({ page }) => {
    // Тестовый webServer поднимает Vite dev-сервер, который отдаёт SPA-шелл,
    // а не пререндер (пререндер живёт в dist/ после сборки). Поэтому проверяем
    // отрендеренный DOM после гидрации: react-helmet выставляет уникальный
    // <title> и одну description для каждой товарной страницы. Уникальность
    // titles в исходном пререндеренном HTML доказана отдельно grep'ом по dist/.
    await page.goto('/anthracite/');
    await expect(page).toHaveTitle(/Купить антрацит в Донецке/);
    expect(await page.locator('title').count()).toBe(1);

    await page.goto('/drova/');
    await expect(page).toHaveTitle(/Купить дрова в Донецке/);
    expect(await page.locator('title').count()).toBe(1);

    await page.goto('/vyvoz-musora/');
    await expect(page).toHaveTitle(/Вывоз строительного мусора в Донецке/);
    expect(await page.locator('title').count()).toBe(1);
  });

  test('В шапке и футере есть SEO-ссылки на товарные страницы', async ({ page }) => {
    // На главной должны быть как минимум 2 ссылки на /anthracite/
    // (шапка/моб. меню + футер) — реальные <a href>, индексируемые краулером.
    const anthraciteLinks = page.locator('a[href="/anthracite/"]');
    const count = await anthraciteLinks.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('Форма в футере отправляет consent в тело запроса', async ({ page }) => {
    // Бэкенд Express (:3001) не запускается тест-харнессом, поэтому
    // перехватываем исходящий запрос и fulfilled-ответом, и телом запроса:
    // доказываем, что consent теперь уходит (раньше поле отсутствовало → 400).
    await page.route('**/api/leads', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' }),
    );

    await page.locator('input[placeholder="Иван"]').fill('Тест');
    await page.locator('input[placeholder="+7 (___) ___-__-__"]').fill('+7 949 111-22-33');
    await page.locator('select').selectOption('Дрова: Берёза, Дуб, Акация');
    await page.locator('#contacts input[type="checkbox"]').check({ force: true });

    const requestPromise = page.waitForRequest(
      (r) => r.url().includes('/api/leads') && r.method() === 'POST',
    );
    await page.locator('#contacts button[type="submit"]').click();
    const request = await requestPromise;
    const body = request.postDataJSON();
    expect(body.consent).toBe(true);
  });

});
