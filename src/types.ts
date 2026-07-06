/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: "all" | "coal" | "wood" | "materials";
  badge?: string;
  subBadge?: string;
  description: string;
  ashValue?: string; // e.g. "до 12%"
  heatValue?: string; // e.g. "7500+ ккал/кг"
  fraction?: string; // e.g. "25-50 мм"
  humidity?: string; // e.g. "Сухие / Естеств."
  length?: string; // e.g. "30-40 см"
  materialType?: string; // e.g. "Строительный"
  deliveryMin?: string; // e.g. "От 1 тонны"
  priceEstimate: string; // e.g. "от 4,500 ₽/т"
  unit: string; // e.g. "т" or "мешок"
  image: string;
  slug?: string; // URL-слаг товарной страницы, напр. "anthracite"
  longDescription?: string; // развёрнутый копирайт для товарной страницы
  faqs?: { q: string; a: string }[]; // FAQ-блок товарной страницы
}

export interface FeedbackSubmission {
  id: string;
  name: string;
  phone: string;
  productType?: string;
  message?: string;
  sourceForm: "callback" | "catalog_order" | "main_footer";
  productName?: string;

  submittedAt: string;
}

export interface MockupConfig {
  theme: "slate-fire" | "cool-slate" | "cozy-wood";
  mockupStage: "landing" | "success";
}
