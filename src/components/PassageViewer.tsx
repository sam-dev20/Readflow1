import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Passage,
  FontFamily,
  FontSize,
  LineHeight,
  ReadingTheme,
  ColumnWidth,
} from '../types/reading';
import {
  Type,
  Trash2,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  Sliders,
  X,
  Undo2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PassageViewerProps {
  passage: Passage;
  highlightedParagraphId: string | null;
  onClearParagraphHighlight: () => void;
  fontFamily: FontFamily;
  onChangeFontFamily: (font: FontFamily) => void;
  fontSize: FontSize;
  onChangeFontSize: (size: FontSize) => void;
  lineHeight: LineHeight;
  onChangeLineHeight: (height: LineHeight) => void;
  theme: ReadingTheme;
  onChangeTheme: (theme: ReadingTheme) => void;
  columnWidth: ColumnWidth;
  onChangeColumnWidth: (width: ColumnWidth) => void;
  focusMode: boolean;
  onToggleFocusMode: () => void;
}

interface UserHighlight {
  id: string;
  paragraphId: string;
  color: 'amber' | 'emerald' | 'sky' | 'rose';
  text: string;
}

export const PassageViewer: React.FC<PassageViewerProps> = ({
  passage,
  highlightedParagraphId,
  onClearParagraphHighlight,
  fontFamily,
  onChangeFontFamily,
  fontSize,
  onChangeFontSize,
  lineHeight,
  onChangeLineHeight,
  theme,
  onChangeTheme,
  columnWidth,
  onChangeColumnWidth,
  focusMode,
  onToggleFocusMode,
}) => {
  const [selectedText, setSelectedText] = useState<{
    text: string;
    paragraphId: string;
    rect: DOMRect | null;
  } | null>(null);
  const [userHighlights, setUserHighlights] = useState<UserHighlight[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isTypographyMenuOpen, setIsTypographyMenuOpen] = useState<boolean>(false);
  const [activeHoveredParagraph, setActiveHoveredParagraph] = useState<string | null>(null);

  const paragraphRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Scroll to targeted paragraph
  useEffect(() => {
    if (highlightedParagraphId && paragraphRefs.current[highlightedParagraphId]) {
      const el = paragraphRefs.current[highlightedParagraphId];
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const timer = setTimeout(() => {
        onClearParagraphHighlight();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedParagraphId, onClearParagraphHighlight]);

  // Focus search input on open
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isSearchOpen]);

  // Handle text selection
  const handleMouseUp = (paragraphId: string) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelectedText(null);
      return;
    }
    const text = selection.toString().trim();
    if (text.length > 2) {
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectedText({ text, paragraphId, rect });
      } catch {
        setSelectedText(null);
      }
    } else {
      setSelectedText(null);
    }
  };

  const addHighlight = (color: 'amber' | 'emerald' | 'sky' | 'rose') => {
    if (!selectedText) return;
    const newHighlight: UserHighlight = {
      id: `${Date.now()}-${Math.random()}`,
      paragraphId: selectedText.paragraphId,
      color,
      text: selectedText.text,
    };
    setUserHighlights((prev) => [...prev, newHighlight]);
    window.getSelection()?.removeAllRanges();
    setSelectedText(null);
  };

  const clearAllHighlights = () => {
    setUserHighlights([]);
    setSelectedText(null);
  };

  // Search match statistics
  const searchMatchesCount = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return 0;
    const q = searchQuery.toLowerCase();
    let count = 0;
    passage.paragraphs.forEach((p) => {
      const pText = p.text.toLowerCase();
      let pos = 0;
      while ((pos = pText.indexOf(q, pos)) !== -1) {
        count++;
        pos += q.length;
      }
    });
    return count;
  }, [searchQuery, passage.paragraphs]);

  // Typography styling rules
  const fontFamilyClass = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono text-[0.95em]',
    humanist: 'font-sans tracking-wide',
  }[fontFamily];

  const fontSizeClass = {
    sm: 'text-[15px]',
    base: 'text-[17px]',
    lg: 'text-[19px]',
    xl: 'text-[21px]',
  }[fontSize];

  const lineHeightClass = {
    compact: 'leading-normal sm:leading-relaxed',
    normal: 'leading-relaxed sm:leading-[1.85]',
    relaxed: 'leading-loose sm:leading-[2.1]',
  }[lineHeight];

  const columnWidthClass = {
    narrow: 'max-w-xl mx-auto',
    normal: 'max-w-2xl mx-auto',
    wide: 'max-w-none',
  }[columnWidth];

  const themeClasses = {
    paper: 'bg-[#FBF9F5] text-stone-900 border-stone-200/90 selection:bg-amber-200',
    white: 'bg-white text-stone-900 border-stone-200 selection:bg-amber-200',
    sepia: 'bg-[#F5EFEB] text-[#2C241D] border-[#E2D5C8] selection:bg-[#E8D4BE]',
    night: 'bg-[#18181B] text-[#E4E4E7] border-zinc-800 selection:bg-amber-500/40',
  }[theme];

  const subtextClass = {
    paper: 'text-stone-500',
    white: 'text-stone-500',
    sepia: 'text-[#7C6E62]',
    night: 'text-zinc-400',
  }[theme];

  const borderClass = {
    paper: 'border-stone-200/80',
    white: 'border-stone-200',
    sepia: 'border-[#E2D5C8]',
    night: 'border-zinc-800',
  }[theme];

  // Helper to render text with search query highlighted and user highlights
  const renderParagraphContent = (paraId: string, fullText: string) => {
    const activeQuery = searchQuery.trim().toLowerCase();
    const highlightsInPara = userHighlights.filter((h) => h.paragraphId === paraId);

    // If neither search nor highlights, render pristine text
    if (!activeQuery && highlightsInPara.length === 0) {
      return fullText;
    }

    let segments: { text: string; isSearch?: boolean; highlightColor?: string }[] = [
      { text: fullText },
    ];

    // Apply user highlights
    for (const h of highlightsInPara) {
      if (!h.text.trim()) continue;
      const nextSegments: typeof segments = [];
      for (const seg of segments) {
        if (seg.isSearch || seg.highlightColor) {
          nextSegments.push(seg);
          continue;
        }
        const idx = seg.text.toLowerCase().indexOf(h.text.toLowerCase());
        if (idx !== -1) {
          const before = seg.text.substring(0, idx);
          const match = seg.text.substring(idx, idx + h.text.length);
          const after = seg.text.substring(idx + h.text.length);
          if (before) nextSegments.push({ text: before });
          nextSegments.push({ text: match, highlightColor: h.color });
          if (after) nextSegments.push({ text: after });
        } else {
          nextSegments.push(seg);
        }
      }
      segments = nextSegments;
    }

    // Apply search query highlight
    if (activeQuery && activeQuery.length >= 2) {
      const nextSegments: typeof segments = [];
      for (const seg of segments) {
        if (seg.isSearch) {
          nextSegments.push(seg);
          continue;
        }
        const parts = seg.text.split(new RegExp(`(${activeQuery})`, 'gi'));
        for (const part of parts) {
          if (part.toLowerCase() === activeQuery) {
            nextSegments.push({ text: part, isSearch: true });
          } else if (part) {
            nextSegments.push({ text: part, highlightColor: seg.highlightColor });
          }
        }
      }
      segments = nextSegments;
    }

    const highlightStyles: Record<string, string> = {
      amber: 'bg-amber-200/90 text-stone-950 dark:bg-amber-500/35 dark:text-amber-100 rounded px-0.5',
      emerald: 'bg-emerald-200/90 text-stone-950 dark:bg-emerald-500/35 dark:text-emerald-100 rounded px-0.5',
      sky: 'bg-sky-200/90 text-stone-950 dark:bg-sky-500/35 dark:text-sky-100 rounded px-0.5',
      rose: 'bg-rose-200/90 text-stone-950 dark:bg-rose-500/35 dark:text-rose-100 rounded px-0.5',
    };

    return segments.map((seg, i) => {
      if (seg.isSearch) {
        return (
          <mark
            key={i}
            className="bg-amber-300 text-stone-950 font-semibold px-0.5 rounded shadow-xs"
          >
            {seg.text}
          </mark>
        );
      }
      if (seg.highlightColor) {
        return (
          <span
            key={i}
            className={highlightStyles[seg.highlightColor] || 'bg-amber-200 rounded px-0.5'}
          >
            {seg.text}
          </span>
        );
      }
      return seg.text;
    });
  };

  return (
    <section
      className={`relative rounded-2xl border p-4 sm:p-8 pb-28 lg:pb-8 shadow-xs transition-colors duration-200 ${themeClasses}`}
    >
      {/* Editorial Header bar */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-5 border-b ${borderClass}`}>
        <div className={`flex items-center gap-2 text-xs uppercase tracking-wider font-semibold ${subtextClass}`}>
          {passage.isGenerated && (
            <span className="flex items-center gap-1 text-[11px] font-sans font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/20">
              <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              Generated Passage
            </span>
          )}
          <span>{passage.category}</span>
          <span aria-hidden="true">•</span>
          <span>{passage.wordCount} words</span>
          <span aria-hidden="true">•</span>
          <span>{passage.estimatedReadTime} read</span>
        </div>

        {/* Toolbar: Jump, Search, Typography controls */}
        <div className="flex items-center gap-2">
          {/* Quick jump to paragraph buttons */}
          <div className="hidden sm:flex items-center gap-1 mr-1">
            <span className={`text-xs mr-1 ${subtextClass}`}>Jump:</span>
            {passage.paragraphs.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  paragraphRefs.current[p.id]?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                  });
                }}
                className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer ${
                  theme === 'night'
                    ? 'hover:bg-zinc-800 text-zinc-300'
                    : 'hover:bg-stone-200/70 text-stone-700'
                }`}
                title={`Jump to Paragraph ${p.id}`}
              >
                {p.id}
              </button>
            ))}
          </div>

          {/* In-Text Keyword Search Trigger */}
          <button
            onClick={() => setIsSearchOpen((prev) => !prev)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium ${
              isSearchOpen
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : theme === 'night'
                ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                : 'border-stone-200 hover:bg-stone-100 text-stone-700'
            }`}
            title="Search keyword in passage"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Find</span>
          </button>

          {/* Focus Mode Dimmer Toggle */}
          <button
            onClick={onToggleFocusMode}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium ${
              focusMode
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : theme === 'night'
                ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                : 'border-stone-200 hover:bg-stone-100 text-stone-700'
            }`}
            title={focusMode ? 'Disable paragraph focus mode' : 'Enable paragraph focus mode'}
          >
            {focusMode ? <Eye className="w-3.5 h-3.5 text-emerald-700" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Focus</span>
          </button>

          {/* Undo Highlight / Clear Highlights controls */}
          {userHighlights.length > 0 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setUserHighlights((prev) => prev.slice(0, -1))}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium ${
                  theme === 'night'
                    ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                    : 'border-stone-200 hover:bg-stone-100 text-stone-700'
                }`}
                title="Undo last text highlight action"
              >
                <Undo2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Undo Highlight</span>
              </button>
              <button
                onClick={clearAllHighlights}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center text-xs font-medium ${
                  theme === 'night'
                    ? 'border-zinc-800 hover:bg-rose-950/40 text-rose-400'
                    : 'border-stone-200 hover:bg-rose-50 text-rose-600'
                }`}
                title="Clear all text highlights"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Typography Settings Menu Trigger */}
          <div className="relative">
            <button
              onClick={() => setIsTypographyMenuOpen((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium ${
                isTypographyMenuOpen
                  ? 'bg-stone-900 text-white border-stone-900'
                  : theme === 'night'
                  ? 'border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                  : 'border-stone-200 hover:bg-stone-100 text-stone-700'
              }`}
              title="Typography & Reading Adjustments"
            >
              <Type className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Aa</span>
              <Sliders className="w-3 h-3 opacity-60 ml-0.5" />
            </button>

            {/* Typography Adjustments Modal / Sheet */}
            <AnimatePresence>
              {isTypographyMenuOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-xs">
                  {/* Backdrop click to dismiss */}
                  <div
                    className="absolute inset-0"
                    onClick={() => setIsTypographyMenuOpen(false)}
                    aria-hidden="true"
                  />

                  <motion.div
                    initial={{ opacity: 0, y: 40, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 40, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="relative w-full sm:max-w-md bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 dark:border-zinc-800 p-5 sm:p-6 z-10 max-h-[85vh] overflow-y-auto space-y-4.5 pb-8 sm:pb-6"
                  >
                    {/* Mobile drag handle */}
                    <div className="w-12 h-1 bg-stone-300 dark:bg-zinc-700 rounded-full mx-auto mb-2 sm:hidden" />

                    <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-zinc-800">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-zinc-200 block">
                          Reading Adjustments
                        </span>
                        <span className="text-[11px] text-stone-500 dark:text-zinc-400">
                          Customize typography, text size, spacing & themes
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsTypographyMenuOpen(false)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-zinc-200 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Font Family */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 block mb-1.5">
                        Font Family
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['serif', 'sans', 'mono', 'humanist'] as const).map((font) => (
                          <button
                            key={font}
                            type="button"
                            onClick={() => onChangeFontFamily(font)}
                            className={`py-2 px-2.5 rounded-xl text-xs capitalize transition-colors cursor-pointer text-left ${
                              fontFamily === font
                                ? 'bg-stone-900 text-white dark:bg-zinc-100 dark:text-stone-900 font-semibold shadow-xs'
                                : 'bg-stone-100 dark:bg-zinc-800 hover:bg-stone-200 dark:hover:bg-zinc-700 text-stone-700 dark:text-zinc-300'
                            }`}
                          >
                            {font === 'serif' && 'Editorial Serif'}
                            {font === 'sans' && 'Modern Sans'}
                            {font === 'mono' && 'Monospace'}
                            {font === 'humanist' && 'Humanist'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font Size */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 block mb-1.5">
                        Text Size
                      </label>
                      <div className="grid grid-cols-4 gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl">
                        {(['sm', 'base', 'lg', 'xl'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => onChangeFontSize(s)}
                            className={`py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center ${
                              fontSize === s
                                ? 'bg-white dark:bg-zinc-900 shadow-xs text-stone-900 dark:text-zinc-100 font-bold'
                                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                            }`}
                          >
                            {s === 'sm' && '15px'}
                            {s === 'base' && '17px'}
                            {s === 'lg' && '19px'}
                            {s === 'xl' && '21px'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Line Height / Leading */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 block mb-1.5">
                        Line Spacing
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl">
                        {(['compact', 'normal', 'relaxed'] as const).map((lh) => (
                          <button
                            key={lh}
                            type="button"
                            onClick={() => onChangeLineHeight(lh)}
                            className={`py-1.5 text-xs capitalize font-medium rounded-lg transition-colors cursor-pointer text-center ${
                              lineHeight === lh
                                ? 'bg-white dark:bg-zinc-900 shadow-xs text-stone-900 dark:text-zinc-100 font-semibold'
                                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                            }`}
                          >
                            {lh}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reading Theme */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 block mb-1.5">
                        Palette & Theme
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[
                          { key: 'paper', label: 'Warm Paper', bg: 'bg-[#FBF9F5]' },
                          { key: 'white', label: 'Clean White', bg: 'bg-white' },
                          { key: 'sepia', label: 'Sepia Book', bg: 'bg-[#F5EFEB]' },
                          { key: 'night', label: 'Dark Slate', bg: 'bg-zinc-900 text-white' },
                        ].map((th) => (
                          <button
                            key={th.key}
                            type="button"
                            onClick={() => onChangeTheme(th.key as ReadingTheme)}
                            className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer flex items-center justify-between ${
                              theme === th.key
                                ? 'border-stone-900 dark:border-white ring-1 ring-stone-900 dark:ring-white bg-stone-50 dark:bg-zinc-800'
                                : 'border-stone-200 dark:border-zinc-700 hover:border-stone-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900'
                            }`}
                          >
                            <span>{th.label}</span>
                            <span
                              className={`w-3.5 h-3.5 rounded-full border border-stone-300 dark:border-zinc-600 ${th.bg}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Column Width */}
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-zinc-400 block mb-1.5">
                        Column Margin Width
                      </label>
                      <div className="grid grid-cols-3 gap-1 bg-stone-100 dark:bg-zinc-800 p-1 rounded-xl">
                        {(['narrow', 'normal', 'wide'] as const).map((w) => (
                          <button
                            key={w}
                            type="button"
                            onClick={() => onChangeColumnWidth(w)}
                            className={`py-1.5 text-xs capitalize font-medium rounded-lg transition-colors cursor-pointer text-center ${
                              columnWidth === w
                                ? 'bg-white dark:bg-zinc-900 shadow-xs text-stone-900 dark:text-zinc-100 font-semibold'
                                : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-200'
                            }`}
                          >
                            {w}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Highlights count & clear */}
          {userHighlights.length > 0 && (
            <button
              onClick={clearAllHighlights}
              className="px-2 py-1 text-xs text-stone-500 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
              title="Clear all highlights"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear ({userHighlights.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Collapsible In-Text Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`border-b ${borderClass} py-3 overflow-hidden`}
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-stone-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search keywords across paragraphs..."
                  className={`w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border outline-none ${
                    theme === 'night'
                      ? 'bg-zinc-900 border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:border-zinc-500'
                      : 'bg-white border-stone-300 text-stone-900 placeholder-stone-400 focus:border-stone-900'
                  }`}
                />
              </div>
              {searchQuery.trim().length >= 2 && (
                <div className={`text-xs whitespace-nowrap px-2 font-medium ${subtextClass}`}>
                  {searchMatchesCount} {searchMatchesCount === 1 ? 'match' : 'matches'}
                </div>
              )}
              <button
                onClick={() => setIsSearchOpen(false)}
                className={`p-1.5 rounded-lg hover:bg-stone-200/50 cursor-pointer ${subtextClass}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title & Subtitle */}
      <div className={`pt-6 pb-8 border-b ${borderClass}`}>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight leading-tight">
          {passage.title}
        </h1>
        {passage.subtitle && (
          <p className={`mt-2.5 text-sm sm:text-base font-serif italic max-w-3xl leading-relaxed ${subtextClass}`}>
            {passage.subtitle}
          </p>
        )}
      </div>

      {/* Floating Highlight Menu */}
      <AnimatePresence>
        {selectedText && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="fixed z-50 bg-stone-900 text-white rounded-xl shadow-2xl px-2.5 py-1.5 flex items-center gap-2 text-xs border border-stone-800"
            style={{
              left: `${Math.min(
                window.innerWidth - 200,
                Math.max(10, (selectedText.rect?.left || 0) + (selectedText.rect?.width || 0) / 2 - 90)
              )}px`,
              top: `${Math.max(10, (selectedText.rect?.top || 0) - 48)}px`,
            }}
          >
            <span className="text-stone-300 text-[11px] font-medium mr-0.5">Highlight:</span>
            <button
              onClick={() => addHighlight('amber')}
              className="w-5 h-5 rounded-full bg-amber-300 hover:scale-115 transition-transform cursor-pointer shadow-xs"
              title="Amber highlight"
            />
            <button
              onClick={() => addHighlight('emerald')}
              className="w-5 h-5 rounded-full bg-emerald-300 hover:scale-115 transition-transform cursor-pointer shadow-xs"
              title="Emerald highlight"
            />
            <button
              onClick={() => addHighlight('sky')}
              className="w-5 h-5 rounded-full bg-sky-300 hover:scale-115 transition-transform cursor-pointer shadow-xs"
              title="Sky highlight"
            />
            <button
              onClick={() => addHighlight('rose')}
              className="w-5 h-5 rounded-full bg-rose-300 hover:scale-115 transition-transform cursor-pointer shadow-xs"
              title="Rose highlight"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paragraphs body with full typography adjustments */}
      <div className={`space-y-6 pt-6 ${fontFamilyClass} ${fontSizeClass} ${lineHeightClass} ${columnWidthClass}`}>
        {passage.paragraphs.map((para) => {
          const isTargeted = highlightedParagraphId === para.id;
          const isDimmed = focusMode && activeHoveredParagraph && activeHoveredParagraph !== para.id;

          return (
            <div
              key={para.id}
              ref={(el) => {
                paragraphRefs.current[para.id] = el;
              }}
              onMouseEnter={() => focusMode && setActiveHoveredParagraph(para.id)}
              onMouseLeave={() => focusMode && setActiveHoveredParagraph(null)}
              onMouseUp={() => handleMouseUp(para.id)}
              className={`group relative rounded-xl p-3 sm:p-4 transition-all duration-300 ${
                isTargeted
                  ? theme === 'night'
                    ? 'ring-2 ring-amber-400 bg-amber-950/20'
                    : 'ring-2 ring-amber-500 bg-amber-50/60'
                  : ''
              } ${isDimmed ? 'opacity-30 filter blur-[0.2px]' : 'opacity-100'}`}
            >
              {/* Paragraph Label Badge */}
              <div className="flex items-center gap-2 mb-2 select-none">
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold font-sans tracking-tight transition-colors ${
                    isTargeted
                      ? 'bg-amber-600 text-white'
                      : theme === 'night'
                      ? 'bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700'
                      : 'bg-stone-200/80 text-stone-700 group-hover:bg-stone-300'
                  }`}
                >
                  {para.id}
                </span>
                <span className={`text-[11px] font-sans uppercase tracking-wider font-semibold opacity-0 group-hover:opacity-100 transition-opacity ${subtextClass}`}>
                  Paragraph {para.id}
                </span>
              </div>

              {/* Text content */}
              <p className="select-text text-left sm:text-justify hyphens-auto">
                {renderParagraphContent(para.id, para.text)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
