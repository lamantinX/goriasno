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

import { Product, FeedbackSubmission, DesignNote, MockupConfig } from "./types";
import { INITIAL_DESIGN_NOTES, PRODUCTS } from "./data";

import Header from "./components/Header";
import Hero from "./components/Hero";
import Catalog from "./components/Catalog";
import HowWeWork from "./components/HowWeWork";
import FeedbackSection from "./components/FeedbackSection";
import SuccessState from "./components/SuccessState";
import Modal from "./components/Modal";
import DesignReviewToolbar from "./components/DesignReviewToolbar";

export default function App() {
  // Mockup configurations state
  const [config, setConfig] = useState<MockupConfig>({
    theme: "slate-fire",
    showGuides: false,
    mockupStage: "landing",
    placedNotesEnabled: false,
  });

  // Client comments / design annotations state
  const [notes, setNotes] = useState<DesignNote[]>([]);
  
  // Simulated submissions database
  const [submissions, setSubmissions] = useState<FeedbackSubmission[]>([]);

  // Modal visibility states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFormType, setModalFormType] = useState<"callback" | "order" | "calculator">("callback");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [calcDetails, setCalcDetails] = useState<any | null>(null);

  // Active hover states for note pins tooltip
  const [hoveredNoteId, setHoveredNoteId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch initial notes and submissions on load
  useEffect(() => {
    const savedNotes = localStorage.getItem("goriyasno_mockup_notes");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        setNotes(INITIAL_DESIGN_NOTES);
      }
    } else {
      setNotes(INITIAL_DESIGN_NOTES);
    }

    const savedSubmissions = localStorage.getItem("goriyasno_mockup_submissions");
    if (savedSubmissions) {
      try {
        setSubmissions(JSON.parse(savedSubmissions));
      } catch (e) {
        setSubmissions([]);
      }
    }
  }, []);

  // Save notes to localStorage when changed
  const saveNotes = (updatedNotes: DesignNote[]) => {
    setNotes(updatedNotes);
    localStorage.setItem("goriyasno_mockup_notes", JSON.stringify(updatedNotes));
  };

  // Save submissions to localStorage when changed
  const saveSubmissions = (updatedSubmissions: FeedbackSubmission[]) => {
    setSubmissions(updatedSubmissions);
    localStorage.setItem("goriyasno_mockup_submissions", JSON.stringify(updatedSubmissions));
  };

  // Add Comment Pin
  const handlePageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if review pinning mode is active
    const isPinningEnabled = document.getElementById("btn_toggle_review_toolbar")?.parentElement;
    // We can check if pinning is activated (we store state or check active top-banner)
    const topPinningActive = document.querySelector(".fixed.top-4"); // indicates active banner
    
    if (!topPinningActive) return; // normal navigation click

    e.preventDefault();
    e.stopPropagation();

    if (!containerRef.current) return;

    // Calculate coordinates percentages
    const bounds = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - bounds.left) / bounds.width) * 100;
    const y = ((e.clientY - bounds.top) / bounds.height) * 100;

    // Trigger standard dialog box safely
    const commentText = window.prompt(
      "📝 Размещение комментария заказчика:\nПожалуйста, введите ваше замечание или пожелание по дизайну в этой точке:"
    );

    if (commentText === null) return; // cancelled

    if (!commentText.trim()) {
      alert("Текст комментария не может быть пустым.");
      return;
    }

    // Capture author context
    const authorName = window.prompt("Введите ваше имя/должность в макете (по умолчанию: Заказчик):") || "Заказчик";

    const newNote: DesignNote = {
      id: "note-" + Math.random().toString(36).substr(2, 9),
      author: authorName,
      text: commentText,
      xPercent: x,
      yPercent: y,
      timestamp: new Date().toLocaleTimeString() + ", " + new Date().toLocaleDateString(),
      isResolved: false
    };

    const updatedNotes = [...notes, newNote];
    saveNotes(updatedNotes);
    
    // De-activate pinning banner (will auto hide because of DOM selector watch)
    alert("Заметка добавлена успешно! Вы можете навести курсор на возникшую оранжевую метку для просмотра.");
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
  };

  const clearSubmissions = () => {
    saveSubmissions([]);
  };

  // Triggers submitting sample dataset
  const simulateSampleSubmission = () => {
    const randomProduct = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
    const names = ["Алексей Котов", "Елена Ворошилова", "Дмитрий Макеев", "Виталий Киров"];
    const phones = ["+7 (949) 341-20-41", "+7 (949) 551-30-20", "+7 (949) 993-22-11", "+7 (949) 714-35-90"];
    
    const sampleSub: FeedbackSubmission = {
      id: "sub-demo-" + Math.random().toString(36).substr(2, 9),
      name: names[Math.floor(Math.random() * names.length)],
      phone: phones[Math.floor(Math.random() * phones.length)],
      productName: randomProduct.name,
      message: "Тестовая демонстрация прохождения заявки. Уточнить скидку на объем!",
      sourceForm: "main_footer",
      submittedAt: new Date().toLocaleTimeString() + ", " + new Date().toLocaleDateString()
    };

    saveSubmissions([...submissions, sampleSub]);
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
      <div 
        ref={containerRef}
        onClick={handlePageClick}
        className="relative"
      >
        {/* Render Floating Review comments pins */}
        {notes.map(note => {
          const isHovered = hoveredNoteId === note.id;
          return (
            <div
              key={note.id}
              style={{ top: `${note.yPercent}%`, left: `${note.xPercent}%` }}
              className="absolute z-[9900]"
              onMouseEnter={() => setHoveredNoteId(note.id)}
              onMouseLeave={() => setHoveredNoteId(null)}
            >
              {/* Colored pin pulse animation */}
              <span className="flex h-5 w-5 relative cursor-help transform hover:scale-110 transition-transform">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-5 w-5 bg-gradient-to-r from-orange-600 to-amber-500 border border-slate-950 shadow-2xl items-center justify-center text-[10px] text-white font-extrabold font-display">
                  ✏️
                </span>
              </span>

              {/* Pin Hover Detail Tooltip */}
              {isHovered && (
                <div className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-slate-950 border border-amber-500 rounded-xl p-3.5 shadow-2xl text-xs w-64 space-y-1.5 z-[9951] text-left animate-in fade-in slide-in-from-left duration-200">
                  <div className="flex justify-between items-center pb-1 border-b border-slate-900">
                    <strong className="text-amber-500 text-xs">{note.author}</strong>
                    <span className="text-[9px] text-slate-500">{note.timestamp}</span>
                  </div>
                  <p className="text-slate-350 leading-relaxed text-[11px] bg-slate-900/60 p-2 rounded">
                    {note.text}
                  </p>
                  <p className="text-[9px] text-slate-500 italic block">
                    Добавлено интерактивно клиентом в макете
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Presentational Header with info */}
        <div className="bg-slate-900/40 border-b border-slate-900 h-9 flex items-center justify-center text-center text-[10px] font-sans tracking-wide space-x-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
          <span className="text-slate-400"><strong>Мкет Согласования Дизайна:</strong> Клиент может кликать, заполнять формы обратной связи и менять гаммы в меню справа!</span>
        </div>

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

      {/* Persistent Presentational Toolbars */}
      <DesignReviewToolbar 
        config={config}
        setConfig={setConfig}
        notes={notes}
        addNote={(text, x, y) => {
          const timestamp = new Date().toLocaleTimeString() + ", " + new Date().toLocaleDateString();
          const nNote: DesignNote = {
            id: "note-" + Math.random().toString(36).substr(2, 9),
            author: "Заказчик",
            text,
            xPercent: x,
            yPercent: y,
            timestamp,
            isResolved: false
          };
          saveNotes([...notes, nNote]);
        }}
        deleteNote={deleteNote}
        submissions={submissions}
        clearSubmissions={clearSubmissions}
        simulateSampleSubmission={simulateSampleSubmission}
      />

    </div>
  );
}
