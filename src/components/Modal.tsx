/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { User, Phone, X, ArrowRight, ShoppingCart } from "lucide-react";
import type { Product, FeedbackSubmission } from "../types";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: "callback" | "order";
  selectedProduct?: Product | null;

  onSubmitSuccess: (submission: FeedbackSubmission) => void;
  theme: "slate-fire" | "cool-slate" | "cozy-wood";
}

export default function Modal({
  isOpen,
  onClose,
  formType,
  selectedProduct,
  onSubmitSuccess,
  theme,
}: ModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName("");
      setPhone("+7 ");
      setMessage("");
      setError("");
      setAgree(false);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Focus trap: keep Tab cycling inside the modal
  const handleTrapFocus = useCallback((e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !modalRef.current) return;
    const focusable = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!isOpen) return null;

  // Simple formatter for +7 phone number mask
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    // ensure it starts with +7 or +7 
    if (!input.startsWith("+7")) {
      input = "+7 " + input.replace(/^\+?7?\s*/, "");
    }
    setPhone(input);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Пожалуйста, введите ваше имя");
      return;
    }
    if (phone.trim().length < 10 || phone === "+7 ") {
      setError("Пожалуйста, введите корректный номер телефона");
      return;
    }

    const submission: FeedbackSubmission = {
      id: "sub-" + Math.random().toString(36).slice(2, 11),
      name,
      phone,
      message: message || (formType === "callback" ? "Запрос обратного звонка" : `Запрос по форме ${formType}`),
      sourceForm: formType === "callback" ? "callback" : "catalog_order",
      productName: selectedProduct?.name,

      submittedAt: new Date().toLocaleTimeString() + ", " + new Date().toLocaleDateString(),
    };

    setIsSubmitting(true);
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: submission.name,
        phone: submission.phone,
        productName: submission.productName,
        message: submission.message,
        sourceForm: submission.sourceForm,
      })
    })
    .then(res => res.json())
    .then(data => {
      setIsSubmitting(false);
      if (data.success) {
        setError("");
        onSubmitSuccess(submission);
      } else {
        setError(data.error || "Ошибка при отправке");
      }
    })
    .catch(err => {
      setIsSubmitting(false);
      setError("Ошибка соединения с сервером");
      console.error(err);
    });
  };

  // Color mappings based on design review theme settings
  const getThemeAccentClass = () => {
    if (theme === "cool-slate") return "bg-sky-500 hover:bg-sky-400 text-slate-950 focus:ring-sky-500/50";
    if (theme === "cozy-wood") return "bg-amber-500 hover:bg-amber-400 text-slate-950 focus:ring-amber-500/50";
    return "bg-orange-500 hover:bg-orange-400 text-slate-950 focus:ring-orange-500/50"; // default
  };

  const getThemeTextClass = () => {
    if (theme === "cool-slate") return "text-sky-400";
    if (theme === "cozy-wood") return "text-amber-500";
    return "text-orange-500";
  };

  const getThemeBorderClass = () => {
    if (theme === "cool-slate") return "focus:border-sky-500 focus:ring-sky-500/30";
    if (theme === "cozy-wood") return "focus:border-amber-500 focus:ring-amber-500/30";
    return "focus:border-orange-500 focus:ring-orange-500/30";
  };

  

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={formType === "order" ? "Оформление заказа" : "Заказ звонка"} onKeyDown={handleTrapFocus} ref={modalRef}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClose(); }}
        role="button"
        tabIndex={-1}
        aria-label="Закрыть модальное окно"
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Modal Container */}
      <div className="bg-[#16161a] border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl z-10 p-6 md:p-8 transform transition-transform duration-300 scale-100 font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-900 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          {formType === "callback" && (
            <>
              <h3 className="text-xl md:text-2xl font-bold font-display text-white mb-2">Заказать звонок</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Оставьте ваши контакты, и наш менеджер свяжется с вами в течение 15 минут для уточнения деталей и точного расчёта веса.
              </p>
            </>
          )}

          {formType === "order" && selectedProduct && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className={`w-5 h-5 ${getThemeTextClass()}`} />
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">Быстрый заказ товара</span>
              </div>
              <h3 className="text-xl font-bold font-display text-white mb-1">{selectedProduct.name}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Вы оформляете предварительный расчёт заказа на: <strong className={getThemeTextClass()}>{selectedProduct.name}</strong> ({selectedProduct.priceEstimate} ₽ / {selectedProduct.unit}).
              </p>
            </>
          )}


        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg text-xs mb-4 font-medium font-sans">
            ⚠️ {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Name input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block font-sans">
              Ваше имя
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <User className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иван Иванов"
                className={`w-full bg-[#0f0f12] text-sm text-white rounded-lg pl-10 pr-4 py-3 border border-slate-800 outline-none transition-all ${getThemeBorderClass()}`}
              />
            </div>
          </div>

          {/* Phone input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block font-sans">
              Номер телефона
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+7 (949) 340-10-11"
                className={`w-full bg-[#0f0f12] text-sm text-white rounded-lg pl-10 pr-4 py-3 border border-slate-800 outline-none transition-all ${getThemeBorderClass()}`}
              />
            </div>
          </div>

          {/* Comment (only shown for standard order or if they want to add text) */}
          {(formType === "order" || formType === "callback") && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block font-sans">
                Дополнительные пожелания (Необязательно)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Укажите объём, желаемое время звонка или детали въезда машины..."
                rows={3}
                className={`w-full bg-[#0f0f12] text-xs text-white rounded-lg p-3.5 border border-slate-800 outline-none transition-all resize-none ${getThemeBorderClass()}`}
              />
            </div>
          )}

          {/* Checkbox FZ-152 */}
          <label className="flex items-start gap-2 text-[10px] text-slate-500 cursor-pointer pt-2 pb-2">
            <input 
              type="checkbox" 
              checked={agree} 
              onChange={(e) => setAgree(e.target.checked)} 
              required 
              className="mt-0.5 rounded border-slate-800 bg-slate-900 text-orange-500 shrink-0" 
            />
            <span>Я согласен на обработку персональных данных согласно <a href="/privacy.html" target="_blank" rel="noopener" className="underline hover:text-white">Политике конфиденциальности</a></span>
          </label>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!agree || isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide shadow-lg transition-all flex items-center justify-center gap-2 font-display ${(!agree || isSubmitting) ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'cursor-pointer transform active:scale-98 ' + getThemeAccentClass()}`}
            >
              <span>
                {isSubmitting ? "Отправка..." : (
                  <>
                    {formType === "callback" && "Заказать звонок"}
                    {formType === "order" && "Отправить заказ на расчёт"}
                  </>
                )}
              </span>
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {/* Form Footer Terms */}
        <div className="mt-5 pt-4 border-t border-slate-850 text-center">
          <p className="text-[10px] text-slate-500 leading-normal font-sans">
            Нажимая кнопку, вы подтверждаете согласие с{" "}
            <a href="/privacy.html" target="_blank" rel="noopener" className="underline hover:text-slate-300 transition-colors">
              политикой конфиденциальности сайта
            </a>{" "}
            и договором оферты.
          </p>
        </div>

      </div>
    </div>
  );
}
