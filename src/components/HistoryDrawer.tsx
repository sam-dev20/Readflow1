import React from 'react';
import { SessionRecord } from '../types/reading';
import { X, History, Trash2, Calendar, Award, ChevronRight, Undo2 } from 'lucide-react';
import { motion } from 'motion/react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  records: SessionRecord[];
  onClearHistory: () => void;
  onDeleteRecord?: (recordId: string) => void;
  onUndoLastAction?: () => void;
  onSelectPassage?: (passageTitle: string, passageId?: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  records,
  onClearHistory,
  onDeleteRecord,
  onUndoLastAction,
  onSelectPassage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/40 backdrop-blur-xs">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="w-full max-w-md bg-white dark:bg-zinc-900 h-full shadow-2xl flex flex-col border-l border-stone-200 dark:border-zinc-800"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-zinc-800 flex items-center justify-between bg-stone-50/80 dark:bg-zinc-800/60 shrink-0">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-stone-800 dark:text-zinc-200" />
            <h2 className="font-serif text-lg font-bold text-stone-900 dark:text-zinc-100">
              Practice History
            </h2>
            {records.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-300 font-semibold">
                {records.length}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {records.length > 0 && onUndoLastAction && (
            <div className="pb-1">
              <button
                type="button"
                onClick={onUndoLastAction}
                className="w-full py-2 px-3 text-xs font-semibold text-stone-700 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-zinc-100 bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200/80 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                title="Undo the most recent history entry"
              >
                <Undo2 className="w-3.5 h-3.5 text-stone-600 dark:text-zinc-400" />
                <span>Undo Previous Action (Remove Latest Entry)</span>
              </button>
            </div>
          )}

          {records.length === 0 ? (
            <div className="text-center py-12 text-stone-500 dark:text-zinc-400">
              <Award className="w-10 h-10 mx-auto text-stone-300 dark:text-zinc-600 stroke-[1.5] mb-2" />
              <p className="font-serif text-base text-stone-700 dark:text-zinc-300">
                No practice records yet
              </p>
              <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1">
                Passages you click or complete will appear here.
              </p>
            </div>
          ) : (
            records.map((rec) => {
              const minutes = Math.floor(rec.timeSpentSeconds / 60);
              const seconds = rec.timeSpentSeconds % 60;
              const isCompleted = rec.status === 'completed' || rec.scorePercentage > 0;

              return (
                <div
                  key={rec.id}
                  onClick={() => {
                    if (onSelectPassage) {
                      onSelectPassage(rec.passageTitle, rec.passageId);
                      onClose();
                    }
                  }}
                  className={`relative p-4 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/40 dark:bg-zinc-800/40 space-y-2.5 transition-all group ${
                    onSelectPassage
                      ? 'hover:border-stone-400 dark:hover:border-zinc-600 hover:bg-stone-50 dark:hover:bg-zinc-800 cursor-pointer'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-serif font-semibold text-stone-900 dark:text-zinc-100 text-sm leading-snug">
                      {rec.passageTitle}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isCompleted ? (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${
                            rec.scorePercentage >= 75
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : rec.scorePercentage >= 50
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {rec.scorePercentage}%
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-300 shrink-0">
                          Viewed
                        </span>
                      )}
                      {onDeleteRecord && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteRecord(rec.id);
                          }}
                          className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                          title="Delete this history entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-500 dark:text-zinc-400">
                    <span className="capitalize">{rec.difficulty}</span>
                    <span aria-hidden="true">•</span>
                    {isCompleted ? (
                      <>
                        <span>
                          {rec.correctCount} / {rec.totalQuestions} correct
                        </span>
                        <span aria-hidden="true">•</span>
                        <span>
                          {minutes}m {seconds}s
                        </span>
                      </>
                    ) : (
                      <span>{rec.totalQuestions} questions</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-zinc-500 pt-1 border-t border-stone-100 dark:border-zinc-800">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{rec.date}</span>
                    </div>
                    {onSelectPassage && (
                      <span className="inline-flex items-center gap-0.5 text-stone-600 dark:text-zinc-400 font-semibold group-hover:underline">
                        <span>Open</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {records.length > 0 && (
          <div className="p-4 border-t border-stone-200 dark:border-zinc-800 bg-stone-50/80 dark:bg-zinc-800/60 shrink-0 flex items-center gap-2">
            {onUndoLastAction && (
              <button
                type="button"
                onClick={onUndoLastAction}
                className="flex-1 py-2 px-3 text-xs font-semibold text-stone-700 dark:text-zinc-300 hover:text-stone-900 hover:bg-stone-200/70 dark:hover:bg-zinc-700 border border-stone-300 dark:border-zinc-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                title="Undo the most recent history action"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span>Undo Last</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClearHistory}
              className="flex-1 py-2 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
