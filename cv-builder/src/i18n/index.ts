import commonEn from './en/common.json';
import authEn from './en/auth.json';
import navEn from './en/nav.json';
import profileEn from './en/profile.json';
import applicationsEn from './en/applications.json';
import cvEn from './en/cv.json';
import coverLetterEn from './en/coverLetter.json';
import werbeflaechenEn from './en/werbeflaechen.json';
import settingsEn from './en/settings.json';
import errorsEn from './en/errors.json';
import guidesEn from './en/guides.json';

import commonDe from './de/common.json';
import authDe from './de/auth.json';
import navDe from './de/nav.json';
import profileDe from './de/profile.json';
import applicationsDe from './de/applications.json';
import cvDe from './de/cv.json';
import coverLetterDe from './de/coverLetter.json';
import werbeflaechenDe from './de/werbeflaechen.json';
import settingsDe from './de/settings.json';
import errorsDe from './de/errors.json';
import guidesDe from './de/guides.json';

const en = {
  common: commonEn,
  auth: authEn,
  nav: navEn,
  profile: profileEn,
  applications: applicationsEn,
  cv: cvEn,
  coverLetter: coverLetterEn,
  werbeflaechen: werbeflaechenEn,
  settings: settingsEn,
  errors: errorsEn,
  guides: guidesEn,
};

const de = {
  common: commonDe,
  auth: authDe,
  nav: navDe,
  profile: profileDe,
  applications: applicationsDe,
  cv: cvDe,
  coverLetter: coverLetterDe,
  werbeflaechen: werbeflaechenDe,
  settings: settingsDe,
  errors: errorsDe,
  guides: guidesDe,
};

export type Language = 'en' | 'de' | 'dev';

export type TranslationKeys = typeof en;

const translations: Record<'en' | 'de', TranslationKeys> = {
  en,
  de,
};

// Import pseudo-localization utility
import { pseudoLocalizeToKannada, isPseudoLocaleAvailable } from './utils/pseudo-localize';

// Cache for generated Kannada translations (lazy-initialized)
let kannadaCache: TranslationKeys | null = null;

export function getTranslations(language: Language): TranslationKeys {
  // Handle 'dev' pseudo-locale
  if (language === 'dev') {
    if (!isPseudoLocaleAvailable()) {
      console.warn('Pseudo-locale "dev" is only available in development mode. Falling back to English.');
      return translations.en;
    }

    // Lazy initialization: generate once and cache
    if (!kannadaCache) {
      kannadaCache = pseudoLocalizeToKannada(translations.en) as TranslationKeys;
    }
    return kannadaCache;
  }

  return translations[language];
}

// Helper to get nested translation value by dot notation path
export function t(language: Language, path: string): string {
  const keys = path.split('.');
  let value: unknown;

  // Get translations for the requested language (including 'dev')
  if (language === 'dev') {
    value = getTranslations('dev');
  } else {
    value = translations[language];
  }

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
