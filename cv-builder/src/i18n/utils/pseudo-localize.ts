/**
 * Kannada Pseudo-Localization Utility
 * Converts English text to Kannada script for visual testing of i18n
 *
 * This utility helps identify:
 * - Untranslated strings (appear in English)
 * - Hardcoded text that bypassed i18n
 * - Layout issues with non-Latin scripts
 * - Encoding/font problems
 */

// Character mapping: English -> Kannada (simple 1:1 substitution for visual distinctiveness)
const KANNADA_MAP: Record<string, string> = {
  // Lowercase letters
  a: 'ಅ',
  b: 'ಬ',
  c: 'ಚ',
  d: 'ದ',
  e: 'ಎ',
  f: 'ಫ',
  g: 'ಗ',
  h: 'ಹ',
  i: 'ಇ',
  j: 'ಜ',
  k: 'ಕ',
  l: 'ಲ',
  m: 'ಮ',
  n: 'ನ',
  o: 'ಒ',
  p: 'ಪ',
  q: 'ಕ್',
  r: 'ರ',
  s: 'ಸ',
  t: 'ತ',
  u: 'ಉ',
  v: 'ವ',
  w: 'ವ್',
  x: 'ಕ್ಸ',
  y: 'ಯ',
  z: 'ಜ಼',

  // Uppercase letters
  A: 'ಆ',
  B: 'ಭ',
  C: 'ಛ',
  D: 'ಧ',
  E: 'ಏ',
  F: 'ಫ಼',
  G: 'ಘ',
  H: 'ಹ಼',
  I: 'ಈ',
  J: 'ಝ',
  K: 'ಖ',
  L: 'ಳ',
  M: 'ಮ಼',
  N: 'ಣ',
  O: 'ಓ',
  P: 'ಪ಼',
  Q: 'ಕ್ವ',
  R: 'ಱ',
  S: 'ಶ',
  T: 'ಥ',
  U: 'ಊ',
  V: 'ವ಼',
  W: 'ವ್ಯ',
  X: 'ಕ್ಷ',
  Y: 'ಯ಼',
  Z: 'ಝ಼',

  // Numbers and common punctuation remain unchanged for readability
  // This makes it easier to identify values and understand context
};

/**
 * Convert a single string to Kannada pseudo-locale
 *
 * @param text - The English text to convert
 * @returns The text with Latin characters replaced by Kannada characters
 *
 * @example
 * toKannada("Hello World") // "ಹಎಲಲಒ ವಒರಲದ"
 * toKannada("Email: user@example.com") // "ಎಮಅಇಲ: ಉಸಎರ@ಎಕಸಅಮಪಲಎ.ಚಒಮ"
 */
export function toKannada(text: string): string {
  return text
    .split('')
    .map((char) => KANNADA_MAP[char] || char)
    .join('');
}

/**
 * Recursively transform translation object to Kannada
 *
 * Walks through nested objects and arrays, converting all string values
 * to Kannada script while preserving the structure.
 *
 * @param obj - Translation object, string, or primitive value
 * @returns Transformed value with strings converted to Kannada
 *
 * @example
 * const input = { auth: { login: "Login", email: "Email" } };
 * pseudoLocalizeToKannada(input);
 * // { auth: { login: "ಲಒಗಇನ", email: "ಎಮಅಇಲ" } }
 */
export function pseudoLocalizeToKannada(obj: unknown): unknown {
  // Base case: convert string
  if (typeof obj === 'string') {
    return toKannada(obj);
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => pseudoLocalizeToKannada(item));
  }

  // Handle objects (nested translations)
  if (obj && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = pseudoLocalizeToKannada(value);
    }
    return result;
  }

  // Return other primitives as-is (numbers, booleans, null, undefined)
  return obj;
}

/**
 * Check if pseudo-locale is available (dev mode only)
 *
 * @returns true if running in development mode, false otherwise
 */
export function isPseudoLocaleAvailable(): boolean {
  return process.env.NODE_ENV === 'development';
}
