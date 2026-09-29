import React from 'react';
import { TFNGQuestion, FillBlankQuestion, TFNGAnswer, QuestionMode } from '../types/reading';
import {
  isFillBlankCorrect,
  getTfngWhyWrongExplanation,
  getFillBlankWhyWrongExplanation,
} from '../utils/evaluation';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  CornerDownLeft,
  Eye,
  EyeOff,
  Compass,
  Award,
  AlertCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuestionPanelProps {
  tfngQuestions: TFNGQuestion[];
  fillBlankQuestions: FillBlankQuestion[];
  questionMode: QuestionMode;
  immediateFeedback: boolean;
  userTfngAnswers: { [questionId: number]: TFNGAnswer };
  userBlankAnswers: { [questionId: number]: string };
  onSelectTfngAnswer: (questionId: number, answer: TFNGAnswer) => void;
  onChangeBlankAnswer: (questionId: number, val: string) => void;
  onSubmitBlankAnswer: (questionId: number) => void;
  submittedBlankIds: Set<number>;
  onJumpToParagraph: (paragraphId: string) => void;
  onFinishSession: () => void;
  blanksInstruction?: string;
  onChangeQuestionMode: (mode: QuestionMode) => void;
  onToggleImmediateFeedback: () => void;
  isSessionFinished?: boolean;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  tfngQuestions,
  fillBlankQuestions,
  questionMode,
  immediateFeedback,
  userTfngAnswers,
  userBlankAnswers,
  onSelectTfngAnswer,
  onChangeBlankAnswer,
  onSubmitBlankAnswer,
  submittedBlankIds,
  onJumpToParagraph,
  onFinishSession,
  blanksInstruction,
  onChangeQuestionMode,
  onToggleImmediateFeedback,
  isSessionFinished = false,
}) => {
  const showTfng = questionMode === 'both' || questionMode === 'tfng';
  const showBlanks = questionMode === 'both' || questionMode === 'fill_blank';

  const answeredTfngCount = Object.keys(userTfngAnswers).length;
  const answeredBlanksCount = Object.values(userBlankAnswers).filter(
    (v) => v && v.trim().length > 0
  ).length;

  const totalQuestions =
    (showTfng ? tfngQuestions.length : 0) + (showBlanks ? fillBlankQuestions.length : 0);
  const totalAnswered = (showTfng ? answeredTfngCount : 0) + (showBlanks ? answeredBlanksCount : 0);

  return (
    <aside className="bg-white dark:bg-zinc-900 rounded-2xl border border-stone-200/90 dark:border-zinc-800 p-4 sm:p-6 shadow-xs flex flex-col h-full transition-colors pb-24 lg:pb-6">
      {/* Session Finished Review Banner */}
      {isSessionFinished && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <Award className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5 flex-1">
            <span className="font-bold block text-xs">
              Session Finished — Answer Review Mode
            </span>
            <span className="text-[11px] text-amber-800/90 dark:text-amber-300/90 block leading-relaxed">
              Reviewing your answers alongside the text. Explanations below highlight why answers are right or wrong with passage evidence.
            </span>
          </div>
        </div>
      )}

      {/* Header section with Mode selector & immediate feedback toggle */}
      <div className="pb-4 border-b border-stone-200 dark:border-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight">
              {isSessionFinished ? 'Answer Review' : 'Questions'}
            </h2>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              <span>
                {totalAnswered} of {totalQuestions} answered
              </span>
              <span aria-hidden="true">•</span>
              <span>
                {isSessionFinished
                  ? 'Reviewing Completed Session'
                  : immediateFeedback
                  ? 'Instant Feedback'
                  : 'Exam Submission Mode'}
              </span>
            </div>
          </div>

          {/* Immediate Feedback Toggle (hidden in review mode) */}
          {!isSessionFinished && (
            <button
              type="button"
              onClick={onToggleImmediateFeedback}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors cursor-pointer ${
                immediateFeedback
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                  : 'bg-stone-50 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-stone-300 dark:border-zinc-700 hover:text-stone-900'
              }`}
              title="Toggle whether answers are verified instantly or kept until submission"
            >
              {immediateFeedback ? (
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              <span className="hidden xs:inline">
                {immediateFeedback ? 'Instant Check' : 'Exam Mode'}
              </span>
            </button>
          )}
        </div>

        {/* Question Type Filter Bar */}
        <div className="mt-3 flex items-center gap-1 p-1 bg-stone-100 dark:bg-zinc-800 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => onChangeQuestionMode('both')}
            className={`flex-1 py-1.5 px-1 font-semibold rounded-lg transition-colors cursor-pointer text-center truncate ${
              questionMode === 'both'
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
            }`}
          >
            All ({tfngQuestions.length + fillBlankQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => onChangeQuestionMode('tfng')}
            className={`flex-1 py-1.5 px-1 font-semibold rounded-lg transition-colors cursor-pointer text-center truncate ${
              questionMode === 'tfng'
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
            }`}
          >
            T/F/NG ({tfngQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => onChangeQuestionMode('fill_blank')}
            className={`flex-1 py-1.5 px-1 font-semibold rounded-lg transition-colors cursor-pointer text-center truncate ${
              questionMode === 'fill_blank'
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
            }`}
          >
            Blanks ({fillBlankQuestions.length})
          </button>
        </div>
      </div>

      {/* Questions Scrollable Area */}
      <div className="flex-1 overflow-y-auto py-5 space-y-6 pr-0.5">
        {/* TRUE / FALSE / NOT GIVEN SECTION */}
        {showTfng && (
          <section className="space-y-4">
            <div className="border-b border-stone-100 dark:border-zinc-800 pb-2.5">
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-zinc-100">
                True / False / Not Given
              </h3>
              <p className="text-xs text-stone-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                Choose <strong>TRUE</strong> if statement agrees, <strong>FALSE</strong> if it contradicts, or <strong>NOT GIVEN</strong> if unmentioned.
              </p>
            </div>

            <div className="space-y-4">
              {tfngQuestions.map((q) => {
                const selected = userTfngAnswers[q.id];
                const isAnswered = selected !== undefined;
                const isCorrect = isAnswered && selected === q.correctAnswer;
                const showExplanation = (immediateFeedback && isAnswered) || isSessionFinished;
                const whyWrongText = getTfngWhyWrongExplanation(
                  selected,
                  q.correctAnswer,
                  q.paragraphRef,
                  q.explanation,
                  q.sourceQuote
                );

                return (
                  <div
                    key={q.id}
                    id={`question-tfng-${q.id}`}
                    className={`rounded-xl border p-3.5 sm:p-4 transition-all duration-200 ${
                      showExplanation
                        ? isCorrect
                          ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800'
                          : 'border-rose-200 bg-rose-50/30 dark:bg-rose-950/20 dark:border-rose-800'
                        : isAnswered
                        ? 'border-stone-300 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/40'
                        : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-stone-300'
                    }`}
                  >
                    {/* Question prompt header */}
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {q.id}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-stone-900 dark:text-zinc-100 leading-snug">
                          {q.statement}
                        </p>
                      </div>
                    </div>

                    {/* Options (TRUE, FALSE, NOT GIVEN) */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-3 pt-1">
                      {(['TRUE', 'FALSE', 'NOT GIVEN'] as TFNGAnswer[]).map((option) => {
                        const isChosen = selected === option;
                        let btnStyle =
                          'border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-700 dark:text-zinc-200 hover:border-stone-400 hover:bg-stone-50';
                        if (showExplanation) {
                          if (option === q.correctAnswer) {
                            btnStyle =
                              'border-emerald-600 bg-emerald-600 text-white font-bold shadow-xs';
                          } else if (isChosen && !isCorrect) {
                            btnStyle =
                              'border-rose-500 bg-rose-500 text-white font-bold shadow-xs';
                          } else {
                            btnStyle =
                              'border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/40 text-stone-400 dark:text-zinc-500 opacity-60';
                          }
                        } else if (isChosen) {
                          btnStyle =
                            'border-stone-900 dark:border-white bg-stone-900 dark:bg-zinc-100 text-white dark:text-stone-900 font-bold shadow-xs';
                        }

                        return (
                          <button
                            key={option}
                            type="button"
                            disabled={isSessionFinished}
                            onClick={() => onSelectTfngAnswer(q.id, option)}
                            className={`py-2 px-1 sm:px-2 text-[11px] sm:text-xs rounded-lg border font-semibold transition-all cursor-pointer text-center leading-tight break-words flex items-center justify-center min-h-[36px] ${btnStyle}`}
                          >
                            <span>{option}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Feedback explanation card */}
                    <AnimatePresence>
                      {showExplanation && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`mt-3 pt-2.5 border-t text-xs space-y-1.5 ${
                            isCorrect
                              ? 'border-emerald-200/80 text-emerald-900 dark:text-emerald-300'
                              : 'border-rose-200/80 text-rose-950 dark:text-rose-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold flex items-center gap-1.5 truncate">
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="truncate">Correct: {q.correctAnswer}</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                  <span className="truncate">
                                    {isAnswered
                                      ? `Incorrect (Chose ${selected} • Correct: ${q.correctAnswer})`
                                      : `Unanswered • Correct: ${q.correctAnswer}`}
                                  </span>
                                </>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={() => onJumpToParagraph(q.paragraphRef)}
                              className="inline-flex items-center gap-1 font-semibold text-stone-700 dark:text-zinc-300 hover:underline cursor-pointer shrink-0"
                              title="Scroll to paragraph in passage"
                            >
                              <Compass className="w-3.5 h-3.5" />
                              <span>Para {q.paragraphRef}</span>
                            </button>
                          </div>
                          <div className="flex items-start gap-1.5 pt-0.5">
                            {!isCorrect && (
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <p className="text-xs leading-relaxed text-stone-700 dark:text-zinc-300">
                              {whyWrongText}
                            </p>
                          </div>
                          {q.sourceQuote && (
                            <blockquote className="italic border-l-2 border-stone-300 dark:border-zinc-700 pl-2 text-stone-600 dark:text-zinc-400 text-[11px]">
                              "{q.sourceQuote}"
                            </blockquote>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* FILL IN THE BLANKS SECTION */}
        {showBlanks && (
          <section className="space-y-4 pt-2">
            <div className="border-b border-stone-100 dark:border-zinc-800 pb-2.5">
              <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900 dark:text-zinc-100">
                Fill in the Blanks
              </h3>
              <p className="text-xs text-stone-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                {blanksInstruction ||
                  'Complete sentences below using words directly from the text.'}
              </p>
            </div>

            <div className="space-y-4">
              {fillBlankQuestions.map((q) => {
                const userVal = userBlankAnswers[q.id] || '';
                const isSubmitted =
                  submittedBlankIds.has(q.id) ||
                  (immediateFeedback && userVal.trim().length > 0) ||
                  isSessionFinished;
                const isCorrect = isFillBlankCorrect(userVal, q.acceptableAnswers);
                const showFeedback =
                  (immediateFeedback && isSubmitted && userVal.trim().length > 0) ||
                  isSessionFinished;
                const whyWrongText = getFillBlankWhyWrongExplanation(
                  userVal,
                  q.displayAnswer,
                  q.paragraphRef,
                  q.explanation,
                  q.sourceQuote
                );

                return (
                  <div
                    key={q.id}
                    id={`question-blank-${q.id}`}
                    className={`rounded-xl border p-3.5 sm:p-4 transition-all duration-200 ${
                      showFeedback
                        ? isCorrect
                          ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-950/20 dark:border-emerald-800'
                          : 'border-rose-200 bg-rose-50/30 dark:bg-rose-950/20 dark:border-rose-800'
                        : isSubmitted
                        ? 'border-stone-300 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/40'
                        : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-md bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {q.id}
                      </span>
                      <div className="flex-1 space-y-2.5 min-w-0">
                        {/* Sentence with Blank Box */}
                        <div className="text-sm leading-relaxed text-stone-900 dark:text-zinc-100 break-words">
                          <span>{q.prefix} </span>
                          <span className="inline-block align-middle my-0.5 mx-1">
                            <input
                              type="text"
                              value={userVal}
                              onChange={(e) => onChangeBlankAnswer(q.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  onSubmitBlankAnswer(q.id);
                                }
                              }}
                              disabled={isSessionFinished}
                              className={`px-2.5 py-1 font-mono text-xs sm:text-sm border rounded-md outline-none transition-colors w-32 sm:w-44 max-w-[200px] text-center ${
                                showFeedback
                                  ? isCorrect
                                    ? 'border-emerald-600 bg-white dark:bg-zinc-800 font-semibold text-emerald-800 dark:text-emerald-300'
                                    : 'border-rose-500 bg-white dark:bg-zinc-800 text-rose-800 dark:text-rose-300'
                                  : 'border-stone-300 dark:border-zinc-700 focus:border-stone-900 dark:focus:border-zinc-300 bg-stone-50/80 dark:bg-zinc-800'
                              }`}
                            />
                          </span>
                          <span> {q.suffix}</span>
                        </div>

                        {/* Check button when immediate feedback is on */}
                        {immediateFeedback &&
                          !isSubmitted &&
                          userVal.trim().length > 0 &&
                          !isSessionFinished && (
                            <button
                              type="button"
                              onClick={() => onSubmitBlankAnswer(q.id)}
                              className="px-2.5 py-1 bg-stone-900 dark:bg-zinc-100 text-white dark:text-stone-900 text-xs font-semibold rounded-md transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <CornerDownLeft className="w-3 h-3" />
                              <span>Check</span>
                            </button>
                          )}

                        {/* Feedback Card */}
                        <AnimatePresence>
                          {showFeedback && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className={`pt-2.5 border-t text-xs space-y-1.5 ${
                                isCorrect
                                  ? 'border-emerald-200/80 text-emerald-900 dark:text-emerald-300'
                                  : 'border-rose-200/80 text-rose-950 dark:text-rose-300'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-bold flex items-center gap-1.5 truncate">
                                  {isCorrect ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span className="truncate">
                                        Correct: {q.displayAnswer}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                      <span className="truncate">
                                        {userVal.trim().length > 0
                                          ? `Incorrect • Expected: ${q.displayAnswer}`
                                          : `Unanswered • Expected: ${q.displayAnswer}`}
                                      </span>
                                    </>
                                  )}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onJumpToParagraph(q.paragraphRef)}
                                  className="inline-flex items-center gap-1 font-semibold text-stone-700 dark:text-zinc-300 hover:underline cursor-pointer shrink-0"
                                  title="Scroll to paragraph in passage"
                                >
                                  <Compass className="w-3.5 h-3.5" />
                                  <span>Para {q.paragraphRef}</span>
                                </button>
                              </div>
                              <div className="flex items-start gap-1.5 pt-0.5">
                                {!isCorrect && (
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                                )}
                                <p className="text-xs leading-relaxed text-stone-700 dark:text-zinc-300">
                                  {whyWrongText}
                                </p>
                              </div>
                              {q.sourceQuote && (
                                <blockquote className="italic border-l-2 border-stone-300 dark:border-zinc-700 pl-2 text-stone-600 dark:text-zinc-400 text-[11px]">
                                  "{q.sourceQuote}"
                                </blockquote>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Footer action: Finish / Review Score */}
      <div className="pt-3 border-t border-stone-200 dark:border-zinc-800 flex items-center justify-between gap-2">
        <div className="text-xs text-stone-500 dark:text-zinc-400">
          <span>
            {totalAnswered} / {totalQuestions} answered
          </span>
        </div>
        <button
          type="button"
          onClick={onFinishSession}
          className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-stone-900 dark:bg-zinc-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>{isSessionFinished ? 'Review Score Summary' : 'Finish Session'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
