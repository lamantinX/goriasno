/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle, ArrowDownCircle, Info, MapPin, Scale, ShieldCheck, Truck } from "lucide-react";

interface HeroProps {
  theme: "slate-fire" | "cool-slate" | "cozy-wood";
}

export default function Hero({ theme }: HeroProps) {
  const getThemeTextClass = () => {
    if (theme === "cool-slate") return "text-sky-400";
    if (theme === "cozy-wood") return "text-amber-500";
    return "text-orange-500";
  };

  const getThemeButtonClass = () => {
    if (theme === "cool-slate") return "bg-sky-500 hover:bg-sky-400 text-slate-950 hover:shadow-sky-500/10";
    if (theme === "cozy-wood") return "bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-amber-500/10";
    return "bg-orange-500 hover:bg-orange-400 text-slate-950 hover:shadow-orange-500/10";
  };

  const getThemeBadgeClass = () => {
    if (theme === "cool-slate") return "bg-sky-500/10 text-sky-400 border border-sky-500/20";
    if (theme === "cozy-wood") return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
    return "bg-orange-500/10 text-orange-400 border border-orange-500/20";
  };

  const getThemeMapDotClass = () => {
    if (theme === "cool-slate") return "bg-sky-500 shadow-sky-500/50";
    if (theme === "cozy-wood") return "bg-amber-500 shadow-amber-500/50";
    return "bg-orange-500 shadow-orange-500/50";
  };

  const handleScrollToCatalog = () => {
    const element = document.getElementById("catalog");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollToContacts = () => {
    const element = document.getElementById("contacts");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative min-h-screen pt-28 pb-16 flex items-center justify-center overflow-hidden bg-[#0c0c0e]">
      {/* Dynamic Background Mesh & Glowing Orbs */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-slate-900/40 rounded-full blur-[140px] opacity-70"></div>
        {theme === "cool-slate" ? (
          <div className="absolute top-1/4 right-0 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px] animate-pulse-glow"></div>
        ) : theme === "cozy-wood" ? (
          <div className="absolute top-1/4 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-[100px] animate-pulse-glow"></div>
        ) : (
          <div className="absolute top-1/4 right-0 w-80 h-80 bg-orange-500/5 rounded-full blur-[100px] animate-pulse-glow"></div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:items-center">
          
          {/* Left Column: Promotion Copy Panel */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Warehouse Dispatch Badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold leading-none ${getThemeBadgeClass()}`}>
              <span className={`h-1.5 w-1.5 rounded-full animate-ping ${getThemeMapDotClass()}`}></span>
              <span>ПРЯМО СО СКЛАДА В ДОНЕЦКЕ</span>
            </div>

            {/* Display Big Heading */}
            <h1 className="text-3xl sm:text-5xl font-black font-display text-white leading-[1.1] tracking-tight">
              Качественный уголь и дрова напрямую <br/>
              <span className={getThemeTextClass()}>со склада в Донецке</span>
            </h1>

            {/* Captions */}
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed tracking-wide font-sans">
              Приезжайте лично, проверяйте точный вес, объем и лично забирайте товар со склада, либо оформите быструю доставку нашим собственным транспортом прямо в день звонка по ДНР. Гарантируем прозрачную кубатуру!
            </p>

            {/* Micro-Features Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3">
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${getThemeTextClass()} shrink-0`} />
                <span className="text-[11px] font-sans text-slate-350 font-medium">Точный вес силами Органов Контроля</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 flex items-center gap-2">
                <CheckCircle className={`w-4 h-4 ${getThemeTextClass()} shrink-0`} />
                <span className="text-[11px] font-sans text-slate-350 font-medium">Доставка в день обращения</span>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-900 flex items-center gap-2 col-span-2 md:col-span-1">
                <CheckCircle className={`w-4 h-4 ${getThemeTextClass()} shrink-0`} />
                <span className="text-[11px] font-sans text-slate-350 font-medium">Любые формы оплаты</span>
              </div>
            </div>

            {/* Actions for anchor navigation */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleScrollToCatalog}
                className={`px-8 py-4 rounded-xl font-bold text-sm tracking-wide shadow-md transition-all duration-300 transform active:scale-95 cursor-pointer font-display ${getThemeButtonClass()}`}
              >
                Смотреть каталог
              </button>
              
              <button
                onClick={handleScrollToContacts}
                className="px-8 py-4 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 font-display"
              >
                <span>Связаться с менеджером</span>
              </button>
            </div>

            {/* Mini Scroll Arrow */}
            <div className="pt-6 hidden sm:flex items-center gap-2 text-slate-500 text-xs">
              <ArrowDownCircle className="w-5 h-5 animate-bounce" />
              <span>Листайте ниже, чтобы изучить ассортимент, цены и складские запасы</span>
            </div>

          </div>

          {/* Right Column: Warehouse Capacity, Direct Scaler & Fleet visual card */}
          <div className="lg:col-span-6 relative">
            
            {/* Glow backing */}
            <div className={`absolute -inset-1.5 opacity-10 rounded-2xl blur-xl ${theme === "cool-slate" ? "bg-sky-500" : theme === "cozy-wood" ? "bg-amber-500" : "bg-orange-500"}`}></div>
            
            {/* Main Interactive Widget Grid */}
            <div className="bg-[#121215] border border-slate-900 rounded-2xl shadow-2xl relative p-5 md:p-6 space-y-4 font-sans text-left">
              
              {/* Card Header title */}
              <div className="flex items-center justify-between border-b border-slate-900/80 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className={`w-5 h-5 ${getThemeTextClass()}`} />
                  <span className="font-bold text-xs tracking-wider text-slate-450 uppercase">Гарантия качества и точного веса</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                  Работаем открыто
                </span>
              </div>

              {/* Decorative Trust Feature: 60-Ton Scales */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 space-y-2.5">
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-lg bg-slate-900 text-slate-300">
                    <Scale className={`w-5 h-5 ${getThemeTextClass()}`} />
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider font-display">
                      Сертифицированные 60-Тонные автовесы
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Взвешивание машин производится дважды — пустой транспорт и после погрузки угля/дров. Погрешность исключена. Вы платите только за чистый вес угля.
                    </p>
                  </div>
                </div>
              </div>

              {/* Address & Hours */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 space-y-2.5">
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-lg bg-slate-900 text-slate-300">
                    <MapPin className={`w-5 h-5 ${getThemeTextClass()}`} />
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider font-display">
                      Адрес склада
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      г. Донецк, ул. Углегорская, 1. Работаем ежедневно с 08:00 до 18:00. Самовывоз — без выходных.
                    </p>
                  </div>
                </div>
              </div>

              {/* Decorative Trust Feature: Transport Delivery Area */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 space-y-2.5">
                <div className="flex items-start gap-3">
                  <span className="p-2 rounded-lg bg-slate-900 text-slate-300">
                    <Truck className={`w-5 h-5 ${getThemeTextClass()}`} />
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-white uppercase tracking-wider font-display">
                      Собственная автобаза (Газели, ЗИЛы, Камазы)
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      Оперативная доставка по Донецку, Макеевке, Ясиноватой, Харцызску и всей территории ДНР. Выгрузка самосвалом бесплатная.
                    </p>
                  </div>
                </div>
              </div>

              {/* Informative terms link */}
              <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5 pt-1">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Вы можете приехать лично на склад, выбрать конкретную кучу угля и проконтролировать его погрузку.</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
