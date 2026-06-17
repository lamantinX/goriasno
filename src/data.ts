/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, DesignNote } from "./types";

export const PRODUCTS: Product[] = [
  {
    id: "anthracite-bags",
    name: "Антрацит АО / АМ / АС",
    category: "coal",
    badge: "В МЕШКАХ",
    subBadge: "ТОННАМИ",
    ashValue: "до 12%",
    heatValue: "7500+ ккал/кг",
    priceEstimate: "от 450",
    unit: "мешок",
    description: "Премиальный сортовой уголь антрацит, расфасованный в плотные полипропиленовые мешки по 40 кг. Подходит для автоматических котлов и классических печей.",
    image: "https://images.unsplash.com/photo-1523413651479-797eb2e23da0?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "coal-ton",
    name: "Уголь Марка Т (Тощий)",
    category: "coal",
    badge: "ТОННАМИ",
    fraction: "25-50 мм",
    ashValue: "до 15%",
    heatValue: "6800-7200 ккал/кг",
    priceEstimate: "от 7,800",
    unit: "т",
    description: "Длиннопламенный тощий уголь в промышленных объёмах. Отлично держит температуру, характеризуется ровным горением без копоти и искр.",
    image: "https://images.unsplash.com/photo-1588600878108-57c611a2776d?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "firewood-oak",
    name: "Дрова: Дуб, Акация",
    category: "wood",
    badge: "В МЕШКАХ",
    subBadge: "НАВАЛОМ",
    humidity: "Сухие/Естеств.",
    length: "30-40 см",
    priceEstimate: "от 350",
    unit: "мешок",
    description: "Сухие колотые дрова премиальных сортов древесины. Долго горят, дают стойкий древесный жар, обладают минимальным выделением смол.",
    image: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: "sand-gravel",
    name: "Песок, Шлак, Щебень",
    category: "materials",
    badge: "НАВАЛОМ",
    materialType: "Строительный",
    deliveryMin: "От 1 тонны",
    priceEstimate: "от 1,200",
    unit: "т",
    description: "Чистый карьерный песок, гранитный щебень различных фракций и доменный кусковой шлак для строительных и планировочных работ.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop"
  }
];

export const INITIAL_DESIGN_NOTES: DesignNote[] = [
  {
    id: "note-1",
    author: "Заказчик (Дмитрий)",
    text: "Отличный глубокий цвет фона, хорошо гармонирует с оранжевым пламенем! Сделайте, пожалуйста, кнопку звонка еще более акцентной на мобильных устройствах.",
    xPercent: 82,
    yPercent: 7,
    timestamp: "17.06.2026, 12:15",
    isResolved: false
  },
  {
    id: "note-2",
    author: "Арт-директор",
    text: "Поля в форме обратной связи нарисованы идеально. Обязательно сделаем маску ввода для телефонов формата Донеччины +7 (949).",
    xPercent: 28,
    yPercent: 78,
    timestamp: "17.06.2026, 12:18",
    isResolved: false
  }
];

export const DELIVERY_AREAS = [
  { id: "donetsk-vorosh", name: "Донецк (Ворошиловский, Калининский, Киевский)", baseRate: 1500 },
  { id: "donetsk-kirov", name: "Донецк (Кировский, Петровский, Куйбышевский)", baseRate: 1800 },
  { id: "donetsk-prolet", name: "Донецк (Пролетарский, Буденновский, Ленинский)", baseRate: 1700 },
  { id: "makeevka", name: "Макеевка (Центр, Червоногвардейский р-н)", baseRate: 2200 },
  { id: "yasynuvata", name: "Ясиноватая и окрестности", baseRate: 3000 },
  { id: "khartsyzk", name: "Харцызск / Зугрэс", baseRate: 3500 },
  { id: "other", name: "Другой населенный пункт (расчет за км)", baseRate: 2000 }
];
