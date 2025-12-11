import en from './en.json';
import de from './de.json';

export type Language = 'en' | 'de';

export type TranslationKeys = typeof en;

const translations: Record<Language, TranslationKeys> = {
  en,
  de,
};

export function getTranslations(language: Language): TranslationKeys {
  return translations[language];
}

// Helper to get nested translation value by dot notation path
export function t(language: Language, path: string): string {
  const keys = path.split('.');
  let value: unknown = translations[language];

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      // Fallback to English if key not found
      value = translations.en;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          return path; // Return path if translation not found
        }
      }
      break;
    }
  }

  return typeof value === 'string' ? value : path;
}

export { en, de };
