import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Clock, AlertTriangle, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TimerBarProps {
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  isUntimed: boolean;
  timeSpentSeconds: number;
  onTogglePlay: () => void;
  onResetTimer: () => void;
  onAdjustSeconds: (deltaSeconds: number) => void;
  onToggleUntimed: () => void;
}

export const TimerBar: React.FC<TimerBarProps> = ({
  secondsLeft,
  totalSeconds,
  isRunning,
  isUntimed,
  timeSpentSeconds,
  onTogglePlay,
  onResetTimer,
  onAdjustSeconds,
  onToggleUntimed,
}) => {
  const [showAdjust, setShowAdjust] = useState(false);
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = !isUntimed && secondsLeft <= 60 && secondsLeft > 0;
  const isExpired = !isUntimed && secondsLeft === 0;
  const isReadyToStart = !isUntimed && !isRunning && timeSpentSeconds === 0;

  return (
    <div className="w-full bg-white dark:bg-zinc-900 border border-stone-200/90 dark:border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xs transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Timer status & value */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
              isExpired
                ? 'bg-rose-100 text-rose-700'
                : isUrgent
                ? 'bg-amber-100 text-amber-700 animate-pulse'
                : isReadyToStart
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                : 'bg-stone-100 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300'
            }`}
          >
            {isExpired || isUrgent ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {isUntimed ? (
                <span className="font-mono text-base sm:text-lg font-bold tracking-tight text-stone-800 dark:text-zinc-200">
                  Untimed Practice
                </span>
              ) : (
                <span
                  className={`font-mono text-lg sm:text-xl font-bold tracking-tight ${
                    isExpired
                      ? 'text-rose-600'
                      : isUrgent
                      ? 'text-amber-600'
                      : 'text-stone-900 dark:text-zinc-100'
                  }`}
                >
                  {formattedTime}
                </span>
              )}
              {!isUntimed && (
                <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
                  {isRunning ? 'Ticking' : isReadyToStart ? 'Ready' : 'Paused'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              <span className="truncate">
                {isUntimed
                  ? 'Self-paced study'
                  : isReadyToStart
                  ? `Click Start to begin (${Math.round(totalSeconds / 60)} min)`
                  : `Limit: ${Math.round(totalSeconds / 60)} min`}
              </span>
              <span aria-hidden="true">•</span>
              <button
                type="button"
                onClick={() => setShowAdjust(!showAdjust)}
                className="text-stone-600 dark:text-zinc-300 hover:text-stone-900 underline font-medium cursor-pointer shrink-0"
              >
                {showAdjust ? 'Hide' : 'Adjust'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Timer Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!isUntimed && (
            <>
              <button
                type="button"
                onClick={onTogglePlay}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  isRunning
                    ? 'bg-stone-100 dark:bg-zinc-800 text-stone-800 dark:text-zinc-200 hover:bg-stone-200'
                    : isReadyToStart
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold ring-2 ring-amber-400/30'
                    : 'bg-stone-900 hover:bg-stone-800 text-white dark:bg-zinc-100 dark:text-stone-900'
                }`}
                title={isRunning ? 'Pause Timer' : 'Start Timer'}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{isReadyToStart ? 'Start Timer' : 'Resume'}</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onResetTimer}
                title="Reset timer"
                className="p-1.5 text-stone-500 hover:text-stone-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onToggleUntimed}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
              isUntimed
                ? 'bg-stone-900 text-white border-stone-900 dark:bg-zinc-100 dark:text-stone-900'
                : 'bg-white dark:bg-zinc-900 text-stone-600 dark:text-zinc-300 border-stone-200 dark:border-zinc-700 hover:text-stone-900'
            }`}
          >
            {isUntimed ? 'Set Timer' : 'Untimed'}
          </button>
        </div>
      </div>

      {/* Adjust Duration Drawer */}
      <AnimatePresence>
        {showAdjust && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden pt-3 mt-3 border-t border-stone-100 dark:border-zinc-800"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="text-stone-600 dark:text-zinc-400 font-medium">
                Add or remove minutes:
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onAdjustSeconds(-60)}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 font-semibold cursor-pointer flex items-center gap-0.5"
                >
                  <Minus className="w-3 h-3" />
                  <span>1m</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustSeconds(60)}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 font-semibold cursor-pointer flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>1m</span>
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustSeconds(300)}
                  className="px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 hover:bg-stone-100 font-semibold cursor-pointer flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  <span>5m</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
