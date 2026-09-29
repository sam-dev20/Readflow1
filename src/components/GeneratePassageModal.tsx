import React, { useState } from 'react';
import { Difficulty, Passage } from '../types/reading';
import { requestGeneratePassage } from '../utils/passageGenerator';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GeneratePassageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPassageGenerated: (passage: Passage) => void;
}

const ACADEMIC_DISCIPLINES = [
  'Surprise Me (Any Field)',
  'Natural Sciences',
  'Archaeology & Antiquity',
  'Cognitive Psychology',
  'Linguistics & Epigraphy',
  'Marine Geology & Oceanography',
  'Architecture & Engineering',
  'Ecology & Biodiversity',
];

export const GeneratePassageModal: React.FC<GeneratePassageModalProps> = ({
  isOpen,
  onClose,
  onPassageGenerated,
}) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('Surprise Me (Any Field)');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMessage('Formulating academic passage topic...');

    const topicQuery = customTopic.trim()
      ? customTopic.trim()
      : selectedDiscipline === 'Surprise Me (Any Field)'
      ? ''
      : selectedDiscipline;

    const timer1 = setTimeout(() => {
      setStatusMessage('Composing paragraphs and scholarly context...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setStatusMessage('Creating True/False/Not Given and Blank questions...');
    }, 2500);

    try {
      const generated = await requestGeneratePassage({
        difficulty,
        topic: topicQuery,
      });
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      onPassageGenerated(generated);
      onClose();
    } catch {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-stone-950/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88dvh]"
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                Generate Academic Passage
              </h2>
              <p className="text-[11px] sm:text-xs text-stone-500">
                Create an IELTS-standard reading text with questions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50 transition-colors disabled:opacity-30 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Difficulty Level */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5">
              1. Reading Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as const).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer text-center ${
                    difficulty === diff
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-stone-50/50'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Discipline Pills */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1.5">
              2. Academic Discipline
            </label>
            <div className="flex flex-wrap gap-1.5">
              {ACADEMIC_DISCIPLINES.map((disc) => (
                <button
                  key={disc}
                  type="button"
                  onClick={() => {
                    setSelectedDiscipline(disc);
                    setCustomTopic('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    selectedDiscipline === disc && !customTopic
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                  }`}
                >
                  {disc}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Topic Input */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
              3. Specific Topic (Optional)
            </label>
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl outline-none focus:border-stone-900 bg-white"
            />
          </div>

          {/* Loading Animation Box */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 text-amber-700 animate-spin shrink-0" />
                  <div className="text-xs text-stone-700 font-medium">
                    {statusMessage}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-stone-200 flex items-center justify-between bg-stone-50/70">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-200/50 transition-colors cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 sm:px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
