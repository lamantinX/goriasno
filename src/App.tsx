/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

import type { Product, FeedbackSubmission, MockupConfig } from "./types";

import Header from "./components/Header";
import SuccessState from "./components/SuccessState";
import Modal from "./components/Modal";

// Контекст layout-а для дочерних роутов (Home, ProductPage) через <Outlet context>.
export interface LayoutContext {
  theme: MockupConfig["theme"];
  onSelectProduct: (product: Product) => void;
  onSubmitSuccess: (submission: FeedbackSubmission) => void;
}


export default function App() {
  // Mockup configurations state
  const [config, setConfig] = useState<MockupConfig>({
    theme: "cozy-wood",
    mockupStage: "landing",
  });


  
  // Simulated submissions database
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);

  // Modal visibility states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFormType, setModalFormType] = useState<"callback" | "order">("callback");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);




  // Fetch initial submissions on load
  useEffect(() => {
    const savedSubmissions = localStorage.getItem("goriyasno_mockup_submissions");
    if (savedSubmissions) {
      try {
        setSubmissions(JSON.parse(savedSubmissions));
      } catch {
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
    setModalFormType("order");
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

  const latestSub = submissions.length > 0 ? submissions[submissions.length - 1] : null;

  return (
    <div className={`min-h-screen text-on-surface bg-[#0a0a0c] selection:bg-orange-500 selection:text-slate-950 font-sans cursor-default transition-colors duration-300 ${getThemeClass()}`}>
      
      {/* Visual Design Annotation overlay pins context */}
      <div className="relative">



        {/* APP VIEWPORTS RENDERING RANGES */}
        {config.mockupStage === "landing" ? (
          <>
            {/* Header section bound */}
            <div className="transition-all">
              <Header
                onOpenCallback={() => {
                  setSelectedProduct(null);
                  setModalFormType("callback");
                  setIsModalOpen(true);
                }}
                theme={config.theme}
              />
            </div>

            <main>
              {/* Дочерний роут (Home / ProductPage / NotFound) */}
              <Outlet
                context={{
                  theme: config.theme,
                  onSelectProduct: handleSelectProductForOrder,
                  onSubmitSuccess: handleFormSubmissionSuccess,
                } satisfies LayoutContext}
              />
            </main>
          </>
        ) : (
          <main>
          /* Transaction check success state screen */
          <div className="transition-all">
            <SuccessState
              submission={latestSub}
              onBack={() => setConfig(prev => ({ ...prev, mockupStage: "landing" }))}
              theme={config.theme}
            />
          </div>
          </main>
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

            <div className="flex flex-col gap-4">
              {/* Товарные страницы */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-400 font-sans justify-center md:justify-end">
                <a href="/anthracite/" className="hover:text-white">Антрацит</a>
                <a href="/ugol-marki-t/" className="hover:text-white">Уголь марки Т</a>
                <a href="/ugol-dg/" className="hover:text-white">Уголь ДГ</a>
                <a href="/drova/" className="hover:text-white">Дрова</a>
                <a href="/pesok-shcheben/" className="hover:text-white">Песок/щебень</a>
                <a href="/vyvoz-musora/" className="hover:text-white">Вывоз мусора</a>
                <a href="/#contacts" className="hover:text-white">Контакты</a>
              </div>

              {/* Quick anchors */}
              <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-400 font-sans justify-center md:justify-end">
                <a href="/privacy.html" className="hover:text-white">Политика конфиденциальности</a>
                <a href="/privacy.html#offer" className="hover:text-white">Договор публичной оферты</a>
                <a href="https://t.me/ugol_donbassa" className="hover:text-white text-sky-400">Telegram</a>
                <a href="tel:+79889946896" className="hover:text-white text-orange-400">МТС: +7 (988) 994-68-96</a>
              </div>
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

        onSubmitSuccess={handleFormSubmissionSuccess}
        theme={config.theme}
      />

    </div>
  );
}
