import { Passage, Difficulty } from '../types/reading';
import { FALLBACK_PASSAGES } from '../data/fallbackPassages';
import { saveStoredGeneratedPassage } from './storage';

let localFallbackCounter = 0;

export interface GenerateOptions {
  difficulty?: Difficulty;
  topic?: string;
}

export async function requestGeneratePassage(options: GenerateOptions = {}): Promise<Passage> {
  const { difficulty = 'medium', topic = '' } = options;

  try {
    const response = await fetch('/api/generate-passage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        difficulty,
        topic,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data?.passage && data.passage.paragraphs?.length > 0) {
        const passage = data.passage as Passage;
        passage.isGenerated = true;
        saveStoredGeneratedPassage(passage);
        return passage;
      }
    }
  } catch (error) {
    console.warn('API call to /api/generate-passage failed, using dynamic local fallback generator', error);
  }

  // Graceful client fallback rotation
  const matched = FALLBACK_PASSAGES.filter((p) => p.difficulty === difficulty);
  const chosen =
    matched.length > 0
      ? matched[localFallbackCounter % matched.length]
      : FALLBACK_PASSAGES[localFallbackCounter % FALLBACK_PASSAGES.length];
  localFallbackCounter++;

  const clone: Passage = JSON.parse(JSON.stringify(chosen));
  clone.id = `gen-${Date.now()}`;
  clone.isGenerated = true;
  saveStoredGeneratedPassage(clone);
  return clone;
}
