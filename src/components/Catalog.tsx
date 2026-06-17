/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Flame, CheckCircle, ArrowRight, Grid, Scale, Layers } from "lucide-react";
import { PRODUCTS } from "../data";
import { Product } from "../types";

interface CatalogProps {
  onSelectProduct: (product: Product) => void;
  theme: "slate-fire" | "cool-slate" | "cozy-wood";
}

export default function Catalog({ onSelectProduct, theme }: CatalogProps) {
  const [activeTab, setActiveTab] = useState<"all" | "coal" | "wood" | "materials">("all");

  const getThemeTextClass = () => {
    if (theme === "cool-slate") return "text-sky-400";
    if (theme === "cozy-wood") return "text-amber-500";
    return "text-orange-500";
  };

  const getThemeTabActiveClass = () => {
    if (theme === "cool-slate") return "bg-sky-500/10 border-sky-500 text-sky-450 shadow-md shadow-sky-950/20";
    if (theme === "cozy-wood") return "bg-amber-500/10 border-amber-500 text-amber-500 shadow-md shadow-amber-950/20";
    return "bg-orange-500/10 border-orange-500 text-orange-500 shadow-md shadow-orange-950/20";
  };

  const getThemeButtonClass = () => {
    if (theme === "cool-slate") return "bg-[#1d1d23] hover:bg-sky-500 hover:text-slate-950 text-white border-slate-800";
    if (theme === "cozy-wood") return "bg-[#1d1d23] hover:bg-amber-500 hover:text-slate-950 text-white border-slate-800";
    return "bg-[#1e1e24] hover:bg-orange-500 hover:text-slate-950 text-white border-slate-800"; // default orange-500
  };

  const getThemeBulletClass = () => {
    if (theme === "cool-slate") return "text-sky-500/80";
    if (theme === "cozy-wood") return "text-amber-500/80";
    return "text-orange-500/80";
  };

  // Filter Catalog base on selected taxonomy
  const filteredProducts = activeTab === "all" 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeTab);

  return (
    <section id="catalog" className="py-20 bg-[#0f0f12] border-t border-slate-900/40 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        
        {/* Section Title Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className={`text-[10px] tracking-widest font-black uppercase tracking-wider ${getThemeTextClass()}`}>
              НАШ АССОРТИМЕНТ
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-display text-white mt-1.5">
              Каталог готовой продукции
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-xl font-sans">
              Спецификации и цены представлены в рекламных целях. Выгружаем на весах заказчика или весах ОПС Донецка. Вес контролируется до кг!
            </p>
          </div>

          {/* Interactive Navigation Taxonomies Tabs bar */}
          <div className="flex flex-wrap gap-2.5 font-sans justify-start">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                activeTab === "all"
                  ? getThemeTabActiveClass()
                  : "bg-slate-900/40 border-slate-850 text-slate-400 hover:text-white"
              }`}
            >
              Все товары
            </button>
            <button
              onClick={() => setActiveTab("coal")}
              className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                activeTab === "coal"
                  ? getThemeTabActiveClass()
                  : "bg-slate-900/40 border-slate-850 text-slate-400 hover:text-white"
              }`}
            >
              Сортовой уголь
            </button>
            <button
              onClick={() => setActiveTab("wood")}
              className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                activeTab === "wood"
                  ? getThemeTabActiveClass()
                  : "bg-slate-900/40 border-slate-850 text-slate-400 hover:text-white"
              }`}
            >
              Колотые дрова
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className={`px-4 py-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                activeTab === "materials"
                  ? getThemeTabActiveClass()
                  : "bg-slate-900/40 border-slate-850 text-slate-400 hover:text-white"
              }`}
            >
              Строительные материалы
            </button>
          </div>
        </div>

        {/* Dynamic products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <div 
              key={product.id}
              className="group bg-[#15151a] border border-slate-900/80 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-350 flex flex-col justify-between"
            >
              {/* Product Photo panel */}
              <div className="h-48 overflow-hidden relative">
                
                {/* Lazy Badge displays */}
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 text-[10px] font-bold tracking-wider text-slate-950 select-none uppercase font-sans">
                  {product.badge && (
                    <span className="bg-orange-500 px-2 py-1 rounded shadow">
                      {product.badge}
                    </span>
                  )}
                  {product.subBadge && (
                    <span className="bg-amber-400 px-2.5 py-1 rounded shadow">
                      {product.subBadge}
                    </span>
                  )}
                </div>

                {/* Dark Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60 z-10"></div>
                
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
                />

                {/* Price Display */}
                <div className="absolute bottom-3 right-3 z-10 bg-slate-900/90 backdrop-blur border border-slate-800 px-3 py-1.5 rounded-lg">
                  <span className={`text-xs font-black text-white font-display`}>
                    {product.priceEstimate} ₽ <span className="text-[10px] text-slate-400 font-normal">/{product.unit}</span>
                  </span>
                </div>
              </div>

              {/* Specs & description details */}
              <div className="p-4 space-y-4 flex-1 flex flex-col justify-between text-left">
                
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-white tracking-tight leading-snug font-display">
                    {product.name}
                  </h3>
                  <p className="text-slate-400 text-xs leading-relaxed font-sans line-clamp-3">
                    {product.description}
                  </p>
                </div>

                {/* Structured metrics specifications matching layout */}
                <div className="bg-[#0c0c0f] p-3 rounded-xl space-y-2 border border-slate-900 text-[11px] text-slate-400 font-sans">
                  {product.ashValue && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Scale className={`w-3.5 h-3.5 ${getThemeBulletClass()}`} /> Зольность:
                      </span>
                      <strong className="text-slate-300">{product.ashValue}</strong>
                    </div>
                  )}
                  {product.heatValue && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Flame className={`w-3.5 h-3.5 ${getThemeBulletClass()}`} /> Теплота:
                      </span>
                      <strong className="text-slate-300">{product.heatValue}</strong>
                    </div>
                  )}
                  {product.fraction && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Grid className={`w-3.5 h-3.5 ${getThemeBulletClass()}`} /> Фракция угля:
                      </span>
                      <strong className="text-slate-300">{product.fraction}</strong>
                    </div>
                  )}
                  {product.humidity && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Layers className={`w-3.5 h-3.5 ${getThemeBulletClass()}`} /> Влажность:
                      </span>
                      <strong className="text-slate-300">{product.humidity}</strong>
                    </div>
                  )}
                  {product.length && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Layers className={`w-3.5 h-3.5 ${getThemeBulletClass()}`} /> Длина поленьев:
                      </span>
                      <strong className="text-slate-300">{product.length}</strong>
                    </div>
                  )}
                  {product.materialType && (
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1">
                        <Layers className={`w-3.5 h-3.5 ${getThemeBulletClass()}`} /> Назначение:
                      </span>
                      <strong className="text-slate-300">{product.materialType}</strong>
                    </div>
                  )}
                  {product.deliveryMin && (
                    <div className="flex justify-between font-bold border-t border-slate-900/50 pt-1.5 mt-1">
                      <span>Мин. заказ:</span>
                      <span className={getThemeTextClass()}>{product.deliveryMin}</span>
                    </div>
                  )}
                </div>

                {/* Submit button Trigger */}
                <button
                  onClick={() => onSelectProduct(product)}
                  className={`w-full py-3.5 border rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer font-display ${getThemeButtonClass()}`}
                >
                  <span>Рассчитать заказ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
