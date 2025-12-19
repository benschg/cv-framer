import { render, screen } from '@testing-library/react';
import { useMemo } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HeaderActionsProvider, HeaderActionsSlot } from '@/contexts/header-actions-context';

import { usePageHeaderActions } from './use-page-header-actions';

describe('usePageHeaderActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set actions in the header', () => {
    function TestComponent() {
      // Must memoize actions to avoid infinite re-renders
      const actions = useMemo(() => <button data-testid="action-btn">Add Item</button>, []);
      usePageHeaderActions(actions);
      return <div>Page Content</div>;
    }

    render(
      <HeaderActionsProvider>
        <TestComponent />
        <HeaderActionsSlot />
      </HeaderActionsProvider>
    );

    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
    expect(screen.getByTestId('action-btn')).toHaveTextContent('Add Item');
  });

  it('should work with interactive buttons', () => {
    const handleClick = vi.fn();

    function TestComponent() {
      const actions = useMemo(
        () => (
          <button data-testid="action-btn" onClick={handleClick}>
            Click Me
          </button>
        ),
        // handleClick is stable (vi.fn()) so no need to include in deps
        []
      );
      usePageHeaderActions(actions);
      return <div>Page Content</div>;
    }

    render(
      <HeaderActionsProvider>
        <TestComponent />
        <HeaderActionsSlot />
      </HeaderActionsProvider>
    );

    screen.getByTestId('action-btn').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should render multiple buttons', () => {
    function TestComponent() {
      const actions = useMemo(
        () => (
          <>
            <button data-testid="btn-1">Button 1</button>
            <button data-testid="btn-2">Button 2</button>
          </>
        ),
        []
      );
      usePageHeaderActions(actions);
      return <div>Page Content</div>;
    }

    render(
      <HeaderActionsProvider>
        <TestComponent />
        <HeaderActionsSlot />
      </HeaderActionsProvider>
    );

    expect(screen.getByTestId('btn-1')).toBeInTheDocument();
    expect(screen.getByTestId('btn-2')).toBeInTheDocument();
  });
});
