import commonEn from './en/common.json';
import authEn from './en/auth.json';
import navEn from './en/nav.json';
import profileEn from './en/profile.json';
import applicationsEn from './en/applications.json';
import cvEn from './en/cv.json';
import coverLetterEn from './en/coverLetter.json';
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
  settings: settingsDe,
  errors: errorsDe,
  guides: guidesDe,
};

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
