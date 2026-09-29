import React, { useState } from 'react';
import { Passage, Difficulty, TFNGQuestion, FillBlankQuestion, TFNGAnswer } from '../types/reading';
import { X, Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

interface CustomPassageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePassage: (passage: Passage) => void;
}

export const CustomPassageModal: React.FC<CustomPassageModalProps> = ({
  isOpen,
  onClose,
  onSavePassage,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [passageText, setPassageText] = useState('');

  // TFNG builder state
  const [tfngList, setTfngList] = useState<Array<{
    statement: string;
    correctAnswer: TFNGAnswer;
    paragraphRef: string;
    explanation: string;
  }>>([
    { statement: '', correctAnswer: 'TRUE', paragraphRef: 'A', explanation: '' }
  ]);

  // Fill in blanks builder state
  const [blankList, setBlankList] = useState<Array<{
    prefix: string;
    missingWord: string;
    suffix: string;
    paragraphRef: string;
  }>>([
    { prefix: '', missingWord: '', suffix: '', paragraphRef: 'A' }
  ]);

  if (!isOpen) return null;

  const handleAddTfng = () => {
    setTfngList(prev => [
      ...prev,
      { statement: '', correctAnswer: 'TRUE', paragraphRef: 'A', explanation: '' }
    ]);
  };

  const handleRemoveTfng = (index: number) => {
    setTfngList(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddBlank = () => {
    setBlankList(prev => [
      ...prev,
      { prefix: '', missingWord: '', suffix: '', paragraphRef: 'A' }
    ]);
  };

  const handleRemoveBlank = (index: number) => {
    setBlankList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!title.trim() || !passageText.trim()) return;

    const rawParagraphs = passageText
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(p => p.length > 0);

    const letterIds = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
    const paragraphs = rawParagraphs.map((pText, i) => {
      let text = pText;
      let id = letterIds[i] || `P${i + 1}`;
      const match = pText.match(/^([A-Z])[\.\s:]+\s*(.+)$/s);
      if (match) {
        id = match[1];
        text = match[2];
      }
      return { id, text };
    });

    const wordsCount = passageText.split(/\s+/).filter(Boolean).length;
    const estMinutes = Math.max(1, Math.round(wordsCount / 180));

    const formattedTfng: TFNGQuestion[] = tfngList
      .filter(q => q.statement.trim().length > 0)
      .map((q, idx) => ({
        id: idx + 1,
        statement: q.statement.trim(),
        correctAnswer: q.correctAnswer,
        paragraphRef: q.paragraphRef || 'A',
        explanation: q.explanation.trim() || 'Refer to the passage content.',
        sourceQuote: '',
      }));

    const formattedBlanks: FillBlankQuestion[] = blankList
      .filter(b => b.missingWord.trim().length > 0)
      .map((b, idx) => ({
        id: idx + 1,
        prefix: b.prefix.trim(),
        suffix: b.suffix.trim(),
        acceptableAnswers: [b.missingWord.trim().toLowerCase()],
        displayAnswer: b.missingWord.trim(),
        paragraphRef: b.paragraphRef || 'A',
        explanation: `Found in Paragraph ${b.paragraphRef || 'A'}.`,
        sourceQuote: '',
      }));

    const newPassage: Passage = {
      id: `custom-${Date.now()}`,
      title: title.trim(),
      subtitle: subtitle.trim() || undefined,
      category: category.trim() || 'Academic Reading',
      difficulty,
      wordCount: wordsCount,
      estimatedReadTime: `${estMinutes} min`,
      paragraphs: paragraphs.length > 0 ? paragraphs : [{ id: 'A', text: passageText }],
      tfngQuestions: formattedTfng,
      fillBlankQuestions: formattedBlanks,
      blanksInstruction: 'Complete the sentences below using words from the passage.',
    };

    onSavePassage(newPassage);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-stone-950/50 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg sm:max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[88dvh]"
      >
        <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
          <div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
              Create Custom Reading Passage
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Add your own passage text, True/False/Not Given questions, and fill-in blanks
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

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Passage Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg outline-none focus:border-stone-900 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg outline-none focus:border-stone-900 bg-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Subtitle (Optional)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg outline-none focus:border-stone-900 bg-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-lg outline-none focus:border-stone-900 bg-white"
              />
            </div>
          </div>

          {/* Passage Text */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 block mb-1">
              Passage Text * (Separate paragraphs with double enter)
            </label>
            <textarea
              rows={6}
              value={passageText}
              onChange={e => setPassageText(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm font-serif leading-relaxed border border-stone-300 rounded-lg outline-none focus:border-stone-900 bg-white"
            />
          </div>

          {/* True / False / Not Given Questions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                True / False / Not Given Questions
              </label>
              <button
                type="button"
                onClick={handleAddTfng}
                className="px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Statement</span>
              </button>
            </div>
            {tfngList.map((item, idx) => (
              <div key={idx} className="p-3 border border-stone-200 rounded-xl bg-stone-50/50 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs font-bold text-stone-500 mt-2">{idx + 1}.</span>
                  <input
                    type="text"
                    value={item.statement}
                    onChange={e => {
                      const val = e.target.value;
                      setTfngList(prev => prev.map((q, i) => i === idx ? { ...q, statement: val } : q));
                    }}
                    className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-md outline-none focus:border-stone-900 bg-white"
                  />
                  {tfngList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTfng(idx)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs pl-5">
                  <div className="flex items-center gap-1">
                    <span className="text-stone-500 font-medium">Answer:</span>
                    <select
                      value={item.correctAnswer}
                      onChange={e => {
                        const val = e.target.value as TFNGAnswer;
                        setTfngList(prev => prev.map((q, i) => i === idx ? { ...q, correctAnswer: val } : q));
                      }}
                      className="px-2 py-1 border border-stone-300 rounded bg-white font-semibold text-stone-800"
                    >
                      <option value="TRUE">TRUE</option>
                      <option value="FALSE">FALSE</option>
                      <option value="NOT GIVEN">NOT GIVEN</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-500 font-medium">Section:</span>
                    <input
                      type="text"
                      maxLength={2}
                      value={item.paragraphRef}
                      onChange={e => {
                        const val = e.target.value.toUpperCase();
                        setTfngList(prev => prev.map((q, i) => i === idx ? { ...q, paragraphRef: val } : q));
                      }}
                      className="w-10 px-1.5 py-1 border border-stone-300 rounded text-center font-bold bg-white"
                    />
                  </div>
                  <div className="flex-1 min-w-[160px]">
                    <input
                      type="text"
                      value={item.explanation}
                      onChange={e => {
                        const val = e.target.value;
                        setTfngList(prev => prev.map((q, i) => i === idx ? { ...q, explanation: val } : q));
                      }}
                      className="w-full px-2 py-1 text-xs border border-stone-300 rounded bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fill in Blanks Questions */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Fill in the Blanks Questions
              </label>
              <button
                type="button"
                onClick={handleAddBlank}
                className="px-2.5 py-1 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Blank Question</span>
              </button>
            </div>
            {blankList.map((item, idx) => (
              <div key={idx} className="p-3 border border-stone-200 rounded-xl bg-stone-50/50 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-mono text-xs font-bold text-stone-500 mt-2">{idx + 1}.</span>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={item.prefix}
                      onChange={e => {
                        const val = e.target.value;
                        setBlankList(prev => prev.map((b, i) => i === idx ? { ...b, prefix: val } : b));
                      }}
                      className="px-2.5 py-1.5 text-xs border border-stone-300 rounded-md outline-none focus:border-stone-900 bg-white"
                    />
                    <input
                      type="text"
                      value={item.missingWord}
                      onChange={e => {
                        const val = e.target.value;
                        setBlankList(prev => prev.map((b, i) => i === idx ? { ...b, missingWord: val } : b));
                      }}
                      className="px-2.5 py-1.5 text-xs font-bold border border-emerald-300 rounded-md outline-none focus:border-emerald-700 bg-white"
                    />
                    <input
                      type="text"
                      value={item.suffix}
                      onChange={e => {
                        const val = e.target.value;
                        setBlankList(prev => prev.map((b, i) => i === idx ? { ...b, suffix: val } : b));
                      }}
                      className="px-2.5 py-1.5 text-xs border border-stone-300 rounded-md outline-none focus:border-stone-900 bg-white"
                    />
                  </div>
                  {blankList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveBlank(idx)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2 pl-5 text-xs">
                  <span className="text-stone-500 font-medium">Section reference:</span>
                  <input
                    type="text"
                    maxLength={2}
                    value={item.paragraphRef}
                    onChange={e => {
                      const val = e.target.value.toUpperCase();
                      setBlankList(prev => prev.map((b, i) => i === idx ? { ...b, paragraphRef: val } : b));
                    }}
                    className="w-10 px-1.5 py-1 border border-stone-300 rounded text-center font-bold bg-white"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

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
            disabled={!title.trim() || !passageText.trim()}
            className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 disabled:opacity-40 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save & Load
          </button>
        </div>
      </motion.div>
    </div>
  );
};
