import { SessionRecord, Passage, FontFamily, FontSize, LineHeight, ReadingTheme, ColumnWidth } from '../types/reading';

const STORAGE_KEYS = {
  HISTORY: 'readflow_reading_history',
  CUSTOM_PASSAGES: 'readflow_custom_passages',
  GENERATED_PASSAGES: 'readflow_generated_passages',
  SETTINGS: 'readflow_user_settings',
  LEGACY_HISTORY: 'lexis_reading_history',
  LEGACY_CUSTOM_PASSAGES: 'lexis_custom_passages',
  LEGACY_GENERATED_PASSAGES: 'lexis_generated_passages',
  LEGACY_SETTINGS: 'lexis_user_settings',
};

export interface UserSettings {
  defaultTimerMinutes: number;
  immediateFeedback: boolean;
  fontFamily: FontFamily;
  fontSize: FontSize;
  lineHeight: LineHeight;
  readingTheme: ReadingTheme;
  columnWidth: ColumnWidth;
  focusMode: boolean;
}

export const DEFAULT_SETTINGS: UserSettings = {
  defaultTimerMinutes: 15,
  immediateFeedback: true,
  fontFamily: 'serif',
  fontSize: 'base',
  lineHeight: 'normal',
  readingTheme: 'paper',
  columnWidth: 'normal',
  focusMode: false,
};

/**
 * Checks whether two records or passages refer to the exact same passage.
 * Matches by identical passageId or identical passageTitle (case-insensitive, trimmed).
 */
export function isSamePassage(
  a: { passageId?: string; passageTitle?: string },
  b: { passageId?: string; passageTitle?: string }
): boolean {
  if (a.passageId && b.passageId && a.passageId === b.passageId) {
    return true;
  }
  const titleA = (a.passageTitle || '').trim().toLowerCase();
  const titleB = (b.passageTitle || '').trim().toLowerCase();
  if (titleA && titleB && titleA === titleB) {
    return true;
  }
  return false;
}

/**
 * Strictly deduplicates history so that ONE passage is never placed twice in session history.
 * If multiple records exist for the same passage, retains the latest completed one or latest entry.
 */
export function deduplicateHistory(records: SessionRecord[]): SessionRecord[] {
  const uniqueList: SessionRecord[] = [];
  for (const item of records) {
    const existingIndex = uniqueList.findIndex((existing) => isSamePassage(existing, item));
    if (existingIndex === -1) {
      uniqueList.push(item);
    } else {
      const existing = uniqueList[existingIndex];
      const isItemCompleted = item.status === 'completed' || (item.scorePercentage !== undefined && item.scorePercentage > 0);
      const isExistingCompleted = existing.status === 'completed' || (existing.scorePercentage !== undefined && existing.scorePercentage > 0);
      // Prefer completed record over viewed record; otherwise keep the newer entry
      if (isItemCompleted && !isExistingCompleted) {
        uniqueList[existingIndex] = item;
      }
    }
  }
  return uniqueList;
}

export function getStoredHistory(): SessionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY) || localStorage.getItem(STORAGE_KEYS.LEGACY_HISTORY);
    if (!raw) return [];
    const list: SessionRecord[] = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    return deduplicateHistory(list);
  } catch {
    return [];
  }
}

// Ensures a passage is never placed twice on session history
export function saveSessionRecord(record: SessionRecord): void {
  try {
    const existing = getStoredHistory();
    // Filter out previous entries with matching passageTitle or passageId
    const filtered = existing.filter((r) => !isSamePassage(r, record));
    const updated = deduplicateHistory([record, ...filtered]).slice(0, 50);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save session history', e);
  }
}

// Adds passage to history only when clicked or selected by the user
export function recordPassageVisit(passage: Passage): void {
  try {
    const existing = getStoredHistory();
    const existingRecord = existing.find((r) =>
      isSamePassage(r, { passageId: passage.id, passageTitle: passage.title })
    );

    const todayDate = new Date().toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    // If an existing record exists, keep previous completed score data but refresh date & move to front
    const updatedRecord: SessionRecord = existingRecord
      ? {
          ...existingRecord,
          passageId: passage.id,
          passageTitle: passage.title,
          difficulty: passage.difficulty,
          date: todayDate,
        }
      : {
          id: `record-${Date.now()}`,
          passageId: passage.id,
          date: todayDate,
          passageTitle: passage.title,
          difficulty: passage.difficulty,
          questionMode: 'both',
          totalQuestions: passage.tfngQuestions.length + passage.fillBlankQuestions.length,
          correctCount: 0,
          scorePercentage: 0,
          timeSpentSeconds: 0,
          status: 'viewed',
        };

    saveSessionRecord(updatedRecord);
  } catch (e) {
    console.error('Failed to record passage visit', e);
  }
}

export function clearStoredHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (e) {
    console.error('Failed to clear session history', e);
  }
}

export function deleteSessionRecord(recordId: string): void {
  try {
    const existing = getStoredHistory();
    const updated = existing.filter((r) => r.id !== recordId);
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete session record', e);
  }
}

export function getStoredGeneratedPassages(): Passage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GENERATED_PASSAGES) || localStorage.getItem(STORAGE_KEYS.LEGACY_GENERATED_PASSAGES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredGeneratedPassage(passage: Passage): void {
  try {
    const existing = getStoredGeneratedPassages();
    const updated = [passage, ...existing.filter((p) => p.id !== passage.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEYS.GENERATED_PASSAGES, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save generated passage', e);
  }
}

export function getCustomPassages(): Passage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_PASSAGES) || localStorage.getItem(STORAGE_KEYS.LEGACY_CUSTOM_PASSAGES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomPassage(passage: Passage): void {
  try {
    const existing = getCustomPassages();
    const updated = [passage, ...existing.filter((p) => p.id !== passage.id)];
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PASSAGES, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save custom passage', e);
  }
}

export function deleteCustomPassage(passageId: string): void {
  try {
    const existing = getCustomPassages();
    const updated = existing.filter((p) => p.id !== passageId);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PASSAGES, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete custom passage', e);
  }
}

export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS) || localStorage.getItem(STORAGE_KEYS.LEGACY_SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}
