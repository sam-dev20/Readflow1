import React, { useState, useEffect } from 'react';
import { Passage, TFNGAnswer, QuestionMode } from '../types/reading';
import {
  isFillBlankCorrect,
  getTfngWhyWrongExplanation,
  getFillBlankWhyWrongExplanation,
} from '../utils/evaluation';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Clock,
  Award,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Compass,
  BookOpen,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  passage: Passage;
  questionMode: QuestionMode;
  userTfngAnswers: { [questionId: number]: TFNGAnswer };
  userBlankAnswers: { [questionId: number]: string };
  timeSpentSeconds: number;
  onRestart: () => void;
  onReconfigure: () => void;
  onJumpToParagraph: (paragraphId: string) => void;
  onOpenGenerateModal?: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  onClose,
  passage,
  questionMode,
  userTfngAnswers,
  userBlankAnswers,
  timeSpentSeconds,
  onRestart,
  onReconfigure,
  onJumpToParagraph,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'incorrect' | 'correct'>('all');

  const showTfng = questionMode === 'both' || questionMode === 'tfng';
  const showBlanks = questionMode === 'both' || questionMode === 'fill_blank';

  // Evaluate TFNG questions with explicit why-wrong rationale
  const evaluatedTfng = passage.tfngQuestions.map((q) => {
    const userAns = userTfngAnswers[q.id];
    const isAnswered = userAns !== undefined;
    const isCorrect = isAnswered && userAns === q.correctAnswer;
    const whyExplanation = getTfngWhyWrongExplanation(
      userAns,
      q.correctAnswer,
      q.paragraphRef,
      q.explanation,
      q.sourceQuote
    );

    return {
      type: 'tfng' as const,
      id: q.id,
      prompt: q.statement,
      userAns: userAns || 'Unanswered',
      correctAns: q.correctAnswer,
      isCorrect,
      isAnswered,
      paragraphRef: q.paragraphRef,
      explanation: q.explanation,
      whyExplanation,
      sourceQuote: q.sourceQuote,
    };
  });

  // Evaluate Blank questions with explicit why-wrong rationale
  const evaluatedBlanks = passage.fillBlankQuestions.map((q) => {
    const rawVal = userBlankAnswers[q.id] || '';
    const isAnswered = rawVal.trim().length > 0;
    const isCorrect = isFillBlankCorrect(rawVal, q.acceptableAnswers);
    const whyExplanation = getFillBlankWhyWrongExplanation(
      rawVal,
      q.displayAnswer,
      q.paragraphRef,
      q.explanation,
      q.sourceQuote
    );

    return {
      type: 'blank' as const,
      id: q.id,
      prompt: `${q.prefix} [ ... ] ${q.suffix}`,
      prefix: q.prefix,
      suffix: q.suffix,
      userAns: rawVal.trim() || 'Unanswered',
      correctAns: q.displayAnswer,
      isCorrect,
      isAnswered,
      paragraphRef: q.paragraphRef,
      explanation: q.explanation,
      whyExplanation,
      sourceQuote: q.sourceQuote,
    };
  });

  const activeQuestions = [
    ...(showTfng ? evaluatedTfng : []),
    ...(showBlanks ? evaluatedBlanks : []),
  ];

  const totalQuestions = activeQuestions.length;
  const correctCount = activeQuestions.filter((q) => q.isCorrect).length;
  const incorrectCount = totalQuestions - correctCount;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Filtered review list
  const filteredQuestions = activeQuestions.filter((q) => {
    if (filterType === 'incorrect') return !q.isCorrect;
    if (filterType === 'correct') return q.isCorrect;
    return true;
  });

  useEffect(() => {
    if (isOpen && percentage >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0F766E', '#F59E0B', '#10B981', '#6366F1'],
        });
      } catch {
        // no-op
      }
    }
  }, [isOpen, percentage]);

  if (!isOpen) return null;

  const minutesSpent = Math.floor(timeSpentSeconds / 60);
  const secondsSpent = timeSpentSeconds % 60;
  const formattedTimeSpent = `${minutesSpent}m ${secondsSpent}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-stone-950/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90dvh]"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-stone-50/80 dark:bg-zinc-800/60 shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-stone-800 dark:text-zinc-200" />
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-zinc-100">
                Session Performance & Answer Review
              </h2>
              <p className="text-xs text-stone-500 dark:text-zinc-400">
                Detailed breakdown explaining why your answers were correct or incorrect
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg hover:bg-stone-200/50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Hero Score Box */}
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/60 dark:bg-zinc-800/40 p-4 sm:p-6 text-center">
            <div className="text-[11px] sm:text-xs uppercase tracking-wider text-stone-500 dark:text-zinc-400 font-semibold mb-1 truncate">
              {passage.title}
            </div>
            <div className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 dark:text-zinc-100">
              {correctCount} / {totalQuestions}
            </div>
            <div className="text-sm sm:text-base font-semibold text-stone-700 dark:text-zinc-300 mt-1">
              {percentage}% Accuracy
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-3 pt-3 border-t border-stone-200/80 dark:border-zinc-700/80 text-xs text-stone-600 dark:text-zinc-400">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-500" />
                <span>
                  Time: <strong>{formattedTimeSpent}</strong>
                </span>
              </div>
              <span aria-hidden="true">•</span>
              <div>
                <span>
                  Difficulty: <strong className="capitalize">{passage.difficulty}</strong>
                </span>
              </div>
              <span aria-hidden="true">•</span>
              <div className="text-emerald-700 dark:text-emerald-400 font-semibold">
                {correctCount} Correct
              </div>
              {incorrectCount > 0 && (
                <>
                  <span aria-hidden="true">•</span>
                  <div className="text-rose-600 dark:text-rose-400 font-semibold">
                    {incorrectCount} Incorrect
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Answer Review Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-zinc-100">
                  Detailed Answer Review
                </h3>
                <p className="text-xs text-stone-500 dark:text-zinc-400">
                  Read why each answer is correct or incorrect based on passage evidence
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl text-xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                      : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
                  }`}
                >
                  All ({totalQuestions})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('incorrect')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    filterType === 'incorrect'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  }`}
                >
                  Incorrect ({incorrectCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('correct')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    filterType === 'correct'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                  }`}
                >
                  Correct ({correctCount})
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-3.5">
              {filteredQuestions.length === 0 ? (
                <div className="p-6 text-center rounded-xl border border-stone-200 dark:border-zinc-800 text-stone-500 text-xs">
                  {filterType === 'incorrect'
                    ? 'Perfect! You got every question correct!'
                    : 'No questions match the selected filter.'}
                </div>
              ) : (
                filteredQuestions.map((q) => (
                  <div
                    key={`${q.type}-${q.id}`}
                    className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                      q.isCorrect
                        ? 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/15'
                        : 'border-rose-200 dark:border-rose-800/60 bg-rose-50/30 dark:bg-rose-950/15'
                    }`}
                  >
                    {/* Prompt Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {q.id}
                        </span>
                        <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mt-0.5">
                          {q.type === 'tfng' ? 'T/F/NG Statement' : 'Fill in Blank'}
                        </div>
                      </div>

                      {/* Status Tag */}
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                          q.isCorrect
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {q.isCorrect ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Correct</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Incorrect</span>
                          </>
                        )}
                      </span>
                    </div>

                    {/* Question Text */}
                    <p className="text-sm font-medium text-stone-900 dark:text-zinc-100 leading-snug">
                      {q.prompt}
                    </p>

                    {/* Answers Comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700">
                        <span className="text-stone-500 dark:text-zinc-400 block text-[11px]">
                          Your Answer:
                        </span>
                        <span
                          className={`font-semibold text-sm ${
                            q.isCorrect
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {q.userAns}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-white dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700">
                        <span className="text-stone-500 dark:text-zinc-400 block text-[11px]">
                          Correct Answer:
                        </span>
                        <span className="font-semibold text-sm text-stone-900 dark:text-zinc-100">
                          {q.correctAns}
                        </span>
                      </div>
                    </div>

                    {/* Explanation Box - Explaining Why You Are Wrong / Why Correct */}
                    <div
                      className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                        q.isCorrect
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200'
                          : 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40 text-rose-950 dark:text-rose-200'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-bold flex items-center gap-1.5 text-xs">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {q.isCorrect ? 'Verification & Rationale:' : 'Why your answer is incorrect:'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onJumpToParagraph(q.paragraphRef);
                          }}
                          className="inline-flex items-center gap-1 font-bold text-stone-700 dark:text-zinc-300 hover:underline cursor-pointer shrink-0 text-xs"
                          title="View evidence in reading passage"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>Paragraph {q.paragraphRef}</span>
                        </button>
                      </div>

                      <p className="text-xs leading-relaxed text-stone-800 dark:text-zinc-200 font-sans">
                        {q.whyExplanation}
                      </p>

                      {q.sourceQuote && (
                        <blockquote className="italic border-l-2 border-stone-400 dark:border-zinc-600 pl-2 text-stone-600 dark:text-zinc-400 text-[11px]">
                          "{q.sourceQuote}"
                        </blockquote>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-4 sm:px-6 py-3 border-t border-stone-200 dark:border-zinc-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-stone-50/80 dark:bg-zinc-800/60 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onRestart();
              }}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-zinc-300 hover:text-stone-900 border border-stone-200 dark:border-zinc-700 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Passage</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onReconfigure();
              }}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-zinc-300 hover:text-stone-900 border border-stone-200 dark:border-zinc-700 rounded-lg hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Change Passage</span>
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-zinc-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-xl shadow-xs transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Review in Workspace</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
