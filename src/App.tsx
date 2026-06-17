/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  MessageCircle, 
  Send, 
  MapPin, 
  HelpCircle, 
  Layers, 
  X, 
  Home, 
  CheckCircle,
  FileText,
  Sliders,
  Sparkles
} from "lucide-react";

import { Product, FeedbackSubmission, MockupConfig } from "./types";
import { PRODUCTS } from "./data";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Catalog from "./components/Catalog";
import HowWeWork from "./components/HowWeWork";
import FeedbackSection from "./components/FeedbackSection";
import SuccessState from "./components/SuccessState";
import Modal from "./components/Modal";


export default function App() {
  // Mockup configurations state
  const [config, setConfig] = useState<MockupConfig>({
    theme: "cozy-wood",
    showGuides: false,
    mockupStage: "landing",
    placedNotesEnabled: false,
  });


  
  // Simulated submissions database
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);

  // Modal visibility states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFormType, setModalFormType] = useState<"callback" | "order" | "calculator">("callback");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [calcDetails, setCalcDetails] = useState<any | null>(null);



  // Fetch initial submissions on load
  useEffect(() => {
    const savedSubmissions = localStorage.getItem("goriyasno_mockup_submissions");
    if (savedSubmissions) {
      try {
        setSubmissions(JSON.parse(savedSubmissions));
      } catch (e) {
        setSubmissions([]);
      }
    }
  }, []);



  // Save submissions to localStorage when changed
  const saveSubmissions = (updatedSubmissions: FeedbackSubmission[]) => {
    setSubmissions(updatedSubmissions);
    localStorage.setItem("goriyasno_mockup_submissions", JSON.stringify(updatedSubmissions));
  };

  

  // Form Submission callback logic
  const handleFormSubmissionSuccess = (submission: FeedbackSubmission) => {
    // Add to submissions database log
    const updatedSubmissions = [...submissions, submission];
    saveSubmissions(updatedSubmissions);

    // Hide Modal if open
    setIsModalOpen(false);

    // Redirect screen wrapper to Success Receipt transaction stage
    setConfig(prev => ({ 
      ...prev, 
      mockupStage: "success" 
    }));
  };

  // Catalog Call-to-action ordering trigger
  const handleSelectProductForOrder = (product: Product) => {
    setSelectedProduct(product);
    setCalcDetails(null);
    setModalFormType("order");
    setIsModalOpen(true);
  };

  // Calculator ordering trigger
  const handleSelectCalculatorForOrder = (details: any) => {
    setSelectedProduct(null);
    setCalcDetails(details);
    setModalFormType("calculator");
    setIsModalOpen(true);
  };

  // Colors context helper based on config.theme
  const getThemeClass = () => {
    if (config.theme === "cool-slate") return "theme-cool text-slate-300";
    if (config.theme === "cozy-wood") return "theme-cozy text-slate-350";
    return "theme-slate-fire text-slate-300"; // default orange-fire
  };

  const getThemeTextClass = () => {
    if (config.theme === "cool-slate") return "text-sky-400";
    if (config.theme === "cozy-wood") return "text-amber-500";
    return "text-orange-500";
  };

  // Guides bounding highlight helpers
  const getGuidesClass = () => {
    return config.showGuides 
      ? "border border-dashed border-rose-500/50 bg-rose-500/[0.015] relative p-1 transition-all" 
      : "transition-all";
  };

  const latestSub = submissions.length > 0 ? submissions[submissions.length - 1] : null;

  return (
    <div className={`min-h-screen text-on-surface bg-[#0a0a0c] selection:bg-orange-500 selection:text-slate-950 font-sans cursor-default transition-colors duration-300 ${getThemeClass()}`}>
      
      {/* Visual Design Annotation overlay pins context */}
      <div className="relative">



        {/* APP VIEWPORTS RENDERING RANGES */}
        {config.mockupStage === "landing" ? (
          <>
            {/* Header section bound */}
            <div className={getGuidesClass()}>
              {config.showGuides && (
                <div className="absolute top-1 left-2 bg-rose-500 text-white text-[9px] px-1 rounded z-20 font-bold uppercase tracking-wider">Шапка (NavBar) Container</div>
              )}
              <Header 
                onOpenCallback={() => {
                  setSelectedProduct(null);
                  setCalcDetails(null);
                  setModalFormType("callback");
                  setIsModalOpen(true);
                }} 
                theme={config.theme}
              />
            </div>

            {/* Hero promo block with Warehouse Status & Live Stock */}
            <div className={getGuidesClass()}>
              {config.showGuides && (
                <div className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] px-1 rounded z-20 font-bold uppercase tracking-wider">Промо баннер + Состояние склада</div>
              )}
              <Hero 
                theme={config.theme}
              />
            </div>

            {/* Catalog tab section */}
            <div className={getGuidesClass()}>
              {config.showGuides && (
                <div className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] px-1 rounded z-20 font-bold uppercase tracking-wider">Компонент: Сортируемый Каталог</div>
              )}
              <Catalog 
                onSelectProduct={handleSelectProductForOrder}
                theme={config.theme}
              />
            </div>

            {/* Steps explanations section */}
            <div className={getGuidesClass()}>
              {config.showGuides && (
                <div className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] px-1 rounded z-20 font-bold uppercase tracking-wider">Информационный блок: Процесс</div>
              )}
              <HowWeWork theme={config.theme} />
            </div>

            {/* Main bottom feedback with interactive map */}
            <div className={getGuidesClass()}>
              {config.showGuides && (
                <div className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] px-1 rounded z-20 font-bold uppercase tracking-wider">Подвал обратной связи + Экспресс Карта</div>
              )}
              <FeedbackSection 
                onSubmitSuccess={handleFormSubmissionSuccess}
                theme={config.theme}
              />
            </div>
          </>
        ) : (
          /* Transaction check success state screen */
          <div className={getGuidesClass()}>
            {config.showGuides && (
              <div className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] px-1 rounded z-20 font-bold uppercase tracking-wider">Компонент: Нажатие формы (Успех)</div>
            )}
            <SuccessState 
              submission={latestSub}
              onBack={() => setConfig(prev => ({ ...prev, mockupStage: "landing" }))}
              theme={config.theme}
            />
          </div>
        )}

        {/* Global Footer trademark details */}
        <footer className="bg-slate-950 py-8 border-t border-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="text-center md:text-left space-y-1">
              <a href="#" className="font-display font-bold text-white text-lg tracking-tight uppercase select-none">
                <span className={getThemeTextClass()}>#</span>ГориЯсно<span className={getThemeTextClass()}>#</span>
              </a>
              <p className="text-[11px] text-slate-500 font-sans">
                Угольный склад «ГориЯсно», Донецк. Поставки антрацита и дров с точным ОПС взвешиванием по всей ДНР.
              </p>
            </div>

            {/* Quick anchors */}
            <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400 font-sans justify-center">
              <a href="#privacy" className="hover:text-white">Политика конфиденциальности</a>
              <a href="#rules" className="hover:text-white">Договор публичной оферты</a>
              <a href="https://t.me/" className="hover:text-white text-sky-400">Telegram</a>
              <a href="https://wa.me/" className="hover:text-white text-green-400">WhatsApp</a>
            </div>

          </div>
        </footer>

      </div>

      {/* Global Form Modal Dialogue */}
      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formType={modalFormType}
        selectedProduct={selectedProduct}
        calculatorDetails={calcDetails}
        onSubmitSuccess={handleFormSubmissionSuccess}
        theme={config.theme}
      />

    </div>
  );
}
