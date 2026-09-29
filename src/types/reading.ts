export type Difficulty = 'easy' | 'medium' | 'hard';
export type QuestionMode = 'both' | 'tfng' | 'fill_blank';
export type TFNGAnswer = 'TRUE' | 'FALSE' | 'NOT GIVEN';
export type FontFamily = 'serif' | 'sans' | 'mono' | 'humanist';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type LineHeight = 'compact' | 'normal' | 'relaxed';
export type ReadingTheme = 'paper' | 'white' | 'sepia' | 'night';
export type ColumnWidth = 'narrow' | 'normal' | 'wide';

export interface Paragraph {
  id: string; // e.g., 'A', 'B', 'C'
  text: string;
}

export interface TFNGQuestion {
  id: number;
  statement: string;
  correctAnswer: TFNGAnswer;
  paragraphRef: string; // e.g. 'A', 'B'
  explanation: string;
  sourceQuote: string;
}

export interface FillBlankQuestion {
  id: number;
  prefix: string;
  suffix: string;
  acceptableAnswers: string[]; // Lowercase normalized
  displayAnswer: string;
  paragraphRef: string;
  explanation: string;
  sourceQuote: string;
  maxWords?: number;
}

export interface Passage {
  id: string;
  title: string;
  subtitle?: string;
  difficulty: Difficulty;
  category: string;
  wordCount: number;
  estimatedReadTime: string;
  paragraphs: Paragraph[];
  tfngQuestions: TFNGQuestion[];
  fillBlankQuestions: FillBlankQuestion[];
  blanksInstruction?: string;
  isGenerated?: boolean;
}

export interface SessionConfig {
  passageId: string;
  difficulty: Difficulty;
  questionMode: QuestionMode;
  immediateFeedback: boolean;
  timerMinutes: number; // 0 = untimed
}

export interface SessionRecord {
  id: string;
  passageId?: string;
  date: string;
  passageTitle: string;
  difficulty: Difficulty;
  questionMode: QuestionMode;
  totalQuestions: number;
  correctCount: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  status?: 'completed' | 'viewed';
}

export interface HighlightRange {
  id: string;
  color: 'amber' | 'emerald' | 'sky';
  text: string;
  paragraphId: string;
}
