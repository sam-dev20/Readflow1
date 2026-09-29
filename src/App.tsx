/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { PASSAGES } from './data/passages';
import { FALLBACK_PASSAGES } from './data/fallbackPassages';
import {
  Passage,
  SessionConfig,
  TFNGAnswer,
  SessionRecord,
  FontFamily,
  FontSize,
  LineHeight,
  ReadingTheme,
  ColumnWidth,
} from './types/reading';
import {
  getStoredHistory,
  saveSessionRecord,
  recordPassageVisit,
  clearStoredHistory,
  deleteSessionRecord,
  getCustomPassages,
  saveCustomPassage,
  getStoredGeneratedPassages,
  getStoredSettings,
  saveStoredSettings,
} from './utils/storage';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { PassageViewer } from './components/PassageViewer';
import { QuestionPanel } from './components/QuestionPanel';
import { TimerBar } from './components/TimerBar';
import { BottomMoverBar } from './components/BottomMoverBar';
import { SessionConfigModal } from './components/SessionConfigModal';
import { ResultsModal } from './components/ResultsModal';
import { CustomPassageModal } from './components/CustomPassageModal';
import { GeneratePassageModal } from './components/GeneratePassageModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Check, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Stored preferences
  const settings = getStoredSettings();

  // App View navigation: 'home' | 'reader'
  const [currentView, setCurrentView] = useState<'home' | 'reader'>('home');

  // Passages list (curated + stored generated + fallback bank + custom)
  const [allPassages, setAllPassages] = useState<Passage[]>(() => {
    const custom = getCustomPassages();
    const storedGen = getStoredGeneratedPassages();
    const map = new Map<string, Passage>();
    [...PASSAGES, ...storedGen, ...FALLBACK_PASSAGES, ...custom].forEach((p) => {
      if (!map.has(p.id)) {
        map.set(p.id, p);
      }
    });
    return Array.from(map.values());
  });

  // Current session configuration
  const [config, setConfig] = useState<SessionConfig>({
    passageId: 'brain-tricks-perception',
    difficulty: 'medium',
    questionMode: 'both',
    immediateFeedback: settings.immediateFeedback,
    timerMinutes: settings.defaultTimerMinutes || 15,
  });

  // Find active passage
  const activePassage =
    allPassages.find((p) => p.id === config.passageId) || allPassages[0];

  // User answers
  const [userTfngAnswers, setUserTfngAnswers] = useState<{ [id: number]: TFNGAnswer }>({});
  const [userBlankAnswers, setUserBlankAnswers] = useState<{ [id: number]: string }>({});
  const [submittedBlankIds, setSubmittedBlankIds] = useState<Set<number>>(new Set());

  // Timer state - NOT started automatically on entry!
  const isUntimed = config.timerMinutes === 0;
  const totalSeconds = config.timerMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timeSpentSeconds, setTimeSpentSeconds] = useState<number>(0);

  // Paragraph highlight targeting
  const [highlightedParagraphId, setHighlightedParagraphId] = useState<string | null>(null);

  // Reader typography & adjustments settings
  const [fontFamily, setFontFamily] = useState<FontFamily>(settings.fontFamily || 'serif');
  const [fontSize, setFontSize] = useState<FontSize>(settings.fontSize || 'base');
  const [lineHeight, setLineHeight] = useState<LineHeight>(settings.lineHeight || 'normal');
  const [theme, setTheme] = useState<ReadingTheme>(settings.readingTheme || 'paper');
  const [columnWidth, setColumnWidth] = useState<ColumnWidth>(settings.columnWidth || 'normal');
  const [focusMode, setFocusMode] = useState<boolean>(settings.focusMode || false);

  // Modals state
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(false);
  const [isResultsOpen, setIsResultsOpen] = useState<boolean>(false);
  const [isSessionFinished, setIsSessionFinished] = useState<boolean>(false);
  const [isCustomPassageOpen, setIsCustomPassageOpen] = useState<boolean>(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [historyRecords, setHistoryRecords] = useState<SessionRecord[]>(getStoredHistory());

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mobile view tab: 'passage' | 'questions'
  const [mobileTab, setMobileTab] = useState<'passage' | 'questions'>('passage');

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !isUntimed && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsTimerRunning(false);
            setIsResultsOpen(true);
            return 0;
          }
          return prev - 1;
        });
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    } else if (isTimerRunning && isUntimed) {
      interval = setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isUntimed, secondsLeft]);

  // Handle answers
  const handleSelectTfng = (questionId: number, answer: TFNGAnswer) => {
    setUserTfngAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleChangeBlank = (questionId: number, val: string) => {
    setUserBlankAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  const handleSubmitBlank = (questionId: number) => {
    setSubmittedBlankIds((prev) => new Set([...prev, questionId]));
  };

  // Restart session with current config
  const handleRestart = () => {
    setUserTfngAnswers({});
    setUserBlankAnswers({});
    setSubmittedBlankIds(new Set());
    const secs = config.timerMinutes * 60;
    setSecondsLeft(secs);
    setTimeSpentSeconds(0);
    setIsTimerRunning(false);
    setIsSessionFinished(false);
    setHighlightedParagraphId(null);
  };

  // Apply new configuration
  const handleApplyConfig = (newConfig: SessionConfig) => {
    setConfig(newConfig);
    setUserTfngAnswers({});
    setUserBlankAnswers({});
    setSubmittedBlankIds(new Set());
    const secs = newConfig.timerMinutes * 60;
    setSecondsLeft(secs);
    setTimeSpentSeconds(0);
    setIsTimerRunning(false);
    setIsSessionFinished(false);
    setHighlightedParagraphId(null);

    const chosen = allPassages.find((p) => p.id === newConfig.passageId) || activePassage;
    recordPassageVisit(chosen);
    setHistoryRecords(getStoredHistory());

    saveStoredSettings({
      ...settings,
      defaultTimerMinutes: newConfig.timerMinutes,
      immediateFeedback: newConfig.immediateFeedback,
      fontFamily,
      fontSize,
      lineHeight,
      readingTheme: theme,
      columnWidth,
      focusMode,
    });
  };

  // Timer controls
  const handleToggleTimer = () => {
    setIsTimerRunning((prev) => !prev);
  };

  const handleResetTimer = () => {
    setSecondsLeft(totalSeconds);
    setTimeSpentSeconds(0);
    setIsTimerRunning(false);
  };

  const handleAdjustSeconds = (deltaSeconds: number) => {
    setSecondsLeft((prev) => Math.max(10, prev + deltaSeconds));
  };

  const handleToggleUntimed = () => {
    const nextUntimed = !isUntimed;
    const nextMinutes = nextUntimed ? 0 : 15;
    setConfig((prev) => ({ ...prev, timerMinutes: nextMinutes }));
    setSecondsLeft(nextMinutes * 60);
    setIsTimerRunning(false);
  };

  // Finish session & calculate score
  const handleFinishSession = () => {
    setIsTimerRunning(false);
    setIsSessionFinished(true);
    setIsResultsOpen(true);

    const showTfng = config.questionMode === 'both' || config.questionMode === 'tfng';
    const showBlanks = config.questionMode === 'both' || config.questionMode === 'fill_blank';

    let correct = 0;
    let total = 0;

    if (showTfng) {
      activePassage.tfngQuestions.forEach((q) => {
        total++;
        if (userTfngAnswers[q.id] === q.correctAnswer) correct++;
      });
    }

    if (showBlanks) {
      activePassage.fillBlankQuestions.forEach((q) => {
        total++;
        const val = (userBlankAnswers[q.id] || '').trim().toLowerCase();
        if (q.acceptableAnswers.map((a) => a.toLowerCase()).includes(val)) {
          correct++;
        }
      });
    }

    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    const record: SessionRecord = {
      id: `record-${Date.now()}`,
      passageId: activePassage.id,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      passageTitle: activePassage.title,
      difficulty: activePassage.difficulty,
      questionMode: config.questionMode,
      totalQuestions: total,
      correctCount: correct,
      scorePercentage: percentage,
      timeSpentSeconds,
      status: 'completed',
    };

    saveSessionRecord(record);
    setHistoryRecords(getStoredHistory());
  };

  // Scroll positions memory for seamless tab switching between Passage and Questions
  const scrollPositions = useRef<{ passage: number; questions: number }>({
    passage: 0,
    questions: 0,
  });

  const handleSwitchMobileTab = (tab: 'passage' | 'questions') => {
    if (tab === mobileTab) return;

    // Save current scroll position
    if (mobileTab === 'passage') {
      scrollPositions.current.passage = window.scrollY;
    } else {
      scrollPositions.current.questions = window.scrollY;
    }

    setMobileTab(tab);

    // Restore target tab's scroll position without forcing scroll to top
    const targetY = tab === 'passage' ? scrollPositions.current.passage : scrollPositions.current.questions;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo({ top: targetY, behavior: 'instant' });
      });
    });
  };

  // Jump to paragraph
  const handleJumpToParagraph = (paragraphId: string) => {
    setHighlightedParagraphId(paragraphId);
    if (mobileTab !== 'passage') {
      scrollPositions.current.questions = window.scrollY;
      setMobileTab('passage');
    }
  };

  // When a newly generated passage is created
  const handlePassageGenerated = (newPassage: Passage) => {
    setAllPassages((prev) => [newPassage, ...prev.filter((p) => p.id !== newPassage.id)]);
    recordPassageVisit(newPassage);
    setHistoryRecords(getStoredHistory());
    setConfig((prev) => ({
      ...prev,
      passageId: newPassage.id,
      difficulty: newPassage.difficulty,
    }));
    setUserTfngAnswers({});
    setUserBlankAnswers({});
    setSubmittedBlankIds(new Set());
    const secs = config.timerMinutes * 60;
    setSecondsLeft(secs);
    setTimeSpentSeconds(0);
    setIsTimerRunning(false);
    setHighlightedParagraphId(null);
    setToastMessage(`Generated: "${newPassage.title}" loaded!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add custom passage
  const handleSaveCustomPassage = (newPassage: Passage) => {
    saveCustomPassage(newPassage);
    setAllPassages((prev) => [newPassage, ...prev]);
    handleApplyConfig({
      ...config,
      passageId: newPassage.id,
      difficulty: newPassage.difficulty,
    });
    setToastMessage(`Custom passage "${newPassage.title}" saved!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Clear history
  const handleClearHistory = () => {
    clearStoredHistory();
    setHistoryRecords([]);
  };

  // Delete individual history record
  const handleDeleteRecord = (recordId: string) => {
    deleteSessionRecord(recordId);
    setHistoryRecords(getStoredHistory());
  };

  // Undo previous action / remove latest history record
  const handleUndoLastHistoryAction = () => {
    const current = getStoredHistory();
    if (current.length > 0) {
      const latest = current[0];
      deleteSessionRecord(latest.id);
      setHistoryRecords(getStoredHistory());
      setToastMessage(`Undid entry: "${latest.passageTitle}" removed from history`);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Counts for mobile tabs & bottom bar
  const answeredTfng = Object.keys(userTfngAnswers).length;
  const answeredBlanks = Object.values(userBlankAnswers).filter((v) => v && v.trim().length > 0).length;
  const showTfng = config.questionMode === 'both' || config.questionMode === 'tfng';
  const showBlanks = config.questionMode === 'both' || config.questionMode === 'fill_blank';
  const totalQuestionsCount =
    (showTfng ? activePassage.tfngQuestions.length : 0) +
    (showBlanks ? activePassage.fillBlankQuestions.length : 0);
  const totalAnsweredCount =
    (showTfng ? answeredTfng : 0) + (showBlanks ? answeredBlanks : 0);

  const paragraphIds = activePassage.paragraphs.map((p) => p.id);

  // Background style
  const appBackgroundClass =
    theme === 'night' ? 'bg-[#0F1115] text-[#E4E4E7]' : 'bg-[#FAF8F5] text-stone-900';

  // Navigation handlers
  const handleNavigateHome = () => {
    setIsTimerRunning(false);
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartReading = () => {
    recordPassageVisit(activePassage);
    setHistoryRecords(getStoredHistory());
    setCurrentView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPassage = (passage: Passage) => {
    recordPassageVisit(passage);
    setHistoryRecords(getStoredHistory());
    if (passage.id !== activePassage.id) {
      handleApplyConfig({
        ...config,
        passageId: passage.id,
        difficulty: passage.difficulty,
      });
    }
  };

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 overflow-x-hidden ${appBackgroundClass} selection:bg-amber-200`}
    >
      {/* Top Bar with brand, Home/Reader toggle, and quick triggers */}
      <Header
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onNavigateReader={handleStartReading}
        onOpenConfig={() => setIsConfigOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenCustomPassage={() => setIsCustomPassageOpen(true)}
        onOpenGeneratePassage={() => setIsGenerateModalOpen(true)}
        onRestartSession={handleRestart}
        activePassageTitle={activePassage.title}
        difficulty={activePassage.difficulty}
        hasStarted={timeSpentSeconds > 0}
      />

      {/* Main View Transition with Entrance Animation */}
      <AnimatePresence mode="wait">
        {currentView === 'home' ? (
          <motion.main
            key="homepage-view"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 w-full"
          >
            <HomePage
              passages={allPassages}
              activePassage={activePassage}
              onSelectPassage={handleSelectPassage}
              onStartReading={handleStartReading}
              onOpenConfig={() => setIsConfigOpen(true)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onOpenCustomPassage={() => setIsCustomPassageOpen(true)}
              onOpenGeneratePassage={() => setIsGenerateModalOpen(true)}
              historyRecords={historyRecords}
              currentConfig={config}
              onUpdateConfig={(newCfg) => handleApplyConfig(newCfg)}
            />
          </motion.main>
        ) : (
          <motion.main
            key="reader-view"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 flex flex-col gap-5 sm:gap-6"
          >
            {/* Top Bar: Return to Home */}
            <div className="flex items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleNavigateHome}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Homepage</span>
              </button>
            </div>

            {/* Timer and Countdown Control */}
            <section aria-label="Timer and Session Controls">
              <TimerBar
                secondsLeft={secondsLeft}
                totalSeconds={totalSeconds}
                isRunning={isTimerRunning}
                isUntimed={isUntimed}
                timeSpentSeconds={timeSpentSeconds}
                onTogglePlay={handleToggleTimer}
                onResetTimer={handleResetTimer}
                onAdjustSeconds={handleAdjustSeconds}
                onToggleUntimed={handleToggleUntimed}
              />
            </section>

            {/* Quick Passage Switcher strip */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 max-w-full text-xs">
              <span className="text-stone-400 dark:text-zinc-500 font-semibold uppercase tracking-wider text-[11px] whitespace-nowrap">
                Passage:
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {allPassages.slice(0, 6).map((p) => {
                  const isSelected = p.id === activePassage.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        handleSelectPassage(p);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? theme === 'night'
                            ? 'border-zinc-500 bg-zinc-800 text-white font-semibold shadow-xs'
                            : 'border-stone-900 bg-stone-900 text-white font-semibold shadow-xs'
                          : theme === 'night'
                          ? 'border-zinc-800 hover:border-zinc-700 text-zinc-400 bg-zinc-900/60'
                          : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white/70'
                      }`}
                    >
                      <span className="truncate max-w-[130px] sm:max-w-[200px]">{p.title}</span>
                    </button>
                  );
                })}
                {allPassages.length > 6 && (
                  <button
                    type="button"
                    onClick={() => setIsConfigOpen(true)}
                    className="px-2.5 py-1.5 rounded-lg border border-dashed border-stone-300 dark:border-zinc-700 text-stone-500 hover:text-stone-900 dark:text-zinc-400 text-xs font-semibold cursor-pointer shrink-0"
                  >
                    +{allPassages.length - 6} more
                  </button>
                )}
              </div>
            </div>

            {/* Two-Column Responsive Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
              {/* Left Column: Passage Viewer (7 cols on desktop ~ 58%) */}
              <div
                className={`lg:col-span-7 xl:col-span-7 ${
                  mobileTab === 'passage' ? 'block' : 'hidden lg:block'
                }`}
              >
                <PassageViewer
                  passage={activePassage}
                  highlightedParagraphId={highlightedParagraphId}
                  onClearParagraphHighlight={() => setHighlightedParagraphId(null)}
                  fontFamily={fontFamily}
                  onChangeFontFamily={(font) => {
                    setFontFamily(font);
                    saveStoredSettings({ ...settings, fontFamily: font });
                  }}
                  fontSize={fontSize}
                  onChangeFontSize={(size) => {
                    setFontSize(size);
                    saveStoredSettings({ ...settings, fontSize: size });
                  }}
                  lineHeight={lineHeight}
                  onChangeLineHeight={(lh) => {
                    setLineHeight(lh);
                    saveStoredSettings({ ...settings, lineHeight: lh });
                  }}
                  theme={theme}
                  onChangeTheme={(t) => {
                    setTheme(t);
                    saveStoredSettings({ ...settings, readingTheme: t });
                  }}
                  columnWidth={columnWidth}
                  onChangeColumnWidth={(w) => {
                    setColumnWidth(w);
                    saveStoredSettings({ ...settings, columnWidth: w });
                  }}
                  focusMode={focusMode}
                  onToggleFocusMode={() => {
                    setFocusMode((prev) => {
                      const next = !prev;
                      saveStoredSettings({ ...settings, focusMode: next });
                      return next;
                    });
                  }}
                />
              </div>

              {/* Right Column: Questions Panel (5 cols on desktop ~ 42%) */}
              <div
                className={`lg:col-span-5 xl:col-span-5 sticky top-20 ${
                  mobileTab === 'questions' ? 'block' : 'hidden lg:block'
                }`}
              >
                <QuestionPanel
                  tfngQuestions={activePassage.tfngQuestions}
                  fillBlankQuestions={activePassage.fillBlankQuestions}
                  questionMode={config.questionMode}
                  immediateFeedback={config.immediateFeedback}
                  userTfngAnswers={userTfngAnswers}
                  userBlankAnswers={userBlankAnswers}
                  onSelectTfngAnswer={handleSelectTfng}
                  onChangeBlankAnswer={handleChangeBlank}
                  onSubmitBlankAnswer={handleSubmitBlank}
                  submittedBlankIds={submittedBlankIds}
                  onJumpToParagraph={handleJumpToParagraph}
                  onFinishSession={handleFinishSession}
                  blanksInstruction={activePassage.blanksInstruction}
                  onChangeQuestionMode={(mode) =>
                    setConfig((prev) => ({ ...prev, questionMode: mode }))
                  }
                  onToggleImmediateFeedback={() =>
                    setConfig((prev) => ({
                      ...prev,
                      immediateFeedback: !prev.immediateFeedback,
                    }))
                  }
                  isSessionFinished={isSessionFinished}
                />
              </div>
            </div>

            {/* Bottom Mover Bar for mobile: Always visible, moves with user even at lowest question */}
            <div className="lg:hidden">
              <BottomMoverBar
                activeTab={mobileTab}
                onSwitchTab={handleSwitchMobileTab}
                onScrollToTop={handleScrollToTop}
                totalAnswered={totalAnsweredCount}
                totalQuestions={totalQuestionsCount}
                paragraphIds={paragraphIds}
                onJumpToParagraph={handleJumpToParagraph}
                isUntimed={isUntimed}
              />
            </div>
          </motion.main>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="w-full border-t border-stone-200/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 py-4 mt-8 pb-16 lg:pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between text-xs text-stone-500 dark:text-zinc-400 gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-800 dark:text-zinc-200">ReadFlow</span>
            <span aria-hidden="true">•</span>
            <span>Academic Reading & Speed Comprehension</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={handleNavigateHome}
              className="hover:text-stone-900 dark:hover:text-zinc-100 underline transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => setIsConfigOpen(true)}
              className="hover:text-stone-900 dark:hover:text-zinc-100 underline transition-colors cursor-pointer"
            >
              Passages
            </button>
            <button
              type="button"
              onClick={() => setIsCustomPassageOpen(true)}
              className="hover:text-stone-900 dark:hover:text-zinc-100 underline transition-colors cursor-pointer"
            >
              Add Text
            </button>
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="hover:text-stone-900 dark:hover:text-zinc-100 underline transition-colors cursor-pointer"
            >
              History
            </button>
          </div>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 bg-stone-900 text-white text-xs font-medium px-4 py-2.5 rounded-xl shadow-xl border border-stone-800 flex items-center gap-2"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals & Drawers */}
      <SessionConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        passages={allPassages}
        currentConfig={config}
        onApplyConfig={handleApplyConfig}
        onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
      />

      <GeneratePassageModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onPassageGenerated={handlePassageGenerated}
      />

      <ResultsModal
        isOpen={isResultsOpen}
        onClose={() => setIsResultsOpen(false)}
        passage={activePassage}
        questionMode={config.questionMode}
        userTfngAnswers={userTfngAnswers}
        userBlankAnswers={userBlankAnswers}
        timeSpentSeconds={timeSpentSeconds}
        onRestart={handleRestart}
        onReconfigure={() => setIsConfigOpen(true)}
        onJumpToParagraph={handleJumpToParagraph}
        onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
      />

      <CustomPassageModal
        isOpen={isCustomPassageOpen}
        onClose={() => setIsCustomPassageOpen(false)}
        onSavePassage={handleSaveCustomPassage}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        records={historyRecords}
        onClearHistory={handleClearHistory}
        onDeleteRecord={handleDeleteRecord}
        onUndoLastAction={handleUndoLastHistoryAction}
        onSelectPassage={(passageTitle, passageId) => {
          const found = allPassages.find(
            (p) =>
              (passageId && p.id === passageId) ||
              p.title.toLowerCase().trim() === passageTitle.toLowerCase().trim()
          );
          if (found) {
            handleSelectPassage(found);
            setCurrentView('reader');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
          setIsHistoryOpen(false);
        }}
      />
    </div>
  );
}
