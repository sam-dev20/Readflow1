import React, { useState } from 'react';
import { Passage, Difficulty, SessionConfig, SessionRecord } from '../types/reading';
import {
  BookOpen,
  Clock,
  CheckSquare,
  ArrowRight,
  PlusCircle,
  History,
  Sliders,
  ChevronRight,
  Compass,
  Layers,
} from 'lucide-react';
import { motion, type Variants } from 'motion/react';

interface HomePageProps {
  passages: Passage[];
  activePassage: Passage;
  onSelectPassage: (passage: Passage) => void;
  onStartReading: () => void;
  onOpenConfig: () => void;
  onOpenHistory: () => void;
  onOpenCustomPassage: () => void;
  onOpenGeneratePassage: () => void;
  historyRecords: SessionRecord[];
  currentConfig: SessionConfig;
  onUpdateConfig: (config: SessionConfig) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  passages,
  activePassage,
  onSelectPassage,
  onStartReading,
  onOpenConfig,
  onOpenHistory,
  onOpenCustomPassage,
  onOpenGeneratePassage,
  historyRecords,
  currentConfig,
  onUpdateConfig,
}) => {
  const [filterDifficulty, setFilterDifficulty] = useState<'all' | Difficulty>('all');

  const filteredPassages = passages.filter((p) => {
    if (filterDifficulty === 'all') return true;
    return p.difficulty === filterDifficulty;
  });

  // Calculate quick stats (only for completed tests, not viewed ones)
  const completedRecords = historyRecords.filter(
    (r) => r.status === 'completed' || (r.scorePercentage !== undefined && r.scorePercentage > 0)
  );
  const totalCompleted = completedRecords.length;
  const avgScore =
    totalCompleted > 0
      ? Math.round(
          completedRecords.reduce((acc, r) => acc + r.scorePercentage, 0) / totalCompleted
        )
      : null;

  // Stagger animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8"
    >
      {/* Hero Welcome Banner */}
      <motion.section
        variants={itemVariants}
        className="rounded-3xl bg-white border border-stone-200/90 p-5 sm:p-8 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              <span>Academic Comprehension Practice</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-stone-900 tracking-tight leading-tight">
              Master Academic Reading & Speed Comprehension
            </h1>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans">
              Train with authentic IELTS-standard passages, True/False/Not Given statements, and fill-in-the-blank questions designed for academic rigor.
            </p>
          </div>

          {/* Quick Stats Pill or Badge */}
          {totalCompleted > 0 && (
            <div className="w-full sm:w-auto p-4 rounded-2xl bg-stone-50 border border-stone-200 flex sm:flex-col items-center justify-around gap-2 text-center shrink-0">
              <div>
                <div className="text-xl sm:text-2xl font-bold font-serif text-stone-900">
                  {totalCompleted}
                </div>
                <div className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
                  Sessions Done
                </div>
              </div>
              {avgScore !== null && (
                <>
                  <div className="h-6 w-px sm:w-8 sm:h-px bg-stone-200" />
                  <div>
                    <div className="text-xl sm:text-2xl font-bold font-serif text-emerald-700">
                      {avgScore}%
                    </div>
                    <div className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">
                      Avg Accuracy
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Quick Hub Buttons */}
        <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenGeneratePassage}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Layers className="w-3.5 h-3.5 text-stone-600" />
            <span>Generate Passage</span>
          </button>
          <button
            type="button"
            onClick={onOpenCustomPassage}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Custom Text</span>
          </button>
          <button
            type="button"
            onClick={onOpenHistory}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Session History</span>
          </button>
        </div>
      </motion.section>

      {/* Featured Active Passage Showcase */}
      <motion.section
        variants={itemVariants}
        className="rounded-3xl bg-stone-900 text-stone-50 p-6 sm:p-8 shadow-md relative overflow-hidden"
      >
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-400 font-semibold">
              <span>Selected Passage</span>
              <span aria-hidden="true">•</span>
              <span className="capitalize text-amber-300">{activePassage.difficulty}</span>
              <span aria-hidden="true">•</span>
              <span>{activePassage.category}</span>
            </div>
            <button
              type="button"
              onClick={onOpenConfig}
              className="text-xs font-semibold text-stone-300 hover:text-white underline cursor-pointer flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>Configure Timer & Mode</span>
            </button>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-snug">
              {activePassage.title}
            </h2>
            {activePassage.subtitle && (
              <p className="text-xs sm:text-sm text-stone-300 mt-1 italic font-serif">
                {activePassage.subtitle}
              </p>
            )}
          </div>

          {/* Quick Passage Metrics */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-300 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              {currentConfig.timerMinutes === 0
                ? 'Untimed'
                : `${currentConfig.timerMinutes} min timer`}
            </span>
            <span aria-hidden="true" className="text-stone-600">•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-stone-400" />
              {activePassage.paragraphs.length} Paragraphs ({activePassage.wordCount} words)
            </span>
            <span aria-hidden="true" className="text-stone-600">•</span>
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-stone-400" />
              {activePassage.tfngQuestions.length + activePassage.fillBlankQuestions.length} Questions
            </span>
          </div>

          {/* Mode Selection Pills */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onUpdateConfig({
                  ...currentConfig,
                  timerMinutes: 15,
                  immediateFeedback: false,
                });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                currentConfig.timerMinutes === 15 && !currentConfig.immediateFeedback
                  ? 'bg-white text-stone-900 border-white shadow-xs'
                  : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:text-white hover:bg-stone-800'
              }`}
            >
              Timed Exam (15m)
            </button>
            <button
              type="button"
              onClick={() => {
                onUpdateConfig({
                  ...currentConfig,
                  timerMinutes: 0,
                  immediateFeedback: true,
                });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                currentConfig.timerMinutes === 0 && currentConfig.immediateFeedback
                  ? 'bg-white text-stone-900 border-white shadow-xs'
                  : 'bg-stone-800/80 text-stone-300 border-stone-700 hover:text-white hover:bg-stone-800'
              }`}
            >
              Untimed + Instant Feedback
            </button>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={onStartReading}
              className="px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98] cursor-pointer"
            >
              <span>Start Reading Passage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onOpenConfig}
              className="px-4 py-3 rounded-2xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Change Settings</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* Passage Catalog Library */}
      <motion.section variants={itemVariants} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900">
              Passage Library
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Select any academic text to practice comprehension skills
            </p>
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl self-start sm:self-auto">
            {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                type="button"
                onClick={() => setFilterDifficulty(diff)}
                className={`px-3 py-1 text-xs font-semibold capitalize rounded-lg transition-colors cursor-pointer ${
                  filterDifficulty === diff
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Passages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPassages.map((p) => {
            const isSelected = p.id === activePassage.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  onSelectPassage(p);
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                  isSelected
                    ? 'bg-white border-stone-900 ring-2 ring-stone-900/10 shadow-sm'
                    : 'bg-white hover:bg-stone-50/70 border-stone-200/90 hover:border-stone-300 shadow-xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                      <span className="capitalize">{p.difficulty}</span>
                      <span aria-hidden="true">•</span>
                      <span>{p.category}</span>
                    </div>
                    {p.isGenerated && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                        Generated
                      </span>
                    )}
                    {p.id === 'brain-tricks-perception' && (
                      <span className="text-[10px] font-bold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                        Core Text
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif font-bold text-base text-stone-900 leading-snug line-clamp-2">
                    {p.title}
                  </h4>
                  {p.subtitle && (
                    <p className="text-xs text-stone-500 font-serif italic line-clamp-1">
                      {p.subtitle}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-2">
                    <span>{p.paragraphs.length} paras</span>
                    <span aria-hidden="true">•</span>
                    <span>{p.tfngQuestions.length + p.fillBlankQuestions.length} Qs</span>
                    <span aria-hidden="true">•</span>
                    <span>{p.estimatedReadTime}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPassage(p);
                      onStartReading();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-stone-900 text-white hover:bg-stone-800'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>Read</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      {/* Study Strategies & Advice Card */}
      <motion.section
        variants={itemVariants}
        className="rounded-2xl border border-stone-200 bg-stone-50/60 p-5 space-y-2 text-stone-700"
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
          <Compass className="w-4 h-4 text-stone-600" />
          <span>Academic Reading Strategy</span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-stone-600">
          For <strong>True / False / Not Given</strong> questions, never infer beyond the passage text. If a statement directly matches the author's stated facts, choose <strong>TRUE</strong>. If it contradicts, choose <strong>FALSE</strong>. If the text does not mention the exact claim, choose <strong>NOT GIVEN</strong>.
        </p>
      </motion.section>
    </motion.div>
  );
};
