import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cancelDebounce, debounce, hasPendingDebounce } from './debounce';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should delay function execution', () => {
    const fn = vi.fn();
    const debouncedFn = debounce('test-delay', fn, 1000);

    debouncedFn();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should use default delay of 1000ms', () => {
    const fn = vi.fn();
    const debouncedFn = debounce('test-default', fn);

    debouncedFn();
    vi.advanceTimersByTime(999);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should reset timer on subsequent calls', () => {
    const fn = vi.fn();
    const debouncedFn = debounce('test-reset', fn, 1000);

    debouncedFn();
    vi.advanceTimersByTime(500);

    debouncedFn(); // Reset the timer
    vi.advanceTimersByTime(500);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to the function', () => {
    const fn = vi.fn();
    const debouncedFn = debounce('test-args', fn, 100);

    debouncedFn('arg1', 'arg2');
    vi.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should handle multiple independent debounces with different keys', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();
    const debouncedFn1 = debounce('key-1', fn1, 100);
    const debouncedFn2 = debounce('key-2', fn2, 200);

    debouncedFn1();
    debouncedFn2();

    vi.advanceTimersByTime(100);
    expect(fn1).toHaveBeenCalledTimes(1);
    expect(fn2).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(fn2).toHaveBeenCalledTimes(1);
  });

  it('should allow same function with different keys', () => {
    const fn = vi.fn();
    const debouncedFn1 = debounce('item-1', fn, 100);
    const debouncedFn2 = debounce('item-2', fn, 100);

    debouncedFn1();
    debouncedFn2();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe('cancelDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should cancel pending debounce', () => {
    const fn = vi.fn();
    const debouncedFn = debounce('test-cancel', fn, 1000);

    debouncedFn();
    cancelDebounce('test-cancel');

    vi.advanceTimersByTime(1000);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should not throw when cancelling non-existent key', () => {
    expect(() => cancelDebounce('non-existent')).not.toThrow();
  });
});

describe('hasPendingDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return true for pending debounce', () => {
    const fn = vi.fn();
    const debouncedFn = debounce('test-pending', fn, 1000);

    debouncedFn();
    expect(hasPendingDebounce('test-pending')).toBe(true);
  });

  it('should return false after debounce completes', () => {
    const fn = vi.fn();
    const debouncedFn = debounce('test-completed', fn, 100);

    debouncedFn();
    vi.advanceTimersByTime(100);

    expect(hasPendingDebounce('test-completed')).toBe(false);
  });

  it('should return false for non-existent key', () => {
    expect(hasPendingDebounce('non-existent')).toBe(false);
  });

  it('should return false after cancellation', () => {
    const fn = vi.fn();
    const debouncedFn = debounce('test-cancelled', fn, 1000);

    debouncedFn();
    cancelDebounce('test-cancelled');

    expect(hasPendingDebounce('test-cancelled')).toBe(false);
  });
});
