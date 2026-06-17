/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Phone, Menu, X, Flame, Send, MessageCircle } from "lucide-react";

interface HeaderProps {
  onOpenCallback: () => void;
  theme: "slate-fire" | "cool-slate" | "cozy-wood";
}

export default function Header({ onOpenCallback, theme }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getThemeTextClass = () => {
    if (theme === "cool-slate") return "text-sky-400";
    if (theme === "cozy-wood") return "text-amber-500";
    return "text-orange-500"; // slate-fire (default orange)
  };

  const getThemeButtonClass = () => {
    if (theme === "cool-slate") return "bg-sky-500 text-slate-950 hover:bg-sky-400 hover:shadow-sky-500/20";
    if (theme === "cozy-wood") return "bg-amber-500 text-slate-950 hover:bg-amber-400 hover:shadow-amber-500/20";
    return "bg-orange-500 text-slate-950 hover:bg-orange-400 hover:shadow-orange-500/20";
  };

  const getThemeBorderClass = () => {
    if (theme === "cool-slate") return "border-sky-500/30";
    if (theme === "cozy-wood") return "border-amber-500/30";
    return "border-orange-500/30";
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-55 bg-slate-950/80 backdrop-blur-md border-b border-slate-900/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Brand Identity */}
          <a 
            href="#" 
            className="flex items-center gap-1.5 text-lg sm:text-2xl font-black tracking-tight text-white font-display uppercase hover:opacity-90 select-none"
          >
            <span className={getThemeTextClass()}>#</span>
            <span>ГориЯсно</span>
            <span className={getThemeTextClass()}>#</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-350 tracking-wide font-sans">
            <button 
              onClick={() => scrollToSection("catalog")} 
              className="hover:text-white cursor-pointer hover:underline decoration-orange-500 underline-offset-8 transition-all"
            >
              Каталог
            </button>
            <button 
              onClick={() => scrollToSection("process")} 
              className="hover:text-white cursor-pointer hover:underline decoration-orange-500 underline-offset-8 transition-all"
            >
              Как мы работаем
            </button>
            <button 
              onClick={() => scrollToSection("contacts")} 
              className="hover:text-white cursor-pointer hover:underline decoration-orange-500 underline-offset-8 transition-all"
            >
              Контакты
            </button>
          </nav>

          {/* Contact Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <a 
              href="tel:+79493401011" 
              className="flex items-center gap-2 text-white font-semibold text-sm hover:opacity-80 transition-all"
            >
              <Phone className={`w-4 h-4 ${getThemeTextClass()}`} />
              <span className="font-display">+7 (949) 340-10-11</span>
            </a>
            
            <button
              onClick={onOpenCallback}
              className={`text-xs font-black tracking-wider uppercase px-5 py-3 rounded-lg shadow-md transition-all duration-300 transform active:scale-95 cursor-pointer font-display ${getThemeButtonClass()}`}
            >
              Заказать звонок
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center gap-3">
            <a 
              href="tel:+79493401011"
              className={`p-2.5 rounded-lg bg-slate-900 border border-slate-855 ${getThemeTextClass()}`}
            >
              <Phone className="w-5 h-5" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-900 transition-all"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Drawer Menu (Expanded overlay as in image 2) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[999] flex flex-col bg-[#121214] font-sans">
          
          {/* Drawer Top Header bar */}
          <div className="flex justify-between items-center px-6 h-20 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
            <div className="font-display font-black text-xl text-white uppercase sm:text-2xl">
              <span className={getThemeTextClass()}>#</span>ГориЯсно<span className={getThemeTextClass()}>#</span>
            </div>
            
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white rounded-full hover:bg-slate-900 transition-all focus:outline-none"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col justify-between">
            
            {/* Custom Links */}
            <nav className="flex flex-col gap-6">
              <button
                onClick={() => scrollToSection("catalog")}
                className="w-full text-left font-display font-medium text-2xl text-slate-200 hover:text-white py-4 border-b border-slate-900 flex justify-between items-center group cursor-pointer"
              >
                <span>Каталог</span>
                <span className={`text-[12px] font-bold uppercase ${getThemeTextClass()}`}>В каталог &rarr;</span>
              </button>

              <button
                onClick={() => scrollToSection("process")}
                className="w-full text-left font-display font-medium text-2xl text-slate-200 hover:text-white py-4 border-b border-slate-900 flex justify-between items-center group cursor-pointer"
              >
                <span>Как мы работаем</span>
                <span className={`text-[12px] font-bold uppercase ${getThemeTextClass()}`}>Процесс &rarr;</span>
              </button>

              <button
                onClick={() => scrollToSection("contacts")}
                className="w-full text-left font-display font-medium text-2xl text-slate-200 hover:text-white py-4 border-b border-slate-900 flex justify-between items-center group cursor-pointer"
              >
                <span>Контакты</span>
                <span className={`text-[12px] font-bold uppercase ${getThemeTextClass()}`}>Адрес и карта &rarr;</span>
              </button>
            </nav>

            {/* Bottom Contact card wrapper */}
            <div className="mt-auto space-y-6">
              
              {/* Phone display */}
              <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-xl border border-slate-850">
                <div className={`p-3 rounded-lg bg-slate-950 ${getThemeTextClass()} border border-slate-800`}>
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Отдел продаж Донецк</p>
                  <a href="tel:+79493401011" className="text-lg font-black text-white font-display">+7 (949) 340-10-11</a>
                </div>
              </div>

              {/* Sub description text */}
              <p className="text-slate-400 text-xs leading-relaxed font-sans px-1">
                Поставляем высококачественный фасованный антрацит и дрова твердых пород (дуб, граб, акация) со склада прямо в день звонка по городу Донецку и пригородам.
              </p>

              {/* Drawer callback button CTA */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenCallback();
                }}
                className={`w-full py-4 rounded-xl font-bold text-center flex items-center justify-center gap-2 text-sm shadow-md transition-all font-display ${getThemeButtonClass()}`}
              >
                <Phone className="w-4 h-4" />
                <span>Заказать звонок</span>
              </button>

              {/* Messengers */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1 font-sans">
                <a 
                  href="https://t.me/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-lg text-slate-300 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>Telegram</span>
                </a>
                <a 
                  href="https://wa.me/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-850 border border-slate-850 rounded-lg text-slate-300 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-green-400" />
                  <span>WhatsApp</span>
                </a>
              </div>

            </div>
          </div>

          {/* Footer copyright block */}
          <footer className="py-4 border-t border-slate-900 text-center bg-slate-950">
            <span className="text-[10px] text-slate-600 font-sans">© 2026 #ГориЯсно#. Поставки тепла в Донецке.</span>
          </footer>

        </div>
      )}
    </>
  );
}
