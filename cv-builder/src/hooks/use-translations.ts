'use client';

import { useMemo } from 'react';
import { getTranslations, t as translate, type Language, type TranslationKeys } from '@/i18n';

export function useTranslations(language: Language) {
  const translations = useMemo(() => getTranslations(language), [language]);

  const t = useMemo(
    () => (path: string) => translate(language, path),
    [language]
  );

  return { translations, t };
}

export type { Language, TranslationKeys };
