import { describe, expect, it } from 'vitest';

import { cn, formatDateRange, formatMonthYear } from './utils';

describe('cn', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('should handle objects', () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe('foo baz');
  });

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('should return empty string for no arguments', () => {
    expect(cn()).toBe('');
  });
});

describe('formatMonthYear', () => {
  it('should format valid YYYY-MM date', () => {
    expect(formatMonthYear('2024-01')).toBe('January 2024');
    expect(formatMonthYear('2023-12')).toBe('December 2023');
    expect(formatMonthYear('2020-06')).toBe('June 2020');
  });

  it('should handle all months correctly', () => {
    expect(formatMonthYear('2024-01')).toBe('January 2024');
    expect(formatMonthYear('2024-02')).toBe('February 2024');
    expect(formatMonthYear('2024-03')).toBe('March 2024');
    expect(formatMonthYear('2024-04')).toBe('April 2024');
    expect(formatMonthYear('2024-05')).toBe('May 2024');
    expect(formatMonthYear('2024-06')).toBe('June 2024');
    expect(formatMonthYear('2024-07')).toBe('July 2024');
    expect(formatMonthYear('2024-08')).toBe('August 2024');
    expect(formatMonthYear('2024-09')).toBe('September 2024');
    expect(formatMonthYear('2024-10')).toBe('October 2024');
    expect(formatMonthYear('2024-11')).toBe('November 2024');
    expect(formatMonthYear('2024-12')).toBe('December 2024');
  });

  it('should return empty string for null', () => {
    expect(formatMonthYear(null)).toBe('');
  });

  it('should return empty string for undefined', () => {
    expect(formatMonthYear(undefined)).toBe('');
  });

  it('should return empty string for empty string', () => {
    expect(formatMonthYear('')).toBe('');
  });

  it('should return original string for invalid format', () => {
    expect(formatMonthYear('2024')).toBe('2024');
    expect(formatMonthYear('invalid')).toBe('invalid');
  });

  it('should return original string for invalid month', () => {
    expect(formatMonthYear('2024-00')).toBe('2024-00');
    expect(formatMonthYear('2024-13')).toBe('2024-13');
    expect(formatMonthYear('2024-99')).toBe('2024-99');
  });

  it('should handle full date format (YYYY-MM-DD)', () => {
    // The function should still work since it splits and takes first two parts
    expect(formatMonthYear('2024-06-15')).toBe('June 2024');
  });
});

describe('formatDateRange', () => {
  it('should format date range with end date', () => {
    expect(formatDateRange('2020-01', '2023-12')).toBe('January 2020 - December 2023');
  });

  it('should format current position with isCurrent true', () => {
    expect(formatDateRange('2020-01', null, true)).toBe('January 2020 - Present');
    expect(formatDateRange('2020-01', '2023-12', true)).toBe('January 2020 - Present');
  });

  it('should return just start date if no end date and not current', () => {
    expect(formatDateRange('2020-01', null, false)).toBe('January 2020');
    expect(formatDateRange('2020-01', null)).toBe('January 2020');
    expect(formatDateRange('2020-01', undefined)).toBe('January 2020');
  });

  it('should return empty string for null start date', () => {
    expect(formatDateRange(null, '2023-12')).toBe('');
    expect(formatDateRange(null, null)).toBe('');
  });

  it('should return empty string for undefined start date', () => {
    expect(formatDateRange(undefined, '2023-12')).toBe('');
  });

  it('should return empty string for empty start date', () => {
    expect(formatDateRange('', '2023-12')).toBe('');
  });

  it('should handle isCurrent as null', () => {
    expect(formatDateRange('2020-01', '2023-12', null)).toBe('January 2020 - December 2023');
  });
});
