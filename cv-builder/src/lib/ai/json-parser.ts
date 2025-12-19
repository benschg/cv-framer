/**
 * Utility functions for parsing JSON responses from AI models.
 * AI models often wrap JSON in markdown code blocks which need to be cleaned.
 */

/**
 * Clean a text response by removing markdown code block wrappers.
 * Handles ```json, ```, and trailing ``` markers.
 */
export function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();

  // Remove opening code block markers
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  // Remove closing code block marker
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}

/**
 * Parse a JSON response from an AI model, cleaning markdown wrappers first.
 * @param text The raw text response from the AI model
 * @returns Parsed JSON of type T
 * @throws SyntaxError if the cleaned text is not valid JSON
 */
export function parseJsonResponse<T>(text: string): T {
  const cleanedText = cleanJsonResponse(text);
  return JSON.parse(cleanedText) as T;
}
