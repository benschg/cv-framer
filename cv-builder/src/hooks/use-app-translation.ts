import { useTranslations } from './use-translations';
import { useUserPreferences } from '@/contexts/user-preferences-context';

/**
 * Hook that provides translation function with user's language preference.
 * Automatically uses the language from user preferences context.
 *
 * @returns {Object} Object containing the translation function
 * @returns {Function} t - Translation function that accepts a key and returns the translated string
 *
 * @example
 * const { t } = useAppTranslation();
 * return <h1>{t('profile.title')}</h1>;
 */
export function useAppTranslation() {
  const { language } = useUserPreferences();
  const { t } = useTranslations(language);

  return { t };
}
