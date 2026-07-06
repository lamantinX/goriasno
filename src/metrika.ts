/**
 * Yandex.Metrica goal helpers.
 * Counter ID: 110453579
 *
 * Goals:
 *  - phone_click   — клик по номеру телефона
 *  - form_submit   — успешная отправка формы
 *  - product_view  — просмотр товарной страницы
 */

declare global {
  interface Window {
    ym: (...args: unknown[]) => void;
  }
}

export function reachGoal(goal: string, params?: Record<string, unknown>) {
  if (typeof window.ym === 'function') {
    window.ym(110453579, 'reachGoal', goal, params);
  }
}
