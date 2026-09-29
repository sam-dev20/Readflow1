import React, { useState } from 'react';
import { Passage, Difficulty, QuestionMode, SessionConfig } from '../types/reading';
import { X, Check, Clock, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SessionConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  passages: Passage[];
  currentConfig: SessionConfig;
  onApplyConfig: (config: SessionConfig) => void;
  onOpenGenerateModal?: () => void;
}

export const SessionConfigModal: React.FC<SessionConfigModalProps> = ({
  isOpen,
  onClose,
  passages,
  currentConfig,
  onApplyConfig,
  onOpenGenerateModal,
}) => {
  const [selectedPassageId, setSelectedPassageId] = useState(currentConfig.passageId);
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<'all' | Difficulty>('all');
  const [questionMode, setQuestionMode] = useState<QuestionMode>(currentConfig.questionMode);
  const [immediateFeedback, setImmediateFeedback] = useState<boolean>(currentConfig.immediateFeedback);
  const [timerMinutes, setTimerMinutes] = useState<number>(currentConfig.timerMinutes);
  const [customMinutesInput, setCustomMinutesInput] = useState<string>(
    [5, 10, 15, 20].includes(currentConfig.timerMinutes) || currentConfig.timerMinutes === 0
      ? ''
      : String(currentConfig.timerMinutes)
  );

  if (!isOpen) return null;

  const filteredPassages = passages.filter((p) => {
    if (selectedDifficultyFilter === 'all') return true;
    return p.difficulty === selectedDifficultyFilter;
  });

  const selectedPassage = passages.find((p) => p.id === selectedPassageId) || passages[0];

  const handleSave = () => {
    let finalTimer = timerMinutes;
    if (customMinutesInput && !isNaN(Number(customMinutesInput))) {
      const parsed = Math.max(1, Math.min(120, parseInt(customMinutesInput, 10)));
      finalTimer = parsed;
    }

    onApplyConfig({
      passageId: selectedPassageId,
      difficulty: selectedPassage.difficulty,
      questionMode,
      immediateFeedback,
      timerMinutes: finalTimer,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-stone-950/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-lg sm:max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88dvh]"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
              Configure Practice Session
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select passage, questions, timer, and feedback preferences
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Section 1: Passage Selection & Difficulty */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                  1. Select Passage
                </label>
                {onOpenGenerateModal && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenGenerateModal();
                    }}
                    className="text-[11px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-full border border-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Generate New</span>
                  </button>
                )}
              </div>

              {/* Difficulty filter tabs */}
              <div className="flex items-center gap-0.5 p-0.5 bg-stone-100 rounded-lg text-xs">
                {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setSelectedDifficultyFilter(diff)}
                    className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                      selectedDifficultyFilter === diff
                        ? 'bg-white text-stone-900 shadow-xs font-semibold'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
              {filteredPassages.map((p) => {
                const isSelected = p.id === selectedPassageId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPassageId(p.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                      isSelected
                        ? 'border-stone-900 bg-stone-50 shadow-xs ring-1 ring-stone-900'
                        : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-serif font-semibold text-stone-900 text-xs sm:text-sm truncate max-w-full">
                          {p.title}
                        </span>
                        {p.isGenerated && (
                          <span className="text-[10px] font-sans font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                            Generated
                          </span>
                        )}
                        {p.id === 'brain-tricks-perception' && (
                          <span className="text-[10px] font-sans font-semibold text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
                            Core Text
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-stone-500 mt-1">
                        <span className="capitalize">{p.difficulty}</span>
                        <span aria-hidden="true">•</span>
                        <span>{p.category}</span>
                        <span aria-hidden="true">•</span>
                        <span>{p.paragraphs.length} paras</span>
                        <span aria-hidden="true">•</span>
                        <span>{p.tfngQuestions.length + p.fillBlankQuestions.length} Qs</span>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-300'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Question Type */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2">
              2. Questions to Include
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setQuestionMode('both')}
                className={`p-2.5 sm:p-3 rounded-xl border text-left sm:text-center transition-all cursor-pointer ${
                  questionMode === 'both'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <div className="text-xs font-bold">Both Types</div>
                <div className={`text-[11px] mt-0.5 ${questionMode === 'both' ? 'text-stone-300' : 'text-stone-500'}`}>
                  T/F/NG + Blanks
                </div>
              </button>
              <button
                type="button"
                onClick={() => setQuestionMode('tfng')}
                className={`p-2.5 sm:p-3 rounded-xl border text-left sm:text-center transition-all cursor-pointer ${
                  questionMode === 'tfng'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <div className="text-xs font-bold">True / False / Not Given</div>
                <div className={`text-[11px] mt-0.5 ${questionMode === 'tfng' ? 'text-stone-300' : 'text-stone-500'}`}>
                  Only Statements
                </div>
              </button>
              <button
                type="button"
                onClick={() => setQuestionMode('fill_blank')}
                className={`p-2.5 sm:p-3 rounded-xl border text-left sm:text-center transition-all cursor-pointer ${
                  questionMode === 'fill_blank'
                    ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                <div className="text-xs font-bold">Fill in the Blanks</div>
                <div className={`text-[11px] mt-0.5 ${questionMode === 'fill_blank' ? 'text-stone-300' : 'text-stone-500'}`}>
                  Only Word Entry
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Customizable Timer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                3. Session Timer
              </label>
              <span className="text-xs text-stone-500">
                {timerMinutes === 0 ? 'Untimed practice' : `${timerMinutes} min`}
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 sm:gap-2">
              {[5, 10, 15, 20].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setTimerMinutes(mins);
                    setCustomMinutesInput('');
                  }}
                  className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                    timerMinutes === mins && !customMinutesInput
                      ? 'border-stone-900 bg-stone-900 text-white'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700'
                  }`}
                >
                  {mins} min
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setTimerMinutes(0);
                  setCustomMinutesInput('');
                }}
                className={`py-2 px-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer text-center ${
                  timerMinutes === 0 && !customMinutesInput
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700'
                }`}
              >
                Untimed
              </button>
            </div>

            {/* Custom Minutes Input */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">
                Custom minutes:
              </span>
              <input
                type="number"
                min="1"
                max="120"
                value={customMinutesInput}
                onChange={(e) => {
                  setCustomMinutesInput(e.target.value);
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val > 0) {
                    setTimerMinutes(val);
                  }
                }}
                aria-label="Custom timer minutes"
                className="w-20 px-2.5 py-1 text-xs font-mono border border-stone-300 rounded-lg outline-none focus:border-stone-900 bg-white"
              />
              <span className="text-xs text-stone-500">minutes</span>
            </div>
          </div>

          {/* Section 4: Feedback Mode */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-2">
              4. Feedback Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setImmediateFeedback(true)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  immediateFeedback
                    ? 'border-emerald-700 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-700'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Immediate Feedback</span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                  See whether each answer is right or wrong instantly with explanations.
                </p>
              </button>
              <button
                type="button"
                onClick={() => setImmediateFeedback(false)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  !immediateFeedback
                    ? 'border-stone-900 bg-stone-50 shadow-xs ring-1 ring-stone-900'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                  <Clock className="w-4 h-4 text-stone-700 shrink-0" />
                  <span>Exam / Test Mode</span>
                </div>
                <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                  Answers remain concealed until you complete and submit the test.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-stone-200 flex items-center justify-between bg-stone-50/80">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Apply Settings
          </button>
        </div>
      </motion.div>
    </div>
  );
};
