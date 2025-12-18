import { useState } from 'react';

/**
 * Hook to manage app language preference with localStorage persistence
 * Initializes from localStorage on mount, no useEffect needed
 */
export function useAppLanguage() {
  const [language, setLanguage] = useState<'en' | 'de'>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem('app-language');
    return saved === 'en' || saved === 'de' ? saved : 'en';
  });

  const changeLanguage = (newLanguage: 'en' | 'de') => {
    setLanguage(newLanguage);
    localStorage.setItem('app-language', newLanguage);
  };

  return { language, setLanguage: changeLanguage };
}
