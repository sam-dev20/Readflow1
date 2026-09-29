import { TFNGAnswer } from '../types/reading';

/**
 * Normalizes user text for flexible fill-in-the-blank grading
 * Strips extraneous leading/trailing whitespace, punctuation, and converts to lowercase.
 */
export function normalizeAnswer(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/^[ "'`]+|[ "'`?!.,;:]+$/g, '')
    .replace(/\s+/g, ' ');
}

export function isFillBlankCorrect(userAnswer: string, acceptableAnswers: string[]): boolean {
  if (!userAnswer || !userAnswer.trim()) return false;
  const normalizedUser = normalizeAnswer(userAnswer);
  return acceptableAnswers.some((ans) => {
    const normalizedTarget = normalizeAnswer(ans);
    return normalizedUser === normalizedTarget;
  });
}

/**
 * Returns a detailed explanation of WHY the user's T/F/NG answer is incorrect,
 * contrasting the user's selection with IELTS academic rules and passage evidence.
 */
export function getTfngWhyWrongExplanation(
  userAnswer: TFNGAnswer | undefined,
  correctAnswer: TFNGAnswer,
  paragraphRef: string,
  baseExplanation: string,
  sourceQuote?: string
): string {
  if (!userAnswer) {
    const quotePart = sourceQuote ? ` (Quote: "${sourceQuote}")` : '';
    return `You left this question unanswered. The correct answer is ${correctAnswer}. Paragraph ${paragraphRef} proves this${quotePart}. ${baseExplanation}`;
  }

  if (userAnswer === correctAnswer) {
    return `Your answer (${userAnswer}) is correct! ${baseExplanation}`;
  }

  if (userAnswer === 'TRUE' && correctAnswer === 'FALSE') {
    const quotePart = sourceQuote ? ` In Paragraph ${paragraphRef}, the author states: "${sourceQuote}".` : '';
    return `You chose TRUE, which means the text agrees with the statement. However, the passage contradicts this statement.${quotePart} Because the text explicitly contradicts the statement, the correct answer is FALSE.`;
  }

  if (userAnswer === 'FALSE' && correctAnswer === 'TRUE') {
    const quotePart = sourceQuote ? ` Paragraph ${paragraphRef} explicitly confirms: "${sourceQuote}".` : '';
    return `You chose FALSE, which requires the passage to contradict the statement. However, the text directly supports and agrees with the statement.${quotePart} Because the passage agrees with the statement, the correct answer is TRUE.`;
  }

  if ((userAnswer === 'TRUE' || userAnswer === 'FALSE') && correctAnswer === 'NOT GIVEN') {
    return `You selected ${userAnswer}, but the passage never provides enough factual evidence to confirm or deny this specific claim. In IELTS academic reading, you must not assume or extrapolate facts absent from the text. Because there is no information to say whether it is true or false, the correct answer is NOT GIVEN.`;
  }

  if (userAnswer === 'NOT GIVEN' && correctAnswer === 'TRUE') {
    const quotePart = sourceQuote ? ` Paragraph ${paragraphRef} clearly states: "${sourceQuote}".` : '';
    return `You selected NOT GIVEN (assuming the text made no mention). However, the topic is directly addressed in the passage.${quotePart} Because the text confirms this fact, it is verifiable as TRUE.`;
  }

  if (userAnswer === 'NOT GIVEN' && correctAnswer === 'FALSE') {
    const quotePart = sourceQuote ? ` Paragraph ${paragraphRef} states: "${sourceQuote}".` : '';
    return `You selected NOT GIVEN (assuming the text made no mention). However, the passage directly addresses and contradicts this claim.${quotePart} Because the text contradicts the statement, it is verifiable as FALSE.`;
  }

  return `Your answer was ${userAnswer}, but the correct answer is ${correctAnswer}. ${baseExplanation}`;
}

/**
 * Returns a detailed explanation of WHY the user's Fill-in-the-Blank answer is incorrect.
 */
export function getFillBlankWhyWrongExplanation(
  userAnswer: string,
  displayAnswer: string,
  paragraphRef: string,
  baseExplanation: string,
  sourceQuote?: string
): string {
  const trimmed = (userAnswer || '').trim();
  const quotePart = sourceQuote ? ` Paragraph ${paragraphRef} states: "${sourceQuote}".` : '';
  if (!trimmed) {
    return `You left this blank empty. The exact phrase required from Paragraph ${paragraphRef} is "${displayAnswer}".${quotePart} ${baseExplanation}`;
  }

  return `You answered "${trimmed}". However, the academic passage specifically requires "${displayAnswer}".${quotePart} In academic reading exams, completion questions must use exact words or terminology from the text. ${baseExplanation}`;
}
