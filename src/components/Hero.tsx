/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Calculator as CalcIcon, ShoppingBag, MapPin, CheckCircle, Flame, ArrowDownCircle, Info, Calendar } from "lucide-react";
import { DELIVERY_AREAS } from "../data";
import { MockupConfig, FeedbackSubmission } from "../types";

interface HeroProps {
  onOpenCalcModal: (details: {
    qty: number;
    unit: string;
    deliveryArea: string;
    distanceKm: number;
    estimatedCost: string;
    productName: string;
  }) => void;
  theme: "slate-fire" | "cool-slate" | "cozy-wood";
}

export default function Hero({ onOpenCalcModal, theme }: HeroProps) {
  // Calculator States
  const [selectedProductType, setSelectedProductType] = useState<"anthracite" | "coal-ton" | "wood" | "gravel">("anthracite");
  const [quantity, setQuantity] = useState(10); // 10 units
  const [selectedAreaId, setSelectedAreaId] = useState(DELIVERY_AREAS[0].id);

  // Constants mapping product types to metadata
  const productMeta = {
    anthracite: {
      name: "Антрацит АО / АМ / АС в мешках",
      unitPrice: 450,
      unitLabel: "меш.",
      minQty: 5,
      maxQty: 100,
      step: 5,
      descr: "мешки по 40 кг"
    },
    "coal-ton": {
      name: "Тощий уголь (Марка Т) навалом",
      unitPrice: 7800,
      unitLabel: "т",
      minQty: 1,
      maxQty: 25,
      step: 1,
      descr: "отборный навалом"
    },
    wood: {
      name: "Дрова твердых пород в мешках",
      unitPrice: 350,
      unitLabel: "меш.",
      minQty: 10,
      maxQty: 150,
      step: 5,
      descr: "дуб / акация / граб"
    },
    gravel: {
      name: "Песок / Щебень для стройки",
      unitPrice: 1200,
      unitLabel: "т",
      minQty: 1,
      maxQty: 20,
      step: 1,
      descr: "чистый сыпучий"
    }
  };

  const activeMeta = productMeta[selectedProductType];

  const getThemeTextClass = () => {
    if (theme === "cool-slate") return "text-sky-400";
    if (theme === "cozy-wood") return "text-amber-500";
    return "text-orange-500";
  };

  const getThemeBorderClass = () => {
    if (theme === "cool-slate") return "border-sky-500/20";
    if (theme === "cozy-wood") return "border-amber-500/20";
    return "border-orange-500/20";
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

  // Perform Calculation (React state calculations are fast and responsive!)
  const selectedAreaObj = DELIVERY_AREAS.find(a => a.id === selectedAreaId) || DELIVERY_AREAS[0];
  const itemTotalCost = activeMeta.unitPrice * quantity;
  const deliveryCost = selectedAreaObj.baseRate;
  const grandTotalCost = itemTotalCost + deliveryCost;

  const costFormatter = (num: number) => {
    return num.toLocaleString("ru-RU") + " ₽";
  };

  const handleOpenModal = () => {
    onOpenCalcModal({
      qty: quantity,
      unit: activeMeta.unitLabel,
      deliveryArea: selectedAreaObj.name,
      distanceKm: selectedProductType === "coal-ton" ? 15 : 10,
      estimatedCost: costFormatter(grandTotalCost),
      productName: activeMeta.name
    });
  };

  const handleScrollToCatalog = () => {
    const element = document.getElementById("catalog");
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
                <CheckCircle className={`w-4- h-4 ${getThemeTextClass()} shrink-0`} />
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
                onClick={() => {
                  const el = document.getElementById("calculator-card");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className="px-8 py-4 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 font-display"
              >
                <span>Быстрый калькулятор</span>
                <CalcIcon className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Mini Scroll Arrow */}
            <div className="pt-6 hidden sm:flex items-center gap-2 text-slate-500 text-xs">
              <ArrowDownCircle className="w-5 h-5 animate-bounce" />
              <span>Листайте ниже, чтобы изучить ассортимент, цены и складские запасы</span>
            </div>

          </div>

          {/* Right Column: High-Fidelity Delivery & Materials Calculator Card */}
          <div id="calculator-card" className="lg:col-span-6 relative">
            
            {/* Glow backing */}
            <div className={`absolute -inset-1.5 opacity-10 rounded-2xl blur-xl ${theme === "cool-slate" ? "bg-sky-500" : theme === "cozy-wood" ? "bg-amber-500" : "bg-orange-500"}`}></div>
            
            {/* Main Interactive Widget Grid */}
            <div className="bg-[#121215] border border-slate-900 rounded-2xl shadow-2xl relative p-5 md:p-6 space-y-4 font-sans text-left">
              
              {/* Card Header title */}
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="flex items-center gap-2">
                  <CalcIcon className={`w-5 h-5 ${getThemeTextClass()}`} />
                  <span className="font-bold text-xs tracking-wider text-slate-400 uppercase">Мгновенный Калькулятор</span>
                </div>
                <span className="text-[10px] text-slate-500 font-sans tracking-wide">Версия 1.4 (Интерактивная)</span>
              </div>

              {/* Step 1: Select fuel category type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block font-sans">
                  Выберите вид топлива / материала
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setSelectedProductType("anthracite"); setQuantity(20); }}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                      selectedProductType === "anthracite"
                        ? `bg-[#18181f] border-slate-800 ${getThemeTextClass()}`
                        : "bg-[#0c0c0e] border-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    Антрацит (мешки)
                  </button>
                  <button
                    onClick={() => { setSelectedProductType("coal-ton"); setQuantity(3); }}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                      selectedProductType === "coal-ton"
                        ? `bg-[#18181f] border-slate-800 ${getThemeTextClass()}`
                        : "bg-[#0c0c0e] border-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    Тощий уголь (т)
                  </button>
                  <button
                    onClick={() => { setSelectedProductType("wood"); setQuantity(30); }}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                      selectedProductType === "wood"
                        ? `bg-[#18181f] border-slate-800 ${getThemeTextClass()}`
                        : "bg-[#0c0c0e] border-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    Дрова колотые (меш)
                  </button>
                  <button
                    onClick={() => { setSelectedProductType("gravel"); setQuantity(5); }}
                    className={`px-3 py-2.5 rounded-lg border text-xs font-bold text-center transition-all ${
                      selectedProductType === "gravel"
                        ? `bg-[#18181f] border-slate-800 ${getThemeTextClass()}`
                        : "bg-[#0c0c0e] border-slate-900 text-slate-400 hover:text-white"
                    }`}
                  >
                    Песок / Щебень (т)
                  </button>
                </div>
              </div>

              {/* Step 2: Slider or volume quantity input */}
              <div className="space-y-1.5 p-3 rounded-lg bg-slate-950 border border-slate-900">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Требуемый объем ({activeMeta.descr}):</span>
                  <span className="font-extrabold text-white text-sm">
                    {quantity} <span className={getThemeTextClass()}>{activeMeta.unitLabel}</span>
                  </span>
                </div>
                
                {/* Horizontal slider control */}
                <input
                  type="range"
                  min={activeMeta.minQty}
                  max={activeMeta.maxQty}
                  step={activeMeta.step}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className={`w-full accent-orange-500 h-1 bg-slate-800 rounded-lg cursor-pointer ${
                    theme === "cool-slate" ? "accent-sky-500" : theme === "cozy-wood" ? "accent-amber-500" : "accent-orange-500"
                  }`}
                />
                
                {/* Increment / Decrement Quick buttons */}
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Мин: {activeMeta.minQty} {activeMeta.unitLabel}</span>
                  <span>Лимит в одну ходку машины: {activeMeta.maxQty} {activeMeta.unitLabel}</span>
                </div>
              </div>

              {/* Step 3: Location dispatch selectors */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold tracking-wider text-slate-500 uppercase block font-sans">
                  Район назначения / Доставки угля
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <select
                    value={selectedAreaId}
                    onChange={(e) => setSelectedAreaId(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-slate-900 rounded-lg text-xs text-white pl-10 pr-4 py-3 outline-none focus:border-slate-800 transition-all font-sans cursor-pointer"
                  >
                    {DELIVERY_AREAS.map(area => (
                      <option key={area.id} value={area.id}>
                        {area.name} (доставка от {area.baseRate} ₽)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Receipt Summary view details */}
              <div className="bg-[#181820]/40 p-3.5 rounded-xl border border-slate-900 text-xs space-y-2">
                <p className="font-bold text-[10px] uppercase text-slate-500 tracking-wider">Предварительная спецификация</p>
                
                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span>Стоимость материалов со склада:</span>
                    <span className="font-semibold text-white">{costFormatter(itemTotalCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Транспортные расходы машины ГАЗель/ЗИЛ:</span>
                    <span className="font-semibold text-white">{costFormatter(deliveryCost)}</span>
                  </div>
                  
                  {/* Total separator line */}
                  <div className="border-t border-slate-900/80 pt-2 flex justify-between items-center">
                    <span className="font-bold text-slate-400">ИТОГО К ОПЛАТЕ ПРИ ПОЛУЧЕНИИ:</span>
                    <span className={`text-base font-extrabold text-white`}>
                      {costFormatter(grandTotalCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA Calculation button */}
              <div className="pt-2">
                <button
                  onClick={handleOpenModal}
                  className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide uppercase shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer font-display ${getThemeButtonClass()}`}
                >
                  Оформить доставку с точным весом
                </button>
              </div>

              {/* Informative terms link */}
              <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Оплата производится по факту взвешивания и выгрузки на ваших весах.</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
