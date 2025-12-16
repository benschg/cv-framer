'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './auth-context';
import type { Language } from '@/i18n';

interface UserPreferences {
  language: Language;
  theme: 'light' | 'dark' | 'system';
}

interface UserPreferencesContextType extends UserPreferences {
  setLanguage: (language: Language) => Promise<{ error: string | null }>;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  loading: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    language: 'en',
    theme: 'system',
  });
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  // Load user preferences from database
  useEffect(() => {
    const loadPreferences = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('preferred_language')
        .eq('user_id', user.id)
        .single();

      if (data && !error) {
        setPreferences(prev => ({
          ...prev,
          language: (data.preferred_language || 'en') as Language,
        }));
      }

      // Load theme from localStorage
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
      if (savedTheme) {
        setPreferences(prev => ({
          ...prev,
          theme: savedTheme,
        }));
      }

      setLoading(false);
    };

    loadPreferences();
  }, [user, supabase]);

  // Save language preference to database
  const setLanguage = useCallback(async (language: Language) => {
    if (!user) {
      return { error: 'User not authenticated' };
    }

    setPreferences(prev => ({ ...prev, language }));

    const { error } = await supabase
      .from('user_profiles')
      .update({ preferred_language: language })
      .eq('user_id', user.id);

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  }, [user, supabase]);

  // Save theme preference to localStorage (theme is client-side only)
  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setPreferences(prev => ({ ...prev, theme }));
    localStorage.setItem('theme', theme);

    // Apply theme to document
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, []);

  return (
    <UserPreferencesContext.Provider value={{
      ...preferences,
      setLanguage,
      setTheme,
      loading,
    }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences(): UserPreferencesContextType {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}