/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Paintbrush, 
  Eye, 
  MessageSquare, 
  Database, 
  HelpCircle, 
  Trash2, 
  Check, 
  MapPin, 
  Plus, 
  X, 
  Sliders,
  FileCheck
} from "lucide-react";
import { MockupConfig, DesignNote, FeedbackSubmission } from "../types";

interface DesignReviewToolbarProps {
  config: MockupConfig;
  setConfig: React.Dispatch<React.SetStateAction<MockupConfig>>;
  notes: DesignNote[];
  addNote: (text: string, x: number, y: number) => void;
  deleteNote: (id: string) => void;
  submissions: FeedbackSubmission[];
  clearSubmissions: () => void;
  simulateSampleSubmission: () => void;
}

export default function DesignReviewToolbar({
  config,
  setConfig,
  notes,
  addNote,
  deleteNote,
  submissions,
  clearSubmissions,
  simulateSampleSubmission,
}: DesignReviewToolbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"themes" | "notes" | "submissions" | "help">("themes");
  const [newNoteText, setNewNoteText] = useState("");
  const [isPinningMode, setIsPinningMode] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const handleThemeChange = (theme: "slate-fire" | "cool-slate" | "cozy-wood") => {
    setConfig(prev => ({ ...prev, theme }));
  };

  const handleToggleGuides = () => {
    setConfig(prev => ({ ...prev, showGuides: !prev.showGuides }));
  };

  const handleToggleNotesMode = () => {
    setIsPinningMode(!isPinningMode);
    if (!isPinningMode) {
      alert("Режим отзывов включен! Кликните в любом месте веб-страницы ниже, чтобы оставить заметку-замечание по дизайну в этой точке.");
    }
  };

  const startPinningInstruction = () => {
    setIsPinningMode(true);
  };

  return (
    <>
      {/* Small floating button when closed */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2">
        {isPinningMode && (
          <div className="bg-red-600 text-white font-medium text-xs px-3 py-2 rounded-lg shadow-lg border border-red-500 animate-pulse text-center">
            📌 Режим разметки активен.
            <button 
              onClick={() => setIsPinningMode(false)}
              className="ml-2 underline font-bold hover:text-black"
            >
              Отмена
            </button>
          </div>
        )}
        <button
          onClick={toggleOpen}
          id="btn_toggle_review_toolbar"
          className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold px-4 py-3 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Sliders className="w-5 h-5 animate-spin-slow" />
          <span>Панель Согласования</span>
          {notes.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] text-amber-500 font-bold border border-amber-500">
              {notes.length}
            </span>
          )}
        </button>
      </div>

      {/* Floating pinning banner at the top of the viewport when pinning mode is active */}
      {isPinningMode && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[99999] bg-slate-900 border border-amber-500 rounded-full py-3 px-6 shadow-2xl flex items-center gap-4 text-sm text-on-surface">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span><strong>Режим правок:</strong> Нажмите на любой элемент дизайна на сайте, чтобы оставить комментарий заказчика.</span>
          <button
            onClick={() => setIsPinningMode(false)}
            className="bg-slate-800 hover:bg-slate-700 text-amber-500 text-xs px-3 py-1.5 rounded-full font-bold transition-all"
          >
            Прекратить
          </button>
        </div>
      )}

      {/* Sidebar Overlay Panels */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-slate-950/95 backdrop-blur-md border-l border-slate-800 z-[9998] shadow-2xl flex flex-col font-sans transition-all duration-300">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-white">
              <Paintbrush className="w-5 h-5 text-orange-500" />
              <div>
                <h3 className="font-bold text-sm tracking-tight">СОГЛАСОВАНИЕ МАКЕТА</h3>
                <p className="text-[10px] text-slate-400">Презентация для Заказчика</p>
              </div>
            </div>
            <button 
              onClick={toggleOpen}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats / Form Notification */}
          {submissions.length > 0 && (
            <div className="bg-orange-600/20 border-b border-orange-500/30 p-3 flex items-center justify-between">
              <span className="text-xs text-orange-200 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-orange-400" />
                <span>Получена тестовая форма ({submissions.length})</span>
              </span>
              <button 
                onClick={() => setActiveTab("submissions")}
                className="text-xs bg-orange-500/30 hover:bg-orange-500/50 text-white font-medium px-2 py-0.5 rounded transition-all"
              >
                Посмотреть
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="grid grid-cols-4 border-b border-slate-800 text-xs text-center font-medium">
            <button
              onClick={() => { setActiveTab("themes"); setIsPinningMode(false); }}
              className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
                activeTab === "themes" 
                  ? "border-orange-500 text-orange-500 bg-slate-900/30" 
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Paintbrush className="w-4 h-4" />
              <span>Дизайн</span>
            </button>
            <button
              onClick={() => { setActiveTab("notes"); }}
              className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
                activeTab === "notes" 
                  ? "border-orange-500 text-orange-500 bg-slate-900/30" 
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Правки ({notes.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab("submissions"); setIsPinningMode(false); }}
              className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
                activeTab === "submissions" 
                  ? "border-orange-500 text-orange-500 bg-slate-900/30" 
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <Database className="w-4 h-4" />
              <span>База ({submissions.length})</span>
            </button>
            <button
              onClick={() => { setActiveTab("help"); setIsPinningMode(false); }}
              className={`py-3 flex flex-col items-center gap-1 border-b-2 transition-all ${
                activeTab === "help" 
                  ? "border-orange-500 text-orange-500 bg-slate-900/30" 
                  : "border-transparent text-slate-400 hover:text-white"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Инструкция</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5">
            {activeTab === "themes" && (
              <div className="space-y-5">
                {/* Visual Preset Selector */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Цветовые концепции</h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    Заказчик может мгновенно переключать палитру сайта, чтобы утвердить её до начала вёрстки:
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    <button
                      onClick={() => handleThemeChange("slate-fire")}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        config.theme === "slate-fire"
                          ? "bg-slate-900 border-orange-500/80 text-white shadow-md shadow-orange-950/20"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-orange-500"></span>
                          Версия 1: Угольное пламя (Default)
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Антрацитово-темные тона, яркий оранжевый огонь</p>
                      </div>
                      {config.theme === "slate-fire" && <Check className="w-4 h-4 text-orange-500" />}
                    </button>

                    <button
                      onClick={() => handleThemeChange("cool-slate")}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        config.theme === "cool-slate"
                          ? "bg-slate-900 border-sky-500/80 text-white shadow-md shadow-sky-950/20"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-sky-400"></span>
                          Версия 2: Ледяной антрацит
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Металлическая гамма, строгие синие акценты надежности</p>
                      </div>
                      {config.theme === "cool-slate" && <Check className="w-4 h-4 text-sky-400" />}
                    </button>

                    <button
                      onClick={() => handleThemeChange("cozy-wood")}
                      className={`flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                        config.theme === "cozy-wood"
                          ? "bg-slate-900 border-amber-500/80 text-white shadow-md shadow-amber-950/20"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div>
                        <p className="font-bold text-xs flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                          Версия 3: Теплые дрова
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Богатый золотой оттенок осенних дров и уюта печи</p>
                      </div>
                      {config.theme === "cozy-wood" && <Check className="w-4 h-4 text-amber-500" />}
                    </button>
                  </div>
                </div>

                {/* Grid Overlay Guides */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Инструменты верстки</h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    Включите сетку направляющих, чтобы согласовать правильность выравнивания колонок и полей:
                  </p>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs font-bold text-white">Включить сетку и отступы</p>
                        <p className="text-[10px] text-slate-400">Показывает внешние границы контейнеров</p>
                      </div>
                    </div>
                    <button
                      onClick={handleToggleGuides}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        config.showGuides ? "bg-orange-600" : "bg-slate-700"
                      }`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        config.showGuides ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>

                {/* State Demonstrator */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Демонстрация переходов</h4>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-semibold">
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, mockupStage: "landing" }))}
                      className={`px-3 py-2 text-xs rounded border text-center transition-all ${
                        config.mockupStage === "landing" 
                          ? "bg-slate-900 border-orange-500 text-white" 
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      Главная страница
                    </button>
                    <button
                      onClick={() => setConfig(prev => ({ ...prev, mockupStage: "success" }))}
                      className={`px-3 py-2 text-xs rounded border text-center transition-all ${
                        config.mockupStage === "success" 
                          ? "bg-slate-900 border-green-500 text-white" 
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      Экран «Отправлено»
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    Добавить замечание к макету
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    Вы или ваш заказчик можете размещать комментарии в любых точках экрана. Включите режим, закройте панель и нажмите мышкой на любое место страницы.
                  </p>
                  
                  <button
                    onClick={handleToggleNotesMode}
                    className={`w-full py-2 px-3 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      isPinningMode
                        ? "bg-red-600 hover:bg-red-500 text-white"
                        : "bg-orange-600 hover:bg-orange-500 text-slate-950"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    {isPinningMode ? "Выключить режим меток" : "Активировать режим разметки"}
                  </button>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Список активных правок ({notes.length})
                  </span>

                  {notes.length === 0 ? (
                    <div className="text-center py-6 text-slate-500 text-xs text-slate-500">
                      Нет замечаний. Дизайн выглядит безупречно!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {notes.map(note => (
                        <div 
                          key={note.id} 
                          className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 space-y-2 relative"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-extrabold text-xs text-amber-500">{note.author}</span>
                              <span className="text-[9px] text-slate-500 block">{note.timestamp}</span>
                            </div>
                            <button
                              onClick={() => deleteNote(note.id)}
                              className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-800 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-300 leading-normal bg-slate-950/40 p-2 rounded border border-slate-900">
                            {note.text}
                          </p>
                          <div className="text-[9px] text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-orange-500" />
                            <span>Точка привязки: {Math.round(note.xPercent)}% X, {Math.round(note.yPercent)}% Y</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="space-y-4">
                <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 text-orange-400">
                    <Database className="w-4 h-4" />
                    База данных заявок
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal">
                    Макет имитирует реальное сохранение данных на сервере. Здесь вы можете продемонстрировать клиенту, какая информация сохраняется у менеджера при отправке форм:
                  </p>
                  <div className="flex gap-2 pt-1 font-semibold">
                    <button
                      onClick={simulateSampleSubmission}
                      className="flex-1 bg-slate-800 hover:bg-slate-750 text-white text-[11px] py-1.5 rounded transition-all"
                    >
                      Сгенерировать тест
                    </button>
                    {submissions.length > 0 && (
                      <button
                        onClick={clearSubmissions}
                        className="bg-red-950/20 hover:bg-red-900/30 text-red-400 text-[11px] px-3 py-1.5 rounded border border-red-900/30 transition-all flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Очистить
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Полученные заявки ({submissions.length})
                  </span>

                  {submissions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
                      База сообщений пуста. Заполните форму заказа внизу страницы или нажмите «Рассчитать доставку», чтобы увидеть логирование.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                      {submissions.map(sub => (
                        <div 
                          key={sub.id} 
                          className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-xs space-y-2"
                        >
                          <div className="flex justify-between items-center bg-slate-950/60 p-1.5 rounded">
                            <span className="font-extrabold text-[10px] uppercase text-amber-500 tracking-wider">
                              {sub.sourceForm === "callback" && "📞 Обратный звонок"}
                              {sub.sourceForm === "main_footer" && "✉️ Нижняя форма"}
                              {sub.sourceForm === "catalog_order" && "🔥 Заказ товара"}
                              {sub.sourceForm === "calculator" && "🚗 Калькулятор"}
                            </span>
                            <span className="text-[9px] text-slate-500">{sub.submittedAt}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-y-1 text-[11px] text-slate-300">
                            <div>Имя:</div>
                            <div className="font-medium text-white">{sub.name}</div>
                            <div>Телефон:</div>
                            <div className="font-medium text-white">{sub.phone}</div>
                            {sub.productName && (
                              <>
                                <div>Продукт:</div>
                                <div className="font-medium text-orange-400">{sub.productName}</div>
                              </>
                            )}
                            {sub.message && (
                              <>
                                <div>Сообщение:</div>
                                <div className="font-medium text-white bg-slate-950/30 p-1 rounded select-all break-words">{sub.message}</div>
                              </>
                            )}
                          </div>

                          {sub.calculatorDetails && (
                            <div className="bg-orange-950/20 p-2 rounded border border-orange-900/20 text-[10px] text-orange-200 mt-2 space-y-1">
                              <p className="font-bold border-b border-orange-900/30 pb-0.5 uppercase tracking-wide">Расчет доставки:</p>
                              <div className="grid grid-cols-2">
                                <span>Объем/Вес:</span>
                                <span className="font-medium">{sub.calculatorDetails.qty} {sub.calculatorDetails.unit}</span>
                                <span>Зона доставки:</span>
                                <span className="font-medium truncate">{sub.calculatorDetails.deliveryArea}</span>
                                <span>Стоимость заказа:</span>
                                <span className="font-bold text-white">{sub.calculatorDetails.estimatedCost}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "help" && (
              <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
                <h4 className="font-bold text-white text-sm">Руководство по согласованию</h4>
                <p>
                  Этот интерактивный макет разработан для веб-дизайнеров и агентств, чтобы согласовать проект с заказчиком за 1 встречу.
                </p>
                <div className="space-y-2 bg-slate-900/40 p-2 rounded border border-slate-800">
                  <p className="font-bold text-amber-500">Возможности макета:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                    <li>Смена палитры на лету (Amber, Coral, Ice-Slate).</li>
                    <li>Полная имитация оформления заказа в клик.</li>
                    <li>Удобный калькулятор тоннажности и доставки.</li>
                    <li>Интерактивный логгер заявок во вкладке «База».</li>
                  </ul>
                </div>
                <p>
                  <strong>Как добавить пин-замечание:</strong> Нажмите «Активировать режим разметки», панель свернется. Кликните в ту точку макета, которую хотите скорректировать. Напишите текст и подтвердите — метка появится на экране в качестве маркера-разметки!
                </p>
                <p className="text-[10px] text-slate-500 italic">
                  * Все добавленные пины сохраняются и восстанавливаются локально в браузере.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
