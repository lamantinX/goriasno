/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  CheckCircle, 
  BookOpen, 
  Flame, 
  MapPin, 
  Clock, 
  Phone, 
  ArrowLeft, 
  ChevronRight, 
  Sparkles,
  Award,
  ChevronDown
} from "lucide-react";
import { FeedbackSubmission } from "../types";

interface SuccessStateProps {
  submission?: FeedbackSubmission | null;
  onBack: () => void;
  theme: "slate-fire" | "cool-slate" | "cozy-wood";
}

export default function SuccessState({ submission, onBack, theme }: SuccessStateProps) {
  const [showTips, setShowTips] = useState(false);

  const getThemeTextClass = () => {
    if (theme === "cool-slate") return "text-sky-400";
    if (theme === "cozy-wood") return "text-amber-500";
    return "text-orange-500";
  };

  const getThemeButtonClass = () => {
    if (theme === "cool-slate") return "bg-sky-500 text-slate-950 hover:bg-sky-400 font-bold";
    if (theme === "cozy-wood") return "bg-amber-500 text-slate-950 hover:bg-amber-400 font-bold";
    return "bg-orange-500 text-slate-950 hover:bg-orange-400 font-bold";
  };

  const getThemeBadgeClass = () => {
    if (theme === "cool-slate") return "text-sky-450 bg-sky-950/40 border-sky-900/30";
    if (theme === "cozy-wood") return "text-amber-500 bg-amber-950/40 border-amber-900/30";
    return "text-orange-500 bg-orange-950/40 border-orange-900/30";
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#0c0c0e] font-sans flex items-center justify-center relative">
      {/* Light background nodes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-slate-900/30 rounded-full blur-[140px] opacity-40"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-green-500/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full text-left">
        
        {/* Navigation Breadcrumb to leave success panel */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white mb-8 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>На главную (Вернуться к макету сайта)</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Success Container card */}
          <div className="lg:col-span-7">
            <div className="bg-[#121215] border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden text-center">
              
              {/* Radial ambiance behind tick */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-green-500/5 blur-[120px] pointer-events-none"></div>

              {/* Big Green Stamp animation */}
              <div className="mx-auto w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mb-2 animate-bounce">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight leading-none">
                  Заявка отправлена!
                </h1>
                <p className="text-slate-400 text-sm max-w-sm mx-auto font-sans leading-relaxed">
                  Менеджер созвонится по указанному телефону <strong className="text-white">в течение 15 минут</strong> для согласования марки угля и времени прибытия транспорта.
                </p>
              </div>

              {/* Submitted specifications summary */}
              {submission && (
                <div className="bg-[#181820]/60 border border-slate-900 rounded-xl p-4 text-xs space-y-2.5 max-w-md mx-auto text-left">
                  <p className="font-bold text-[10px] uppercase text-slate-500 tracking-wider text-center border-b border-slate-900 pb-1.5">
                    Зарегистрированная Квитанция #{submission.id}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-y-1.5 text-slate-300">
                    <span>Имя клиента:</span>
                    <strong className="text-white text-right">{submission.name}</strong>

                    <span>Контактный телефон:</span>
                    <strong className="text-white text-right font-mono">{submission.phone}</strong>

                    {submission.productName && (
                      <>
                        <span>Выбранная позиция:</span>
                        <strong className="text-orange-400 text-right">{submission.productName}</strong>
                      </>
                    )}

                    {submission.message && submission.message !== "Запрос обратного звонка" && submission.message !== "Запрос по форме main_footer" && (
                      <>
                        <span>Комментарий:</span>
                        <strong className="text-white text-right line-clamp-1 italic">{submission.message}</strong>
                      </>
                    )}
                  </div>


                </div>
              )}

              {/* Micro-incentives lists (View catalog or Burn tips) */}
              <div className="border-t border-slate-900/80 pt-6 space-y-4">
                <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider ${getThemeBadgeClass()} px-3 py-1 rounded-full border`}>
                  ПОКА ВЫ ОЖИДАЕТЕ ЗВОНКА
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-w-lg mx-auto text-left font-sans">
                  
                  {/* Option 1: Back to study catalog */}
                  <button
                    onClick={onBack}
                    className="p-3.5 bg-slate-900 hover:bg-slate-855 rounded-xl border border-slate-900 hover:border-slate-800 transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <BookOpen className={`w-5 h-5 shrink-0 mt-0.5 ${getThemeTextClass()}`} />
                    <div>
                      <h4 className="font-bold text-xs text-white">Вернуться в каталог</h4>
                      <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Изучить характеристики или добавить еще товары</p>
                    </div>
                  </button>

                  {/* Option 2: Fuel firing advice toggle */}
                  <button
                    onClick={() => setShowTips(!showTips)}
                    className="p-3.5 bg-slate-900 hover:bg-slate-855 rounded-xl border border-slate-900 hover:border-slate-800 transition-all cursor-pointer flex items-start gap-3 group"
                  >
                    <Flame className={`w-5 h-5 shrink-0 mt-0.5 ${getThemeTextClass()}`} />
                    <div>
                      <h4 className="font-bold text-xs text-white flex items-center gap-1">
                        <span>Советы по топке</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${showTips ? "rotate-180" : ""}`} />
                      </h4>
                      <p className="text-[10px] text-slate-400 leading-normal mt-0.5">Узнайте, как сберечь до 25% угля зимой правильным пламенем</p>
                    </div>
                  </button>

                </div>
              </div>

              {/* Advice Panel block (interactive transition) */}
              {showTips && (
                <div className="bg-[#181820]/40 border border-slate-900 rounded-xl p-4 text-xs text-left max-w-lg mx-auto space-y-2.5 animate-in slide-in-from-top duration-200">
                  <h4 className="font-extrabold text-white flex items-center gap-1">
                    <Sparkles className={`w-4 h-4 ${getThemeTextClass()}`} />
                    Как сэкономить уголь и дрова: правила долгого горения
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-405 leading-relaxed text-[11px]">
                    <li>
                      <strong>Слоёная укладка:</strong> Сортовой антрацит любит равномерное уплотнение. Закладывайте крупные куски в середину топки, а мелкую фракцию AO раскидайте сверху.
                    </li>
                    <li>
                      <strong>Регулируйте заслонку:</strong> После разгорания угля уменьшайте поддув на 50%. Антрацит тлеет до 12 часов при медленной подаче воздуха.
                    </li>
                    <li>
                      <strong>Твердые против мягких:</strong> Дубовые дрова разгораются дольше сосновых, но горят в 2.5 раза дольше, не засоряя дымоход смолами. Используйте сосну только для розжига!
                    </li>
                  </ul>
                </div>
              )}

            </div>
          </div>

          {/* Sidebar: persistent Address logs with Map */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Contacts details card */}
            <div className="bg-[#121215] border border-slate-900 rounded-3xl p-6 space-y-5">
              <h3 className="font-extrabold text-white font-display text-base tracking-tight pb-3 border-b border-slate-900">
                Контактная информация склада
              </h3>

              <div className="space-y-4 font-sans text-xs">
                
                {/* Physical address option */}
                <div className="flex items-start gap-3.5 group">
                  <div className={`p-2 rounded-lg bg-slate-900 ${getThemeTextClass()} border border-slate-855`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Адрес погрузки</span>
                    <p className="text-white font-medium mt-0.5">Донецк, ул. Углегорская, 1</p>
                  </div>
                </div>

                {/* Daily hours */}
                <div className="flex items-start gap-3.5 group">
                  <div className={`p-2 rounded-lg bg-slate-900 ${getThemeTextClass()} border border-slate-855`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">График работы</span>
                    <p className="text-white font-medium mt-0.5">Ежедневно: с 08:00 до 18:00</p>
                  </div>
                </div>

                {/* Telephone speed line */}
                <div className="flex items-start gap-3.5 group">
                  <div className={`p-2 rounded-lg bg-slate-900 ${getThemeTextClass()} border border-slate-855`}>
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Отдел приёма заявок</span>
                    <a href="tel:+79493401011" className="text-white font-bold mt-0.5 block hover:underline">+7 (949) 340-10-11</a>
                  </div>
                </div>

              </div>
            </div>

            {/* Static route map box */}
            <div className="h-[230px] rounded-3xl overflow-hidden border border-slate-900 relative">
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center">
                <img 
                  src="/images/map-placeholder.svg" 
                  alt="Схема проезда к складу ГориЯсно"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover grayscale opacity-30 contrast-125 select-none"
                />
              </div>
              <div className="absolute inset-0 bg-slate-950/20" />
              
              {/* Glow center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                <div className="relative">
                  <div className={`absolute -inset-3 opacity-40 rounded-full blur-md animate-pulse ${theme === "cool-slate" ? "bg-sky-500" : theme === "cozy-wood" ? "bg-amber-500" : "bg-orange-600"}`}></div>
                  <div className={`relative p-2 rounded-full text-slate-950 ${theme === "cool-slate" ? "bg-sky-500" : theme === "cozy-wood" ? "bg-amber-500" : "bg-orange-500"}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-3 left-3 bg-[#121216]/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-900 font-sans text-[10px] font-bold text-slate-450 uppercase">
                Пункт назначения заказа
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
