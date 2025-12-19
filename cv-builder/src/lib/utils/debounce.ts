/**
 * Debounce utility with key-based timer management.
 * Useful for auto-save functionality where multiple fields may be saving independently.
 */

const debounceTimers = new Map<string, NodeJS.Timeout>();

/**
 * Creates a debounced version of a function that delays execution until
 * after `delay` milliseconds have elapsed since the last call.
 *
 * @param key - Unique identifier for this debounce timer (allows multiple independent debounces)
 * @param fn - The function to debounce
 * @param delay - The delay in milliseconds (default: 1000)
 * @returns A debounced version of the function
 *
 * @example
 * ```ts
 * const debouncedSave = debounce('save-profile', () => saveProfile(data), 500);
 * debouncedSave(); // Will execute after 500ms of no calls
 * ```
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  key: string,
  fn: T,
  delay: number = 1000
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    const existingTimer = debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      fn(...args);
      debounceTimers.delete(key);
    }, delay);

    debounceTimers.set(key, timer);
  };
}

/**
 * Cancel a pending debounced operation by key.
 *
 * @param key - The unique identifier used when creating the debounce
 */
export function cancelDebounce(key: string): void {
  const timer = debounceTimers.get(key);
  if (timer) {
    clearTimeout(timer);
    debounceTimers.delete(key);
  }
}

/**
 * Check if a debounce timer is pending for a given key.
 *
 * @param key - The unique identifier to check
 * @returns true if a timer is pending, false otherwise
 */
export function hasPendingDebounce(key: string): boolean {
  return debounceTimers.has(key);
}
