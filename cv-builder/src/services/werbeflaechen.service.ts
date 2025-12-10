import type {
  WerbeflaechenEntry,
  WerbeflaechenCategory,
  CreateWerbeflaechenInput,
  UpdateWerbeflaechenInput,
  Language,
} from '@/types/api.schemas';

const API_BASE = '/api/werbeflaechen';

export interface WerbeflaechenServiceResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Fetch all werbeflaechen entries for the current user
 */
export async function fetchAllEntries(
  language?: Language
): Promise<WerbeflaechenServiceResponse<WerbeflaechenEntry[]>> {
  try {
    const params = new URLSearchParams();
    if (language) params.set('language', language);

    const url = `${API_BASE}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
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
  categoryKey: WerbeflaechenCategory,
  language?: Language
): Promise<WerbeflaechenServiceResponse<WerbeflaechenEntry | null>> {
  try {
    const params = new URLSearchParams();
    if (language) params.set('language', language);

    const url = `${API_BASE}/${categoryKey}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);
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
  categoryKey: WerbeflaechenCategory,
  data: UpdateWerbeflaechenInput
): Promise<WerbeflaechenServiceResponse<WerbeflaechenEntry>> {
  try {
    const response = await fetch(`${API_BASE}/${categoryKey}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
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
 * Create a new werbeflaechen entry
 */
export async function createEntry(
  data: CreateWerbeflaechenInput
): Promise<WerbeflaechenServiceResponse<WerbeflaechenEntry>> {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok) {
      return { data: null, error: json.error || 'Failed to create entry' };
    }

    return { data: json.entry, error: null };
  } catch (error) {
    console.error('createEntry error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Delete a category entry
 */
export async function deleteCategoryEntry(
  categoryKey: WerbeflaechenCategory,
  language?: Language
): Promise<WerbeflaechenServiceResponse<boolean>> {
  try {
    const params = new URLSearchParams();
    if (language) params.set('language', language);

    const url = `${API_BASE}/${categoryKey}${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
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
  categoryKey: WerbeflaechenCategory
): WerbeflaechenEntry | undefined {
  return entries.find((e) => e.category_key === categoryKey);
}
