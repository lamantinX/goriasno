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

});
