/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PhoneCall, Truck, Banknote, ShieldAlert } from "lucide-react";

interface HowWeWorkProps {
  theme: "slate-fire" | "cool-slate" | "cozy-wood";
}

export default function HowWeWork({ theme }: HowWeWorkProps) {
  const getThemeTextClass = () => {
    if (theme === "cool-slate") return "text-sky-400";
    if (theme === "cozy-wood") return "text-amber-500";
    return "text-orange-500";
  };

  const getThemeBadgeClass = () => {
    if (theme === "cool-slate") return "bg-sky-500 text-slate-950";
    if (theme === "cozy-wood") return "bg-amber-500 text-slate-950";
    return "bg-orange-500 text-slate-950";
  };

  const getThemeLineClass = () => {
    if (theme === "cool-slate") return "from-sky-500/20 via-sky-500/40 to-sky-500/20";
    if (theme === "cozy-wood") return "from-amber-500/20 via-amber-500/40 to-amber-500/20";
    return "from-orange-500/20 via-orange-500/40 to-orange-500/20";
  };

  return (
    <section id="process" className="py-20 bg-[#0c0c0e] border-t border-slate-900/40 relative overflow-hidden">
      
      {/* Background blur graphic */}
      <div className="absolute right-0 bottom-0 w-72 h-72 bg-slate-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        
        {/* Caption */}
        <div className="max-w-2xl mx-auto mb-16">
          <span className={`text-[10px] tracking-widest font-black uppercase ${getThemeTextClass()}`}>
            ПРОЦЕСС ОФОРМЛЕНИЯ
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white mt-1.5">
            Как мы работаем
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-lg mx-auto font-sans">
            Мы упростили алгоритм покупки твердого топлива, исключив риск недовеса или некачественного пламени!
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Connector horizontal line for desktops */}
          <div className={`hidden md:block absolute top-[44px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r ${getThemeLineClass()} z-0`} />

          {/* Step 1 */}
          <div className="space-y-4 relative z-10 flex flex-col items-center">
            
            {/* Step Counter Bubble */}
            <div className="relative">
              <div className="absolute -inset-1 bg-slate-900 rounded-2xl blur-sm"></div>
              <div className="relative w-20 h-20 rounded-2xl bg-[#16161c] border border-slate-855 flex items-center justify-center">
                <PhoneCall className={`w-8 h-8 ${getThemeTextClass()}`} />
                <span className={`absolute -top-2 -right-2 w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shadow-md font-display ${getThemeBadgeClass()}`}>
                  1
                </span>
              </div>
            </div>

            <div className="text-center max-w-xs space-y-2">
              <h3 className="font-extrabold text-base text-white tracking-tight font-display">
                Звонок или заявка
              </h3>
              <p className="text-slate-450 text-xs leading-relaxed font-sans">
                Свяжитесь с нами по телефону или оставьте заявку. Мы поможем рассчитать точный тоннаж по типу загородной площади и согласуем кузов машины.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="space-y-4 relative z-10 flex flex-col items-center">
            
            <div className="relative">
              <div className="absolute -inset-1 bg-slate-900 rounded-2xl blur-sm"></div>
              <div className="relative w-20 h-20 rounded-2xl bg-[#16161c] border border-slate-855 flex items-center justify-center">
                <Truck className={`w-8 h-8 ${getThemeTextClass()}`} />
                <span className={`absolute -top-2 -right-2 w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shadow-md font-display ${getThemeBadgeClass()}`}>
                  2
                </span>
              </div>
            </div>

            <div className="text-center max-w-xs space-y-2">
              <h3 className="font-extrabold text-base text-white tracking-tight font-display">
                Отгрузка или самовывоз
              </h3>
              <p className="text-slate-450 text-xs leading-relaxed font-sans">
                Приезжайте к нам на склад для совместного контроля взвешивания, либо заберите топливо самостоятельно со склада, когда вам удобно.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="space-y-4 relative z-10 flex flex-col items-center">
            
            <div className="relative">
              <div className="absolute -inset-1 bg-slate-900 rounded-2xl blur-sm"></div>
              <div className="relative w-20 h-20 rounded-2xl bg-[#16161c] border border-slate-855 flex items-center justify-center">
                <Banknote className={`w-8 h-8 ${getThemeTextClass()}`} />
                <span className={`absolute -top-2 -right-2 w-7 h-7 rounded-full font-black text-xs flex items-center justify-center shadow-md font-display ${getThemeBadgeClass()}`}>
                  3
                </span>
              </div>
            </div>

            <div className="text-center max-w-xs space-y-2">
              <h3 className="font-extrabold text-base text-white tracking-tight font-display">
                Оплата при получении
              </h3>
              <p className="text-slate-450 text-xs leading-relaxed font-sans">
                Выгружаем уголь или дрова прямо во дворе. Вы проверяете качество, проводите контрольное взвешивание мешков и рассчитываетесь наличными или картой.
              </p>
            </div>
          </div>

        </div>

        {/* Reliability Guarantee Warning Note */}
        <div className="max-w-3xl mx-auto mt-14 bg-slate-900/30 p-4 rounded-xl border border-slate-855/60 flex items-start gap-3 text-left">
          <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${getThemeTextClass()}`} />
          <p className="text-xs text-slate-400 leading-normal font-sans">
            <strong>Честные обязательства:</strong> Мы никогда не просим предоплаты за доставку или за саму продукцию! Все расчеты осуществляются исключительно по ведомостям на месте у ваших ворот после визуального осмотра.
          </p>
        </div>

      </div>
    </section>
  );
}
