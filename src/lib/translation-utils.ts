import type { Language } from '@/types';

/**
 * Safely access translation object with fallback to English
 */
export function getTranslation<T>(
  translations: Partial<Record<Language, T>>,
  language: Language
): T {
  return translations[language] || translations.en || translations.hi || translations.ml || Object.values(translations)[0] as T;
}

/**
 * Get translated text with fallback
 */
export function getTranslatedText(
  textObj: Partial<Record<Language, string>>,
  language: Language
): string {
  return textObj[language] || textObj.en || textObj.hi || textObj.ml || Object.values(textObj)[0] || 'Translation not available';
}

/**
 * Get translated array with fallback
 */
export function getTranslatedArray(
  arrayObj: Partial<Record<Language, string[]>>,
  language: Language
): string[] {
  return arrayObj[language] || arrayObj.en || arrayObj.hi || arrayObj.ml || Object.values(arrayObj)[0] || [];
}