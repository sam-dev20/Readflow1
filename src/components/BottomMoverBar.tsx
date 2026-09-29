import React from 'react';
import { BookOpen, CheckSquare, ArrowUp } from 'lucide-react';

interface BottomMoverBarProps {
  activeTab: 'passage' | 'questions';
  onSwitchTab: (tab: 'passage' | 'questions') => void;
  onScrollToTop: () => void;
  totalAnswered: number;
  totalQuestions: number;
  paragraphIds: string[];
  onJumpToParagraph: (id: string) => void;
  isUntimed: boolean;
  formattedTime?: string;
  isTimerRunning?: boolean;
}

export const BottomMoverBar: React.FC<BottomMoverBarProps> = ({
  activeTab,
  onSwitchTab,
  onScrollToTop,
  totalAnswered,
  totalQuestions,
  paragraphIds,
  onJumpToParagraph,
}) => {
  return (
    <nav
      aria-label="Section Mover and Bottom Controls"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-stone-200 dark:border-zinc-800 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-2 sm:px-4 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Main Section Switcher Tabs */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-zinc-800/90 p-1 rounded-xl flex-1 max-w-md">
          {/* Passage Button */}
          <button
            type="button"
            onClick={() => onSwitchTab('passage')}
            className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'passage'
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
            }`}
            title="Switch to reading passage"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Passage</span>
          </button>

          {/* Questions Button */}
          <button
            type="button"
            onClick={() => onSwitchTab('questions')}
            className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
            }`}
            title="Switch to questions list"
          >
            <CheckSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Questions</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-mono shrink-0 ${
                activeTab === 'questions'
                  ? 'bg-stone-100 dark:bg-zinc-800 text-stone-900 dark:text-zinc-200'
                  : 'bg-stone-200 dark:bg-zinc-700 text-stone-700 dark:text-zinc-300'
              }`}
            >
              {totalAnswered}/{totalQuestions}
            </span>
          </button>
        </div>

        {/* Quick jump to paragraph shortcuts (when in passage view) */}
        {activeTab === 'passage' && paragraphIds.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 overflow-x-auto max-w-[200px] py-0.5">
            <span className="text-[11px] font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wider mr-0.5">
              Para:
            </span>
            {paragraphIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onJumpToParagraph(id)}
                className="w-6 h-6 rounded text-[11px] font-bold bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 text-stone-700 dark:text-zinc-300 transition-colors cursor-pointer flex items-center justify-center shrink-0"
                title={`Jump to paragraph ${id}`}
              >
                {id}
              </button>
            ))}
          </div>
        )}

        {/* Scroll To Top Mover Button */}
        <button
          type="button"
          onClick={onScrollToTop}
          className="p-2 sm:px-3 sm:py-2 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 hover:bg-stone-100 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          title="Scroll immediately to top of section"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span className="hidden xs:inline sm:inline">Top</span>
        </button>
      </div>
    </nav>
  );
};
