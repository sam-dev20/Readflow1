import React from 'react';
import { Home, RotateCcw, Settings, History, PlusCircle, BookOpen } from 'lucide-react';

interface HeaderProps {
  currentView: 'home' | 'reader';
  onNavigateHome: () => void;
  onNavigateReader: () => void;
  onOpenConfig: () => void;
  onOpenHistory: () => void;
  onOpenCustomPassage: () => void;
  onOpenGeneratePassage: () => void;
  onRestartSession: () => void;
  activePassageTitle: string;
  difficulty: string;
  hasStarted: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigateHome,
  onNavigateReader,
  onOpenConfig,
  onOpenHistory,
  onOpenCustomPassage,
  onRestartSession,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-[#FAF8F5]/90 dark:bg-[#0F1115]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Wordmark & View switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-stone-900 dark:text-zinc-100 hover:opacity-85 transition-opacity cursor-pointer"
            title="Go to Homepage"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-stone-900 dark:bg-zinc-100 text-stone-50 dark:text-zinc-900 flex items-center justify-center font-serif text-base sm:text-lg font-bold">
              R
            </div>
            <span className="font-serif text-base sm:text-xl font-bold tracking-tight">
              ReadFlow
            </span>
          </button>

          {/* Home / Practice Pill */}
          <div className="flex items-center bg-stone-100 dark:bg-zinc-800 p-0.5 rounded-lg text-xs font-semibold ml-1">
            <button
              type="button"
              onClick={onNavigateHome}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                currentView === 'home'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              <Home className="w-3 h-3" />
              <span className="hidden xs:inline">Home</span>
            </button>
            <button
              type="button"
              onClick={onNavigateReader}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                currentView === 'reader'
                  ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900 dark:hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3 h-3" />
              <span className="hidden xs:inline">Reader</span>
            </button>
          </div>
        </div>

        {/* Center: Desktop Navigation links */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-stone-600 dark:text-zinc-400">
          <button
            type="button"
            onClick={onOpenConfig}
            className="hover:text-stone-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          >
            Passages & Setup
          </button>
          <button
            type="button"
            onClick={onOpenCustomPassage}
            className="hover:text-stone-900 dark:hover:text-zinc-100 transition-colors cursor-pointer flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Passage</span>
          </button>
          <button
            type="button"
            onClick={onOpenHistory}
            className="hover:text-stone-900 dark:hover:text-zinc-100 transition-colors cursor-pointer flex items-center gap-1"
          >
            <History className="w-3.5 h-3.5" />
            <span>History</span>
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {currentView === 'reader' && (
            <button
              type="button"
              onClick={onRestartSession}
              title="Reset current passage"
              className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-medium text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenConfig}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-zinc-300 hover:text-stone-900 dark:hover:text-white border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 rounded-lg shadow-xs transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
            title="Configure settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </div>
      </div>
    </header>
  );
};
