'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WerbeflaechenEntry, CategoryKey, WerbeflaechenContent } from '@/types/werbeflaechen.types';
import {
  fetchAllEntries,
  fetchCategoryEntry,
  saveCategoryEntry,
  calculateCompletionStats,
  getEntryByCategory,
} from '@/services/werbeflaechen.service';

interface UseWerbeflaechenOptions {
  language?: 'en' | 'de';
  autoFetch?: boolean;
}

interface UseWerbeflaechenReturn {
  entries: WerbeflaechenEntry[];
  loading: boolean;
  error: string | null;
  stats: {
    completed: number;
    inProgress: number;
    total: number;
    percentage: number;
  };
  refresh: () => Promise<void>;
  getEntry: (categoryKey: CategoryKey) => WerbeflaechenEntry | undefined;
  saveEntry: (
    categoryKey: CategoryKey,
    content: WerbeflaechenContent,
    isComplete?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
}

export function useWerbeflaechen(
  totalCategories: number,
  options: UseWerbeflaechenOptions = {}
): UseWerbeflaechenReturn {
  const { language = 'en', autoFetch = true } = options;

  const [entries, setEntries] = useState<WerbeflaechenEntry[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchAllEntries(language);

    if (result.error) {
      setError(result.error);
    } else {
      setEntries(result.data || []);
    }

    setLoading(false);
  }, [language]);

  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  const getEntry = useCallback(
    (categoryKey: CategoryKey) => getEntryByCategory(entries, categoryKey),
    [entries]
  );

  const saveEntry = useCallback(
    async (
      categoryKey: CategoryKey,
      content: WerbeflaechenContent,
      isComplete?: boolean
    ) => {
      const result = await saveCategoryEntry(categoryKey, content, {
        language,
        isComplete,
      });

      if (result.error) {
        return { success: false, error: result.error };
      }

      // Update local state
      if (result.data) {
        setEntries((prev) => {
          const existing = prev.findIndex((e) => e.category_key === categoryKey);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = result.data!;
            return updated;
          }
          return [...prev, result.data!];
        });
      }

      return { success: true };
    },
    [language]
  );

  const stats = calculateCompletionStats(entries, totalCategories);

  return {
    entries,
    loading,
    error,
    stats,
    refresh,
    getEntry,
    saveEntry,
  };
}

// Hook for a single category
interface UseCategoryEntryOptions {
  language?: 'en' | 'de';
  autoFetch?: boolean;
}

interface UseCategoryEntryReturn {
  entry: WerbeflaechenEntry | null;
  loading: boolean;
  error: string | null;
  save: (content: WerbeflaechenContent, isComplete?: boolean) => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

export function useCategoryEntry(
  categoryKey: CategoryKey,
  options: UseCategoryEntryOptions = {}
): UseCategoryEntryReturn {
  const { language = 'en', autoFetch = true } = options;

  const [entry, setEntry] = useState<WerbeflaechenEntry | null>(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await fetchCategoryEntry(categoryKey, language);

    if (result.error) {
      setError(result.error);
    } else {
      setEntry(result.data);
    }

    setLoading(false);
  }, [categoryKey, language]);

  useEffect(() => {
    if (autoFetch) {
      refresh();
    }
  }, [autoFetch, refresh]);

  const save = useCallback(
    async (content: WerbeflaechenContent, isComplete?: boolean) => {
      const result = await saveCategoryEntry(categoryKey, content, {
        language,
        isComplete,
      });

      if (result.error) {
        return { success: false, error: result.error };
      }

      if (result.data) {
        setEntry(result.data);
      }

      return { success: true };
    },
    [categoryKey, language]
  );

  return {
    entry,
    loading,
    error,
    save,
    refresh,
  };
}
