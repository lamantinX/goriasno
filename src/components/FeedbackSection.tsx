/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Building, 
  MapPin, 
  Clock, 
  PhoneCall, 
  Send, 
  MessageSquare, 
  Compass, 
  CheckCheck,
  AlertCircle 
} from "lucide-react";
import { FeedbackSubmission } from "../types";

interface FeedbackSectionProps {
  onSubmitSuccess: (submission: FeedbackSubmission) => void;
  theme: "slate-fire" | "cool-slate" | "cozy-wood";
}

export default function FeedbackSection({ onSubmitSuccess, theme }: FeedbackSectionProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+7 ");
  const [productType, setProductType] = useState("Антрацит АО/АМ/АС в мешках");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [agree, setAgree] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadMap, setLoadMap] = useState(false);

  const getThemeTextClass = () => {
    if (theme === "cool-slate") return "text-sky-450";
    if (theme === "cozy-wood") return "text-amber-500";
    return "text-orange-500";
  };

  const getThemeButtonClass = () => {
    if (theme === "cool-slate") return "bg-sky-500 hover:bg-sky-450 hover:shadow-sky-550/15 text-slate-950";
    if (theme === "cozy-wood") return "bg-amber-500 hover:bg-amber-400 hover:shadow-amber-500/15 text-slate-950";
    return "bg-orange-550 hover:bg-orange-500 hover:shadow-orange-550/15 text-slate-950"; // default
  };

  const getThemeBorderClass = () => {
    if (theme === "cool-slate") return "focus:border-sky-500 focus:ring-sky-500/20 text-sky-400";
    if (theme === "cozy-wood") return "focus:border-amber-500 focus:ring-amber-500/20 text-amber-500";
    return "focus:border-orange-550 focus:ring-orange-550/20 text-orange-500";
  };

  const getThemeBadgeClass = () => {
    if (theme === "cool-slate") return "bg-sky-500 text-slate-950 hover:bg-sky-400";
    if (theme === "cozy-wood") return "bg-amber-500 text-slate-950 hover:bg-amber-400";
    return "bg-orange-500 text-slate-950 hover:bg-orange-400";
  };

  // Safe phone mask formatter
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    if (!input.startsWith("+7")) {
      input = "+7 " + input.replace(/^\+?7?\s*/, "");
    }
    setPhone(input);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Пожалуйста, заполните ваше имя");
      return;
    }
    if (phone.trim().length < 10 || phone === "+7 ") {
      setError("Некорректный формат телефона");
      return;
    }

    const payload: FeedbackSubmission = {
      id: "sub-main-" + Math.random().toString(36).substr(2, 9),
      name,
      phone,
      productName: productType,
      message,
      sourceForm: "main_footer",
      submittedAt: new Date().toLocaleTimeString() + ", " + new Date().toLocaleDateString()
    };

    setIsSubmitting(true);
    fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name,
        phone: payload.phone,
        productName: payload.productName,
        message: payload.message,
        sourceForm: payload.sourceForm,
      })
    })
    .then(res => res.json())
    .then(data => {
      setIsSubmitting(false);
      if (data.success) {
        setError("");
        onSubmitSuccess(payload);
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

  return (
    <section id="contacts" className="py-20 bg-[#0c0c0e] border-t border-slate-900 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        
        {/* Main Grid split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Direct inquiry Form panel */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="bg-[#121215]/80 p-6 md:p-8 rounded-2xl border border-slate-900/60 shadow-2xl relative">
              <div className="absolute top-0 right-10 w-24 h-24 bg-orange-600/5 blur-2xl rounded-full"></div>
              
              <h3 className="text-xl md:text-2xl font-black font-display text-white mb-2">
                Оставить заявку
              </h3>
              <p className="text-slate-450 text-xs leading-relaxed font-sans mb-6">
                Заполните форму для расчёта стоимости. Менеджер свяжется с вами, чтобы подтвердить марку угля или габариты дров, а также рассчитать условия доставки на ваш адрес.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-xs">
                
                {/* Two inputs side-by-side on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Name field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                      Ваше имя
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Иван"
                      className={`w-full bg-[#0a0a0c] border border-slate-900 rounded-lg p-3 text-sm text-white outline-none transition-all ${getThemeBorderClass()}`}
                    />
                  </div>

                  {/* Phone field */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="+7 (___) ___-__-__"
                      className={`w-full bg-[#0a0a0c] border border-slate-900 rounded-lg p-3 text-sm text-white outline-none transition-all ${getThemeBorderClass()}`}
                    />
                  </div>

                </div>

                {/* Dropdown product selector choice */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                    Что вас интересует?
                  </label>
                  <select
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-slate-900 rounded-lg p-3 text-xs text-white outline-none cursor-pointer focus:border-slate-800"
                  >
                    <option>Антрацит АО/АМ/АС в мешках</option>
                    <option>Антрацит АО/АМ/АС тоннами</option>
                    <option>Уголь марки Т (Тощий) навалом</option>
                    <option>Уголь ДГ (Длиннопламенный) навалом</option>
                    <option>Уголь ДГ (Длиннопламенный) в мешках</option>
                    <option>Дрова: Берёза, Дуб, Акация</option>
                    <option>Песок, Шлак, Щебень строительный</option>
                    <option>Вывоз строительного мусора</option>
                    <option>Другой объем / Нужен индивидуальный расчет</option>
                  </select>
                </div>

                {/* Message comment area */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-sans">
                    Сообщение (Необязательно)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Укажите объем, адрес или особые пожелания к доставке..."
                    rows={4}
                    className={`w-full bg-[#0a0a0c] border border-slate-900 rounded-lg p-3.5 text-xs text-white outline-none transition-all resize-none ${getThemeBorderClass()}`}
                  />
                </div>

                {/* Checkbox FZ-152 */}
                <label className="flex items-start gap-2 text-[10px] text-slate-500 cursor-pointer pt-2">
                  <input 
                    type="checkbox" 
                    checked={agree} 
                    onChange={(e) => setAgree(e.target.checked)} 
                    required 
                    className="mt-0.5 rounded border-slate-900 bg-slate-950 text-orange-500 shrink-0" 
                  />
                  <span>Я согласен на обработку персональных данных согласно <a href="/privacy.html" target="_blank" className="underline hover:text-white">Политике конфиденциальности</a></span>
                </label>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!agree || isSubmitting}
                    className={`w-full py-4 rounded-xl font-bold text-center tracking-wide flex items-center justify-center gap-2 transition-all duration-300 font-display ${(!agree || isSubmitting) ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'cursor-pointer transform active:scale-98 ' + getThemeButtonClass()}`}
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ РАСЧЕТ'}</span>
                  </button>
                </div>

              </form>

            </div>

          </div>

          {/* Right Column: Address, Contacts & Mock Map direction card */}
          <div className="lg:col-span-6 space-y-6">
            
            <div className="bg-[#121215]/40 p-6 rounded-2xl border border-slate-900 text-sans">
              <h3 className="font-extrabold text-[#ffffff] font-display text-lg tracking-tight mb-5">
                Наши контакты в Донецке
              </h3>

              <div className="space-y-4 text-xs tracking-wide">
                
                {/* Physical address option */}
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg bg-slate-900 border border-slate-855 ${getThemeTextClass()}`}>
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Главный склад ОПС</span>
                    <p className="text-white font-medium text-xs font-sans mt-0.5">
                      Донецк, ул. Углегорская, 1
                    </p>
                  </div>
                </div>

                {/* Daily hours */}
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg bg-slate-900 border border-slate-855 ${getThemeTextClass()}`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Режим работы</span>
                    <p className="text-white font-medium text-xs font-sans mt-0.5">
                      Ежедневно с 08:00 до 18:00 без перерывов
                    </p>
                  </div>
                </div>

                {/* Telephone speed line */}
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-lg bg-slate-900 border border-slate-855 ${getThemeTextClass()}`}>
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Отдел продаж</span>
                    <a href="tel:+79493401011" className="text-white font-black text-sm font-display mt-0.5 block hover:opacity-80 transition-opacity">
                      +7 (949) 340-10-11 <span className="text-[10px] text-slate-500 font-normal">(Феникс)</span>
                    </a>
                    <a href="tel:+79889946896" className="text-white font-black text-sm font-display mt-1 block hover:opacity-80 transition-opacity">
                      +7 (988) 994-68-96 <span className="text-[10px] text-slate-500 font-normal">(МТС)</span>
                    </a>
                  </div>
                </div>

              </div>
            </div>

            {/* High-Fidelity Mock map directional panel */}
            <div className="h-64 rounded-2xl overflow-hidden border border-slate-900 relative group shadow-xl">
              
              {loadMap ? (
                <iframe 
                  src="https://yandex.ru/map-widget/v1/?ll=37.80285%2C48.015884&z=16&text=Донецк%20Углегорская%201" 
                  title="Интерактивная карта проезда к складу ГориЯсно на ул. Углегорская, 1"
                  loading="lazy"
                  width="100%" 
                  height="100%" 
                  className="rounded-2xl absolute inset-0 z-20"
                ></iframe>
              ) : (
                <div onClick={() => setLoadMap(true)} className="cursor-pointer w-full h-full relative z-20">
                  {/* Backing Map placeholder using standard styling */}
                  <div className="absolute inset-0 bg-[#0d0d10] flex items-center justify-center">
                    <img 
                      src="/images/map-placeholder.svg" 
                      alt="Карта проезда к складу"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover grayscale opacity-30 contrast-125 select-none"
                    />
                  </div>

                  {/* Glowing vector line mockups */}
                  <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] pointer-events-none" />

                  {/* Glowing Marker */}
                  <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center group-hover:scale-105 transition-transform">
                    <div className="relative">
                      <div className={`absolute -inset-4 opacity-40 rounded-full blur-md animate-pulse ${theme === "cool-slate" ? "bg-sky-500" : theme === "cozy-wood" ? "bg-amber-500" : "bg-orange-600"}`}></div>
                      <div className={`relative p-2.5 rounded-full border border-slate-800 text-slate-950 shadow-lg ${theme === "cool-slate" ? "bg-sky-550" : theme === "cozy-wood" ? "bg-amber-500" : "bg-orange-500"}`}>
                        <Compass className="w-5 h-5 animate-spin-slow" />
                      </div>
                    </div>
                    <div className="bg-[#121216]/95 border border-slate-800 rounded px-2.5 py-1 text-[10px] font-bold text-white mt-2 shadow-xl whitespace-nowrap font-sans uppercase tracking-wider">
                      ПОКАЗАТЬ ИНТЕРАКТИВНУЮ КАРТУ
                    </div>
                  </div>

                  {/* Direction Indicator Footer bar */}
                  <div className="absolute bottom-4 left-4 right-4 bg-[#121216]/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-855/80 flex items-center justify-between z-10 font-sans">
                    <div>
                      <h4 className="text-[10px] uppercase font-bold text-slate-400">Маршрут проезда</h4>
                      <p className="text-[11px] text-white font-medium mt-0.5">ул. Углегорская, 1</p>
                    </div>
                    <button type="button" className={`p-1.5 rounded-lg ${getThemeBadgeClass()} text-xs font-semibold shrink-0 cursor-pointer`}>
                      <Compass className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
