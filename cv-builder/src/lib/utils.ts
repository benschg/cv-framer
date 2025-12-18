import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { MONTHS_FULL } from './date-constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a YYYY-MM date string to human-readable format
 * @param date - Date in YYYY-MM format
 * @returns Formatted date like "January 2024" or empty string if invalid
 */
export function formatMonthYear(date: string | null | undefined): string {
  if (!date) return '';
  const parts = date.split('-');
  if (parts.length < 2) return date;
  const year = parts[0];
  const monthIndex = parseInt(parts[1]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return date;
  return `${MONTHS_FULL[monthIndex]} ${year}`;
}

/**
 * Format a date range for display
 * @param startDate - Start date in YYYY-MM format
 * @param endDate - End date in YYYY-MM format (optional)
 * @param isCurrent - Whether this is a current/ongoing item
 * @returns Formatted range like "January 2020 - Present" or "January 2020 - December 2023"
 */
export function formatDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
  isCurrent?: boolean | null
): string {
  const start = formatMonthYear(startDate);
  if (!start) return '';

  if (isCurrent) {
    return `${start} - Present`;
  }

  const end = formatMonthYear(endDate);
  return end ? `${start} - ${end}` : start;
}
