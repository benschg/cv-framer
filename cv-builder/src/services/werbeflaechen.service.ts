import type { WerbeflaechenEntry, CategoryKey, WerbeflaechenContent } from '@/types/werbeflaechen.types';

const API_BASE = '/api/werbeflaechen';

export interface WerbeflaechenServiceResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetch all werbeflaechen entries for the current user
 */
export async function fetchAllEntries(
  language: 'en' | 'de' = 'en'
): Promise<WerbeflaechenServiceResponse<WerbeflaechenEntry[]>> {
  try {
    const response = await fetch(`${API_BASE}?language=${language}`);
    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to fetch entries' };
    }

    return { data: json.entries, error: null };
  } catch (error) {
    console.error('fetchAllEntries error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Fetch a specific category entry
 */
export async function fetchCategoryEntry(
  categoryKey: CategoryKey,
  language: 'en' | 'de' = 'en'
): Promise<WerbeflaechenServiceResponse<WerbeflaechenEntry | null>> {
  try {
    const response = await fetch(`${API_BASE}/${categoryKey}?language=${language}`);
    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to fetch entry' };
    }

    return { data: json.entry, error: null };
  } catch (error) {
    console.error('fetchCategoryEntry error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Save a category entry (creates or updates)
 */
export async function saveCategoryEntry(
  categoryKey: CategoryKey,
  content: WerbeflaechenContent,
  options: {
    language?: 'en' | 'de';
    isComplete?: boolean;
    rowNumber?: 1 | 2 | 3;
  } = {}
): Promise<WerbeflaechenServiceResponse<WerbeflaechenEntry>> {
  const { language = 'en', isComplete, rowNumber } = options;

  try {
    const response = await fetch(`${API_BASE}/${categoryKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        content,
        is_complete: isComplete,
        row_number: rowNumber,
      }),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to save entry' };
    }

    return { data: json.entry, error: null };
  } catch (error) {
    console.error('saveCategoryEntry error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Delete a category entry
 */
export async function deleteCategoryEntry(
  categoryKey: CategoryKey,
  language: 'en' | 'de' = 'en'
): Promise<WerbeflaechenServiceResponse<boolean>> {
  try {
    const response = await fetch(`${API_BASE}/${categoryKey}?language=${language}`, {
      method: 'DELETE',
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: false, error: json.error || 'Failed to delete entry' };
    }

    return { data: true, error: null };
  } catch (error) {
    console.error('deleteCategoryEntry error:', error);
    return { data: false, error: 'Network error' };
  }
}

/**
 * Calculate completion statistics for werbeflaechen entries
 */
export function calculateCompletionStats(entries: WerbeflaechenEntry[], totalCategories: number) {
  const completedCount = entries.filter((e) => e.is_complete).length;
  const inProgressCount = entries.filter((e) => !e.is_complete && Object.keys(e.content || {}).length > 0).length;
  const completionPercentage = totalCategories > 0 ? Math.round((completedCount / totalCategories) * 100) : 0;

  return {
    completed: completedCount,
    inProgress: inProgressCount,
    total: totalCategories,
    percentage: completionPercentage,
  };
}

/**
 * Get entry by category key from an array of entries
 */
export function getEntryByCategory(
  entries: WerbeflaechenEntry[],
  categoryKey: CategoryKey
): WerbeflaechenEntry | undefined {
  return entries.find((e) => e.category_key === categoryKey);
}
