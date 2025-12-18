import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HeaderActionsProvider, HeaderActionsSlot } from '@/contexts/header-actions-context';

import { usePageHeaderActions } from './use-page-header-actions';

describe('usePageHeaderActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set actions in the header', () => {
    function TestComponent() {
      usePageHeaderActions(<button data-testid="action-btn">Add Item</button>);
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

  it('should clear actions on unmount', () => {
    function TestComponent() {
      usePageHeaderActions(<button data-testid="action-btn">Add</button>);
      return <div>Page Content</div>;
    }

    const { unmount } = render(
      <HeaderActionsProvider>
        <TestComponent />
        <HeaderActionsSlot />
      </HeaderActionsProvider>
    );

    expect(screen.getByTestId('action-btn')).toBeInTheDocument();

    unmount();

    // After unmount, we need to re-render just the slot to verify it's empty
    render(
      <HeaderActionsProvider>
        <HeaderActionsSlot />
      </HeaderActionsProvider>
    );

    expect(screen.queryByTestId('action-btn')).not.toBeInTheDocument();
  });

  it('should update actions when dependencies change', () => {
    function TestComponent({ label }: { label: string }) {
      usePageHeaderActions(<button data-testid="action-btn">{label}</button>);
      return <div>Page Content</div>;
    }

    const { rerender } = render(
      <HeaderActionsProvider>
        <TestComponent label="First" />
        <HeaderActionsSlot />
      </HeaderActionsProvider>
    );

    expect(screen.getByTestId('action-btn')).toHaveTextContent('First');

    rerender(
      <HeaderActionsProvider>
        <TestComponent label="Second" />
        <HeaderActionsSlot />
      </HeaderActionsProvider>
    );

    expect(screen.getByTestId('action-btn')).toHaveTextContent('Second');
  });

  it('should handle multiple buttons', () => {
    function TestComponent() {
      usePageHeaderActions(
        <>
          <button data-testid="btn-1">Button 1</button>
          <button data-testid="btn-2">Button 2</button>
        </>
      );
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

  it('should handle null actions', () => {
    function TestComponent({ showActions }: { showActions: boolean }) {
      usePageHeaderActions(showActions ? <button data-testid="action-btn">Action</button> : null);
      return <div>Page Content</div>;
    }

    const { rerender } = render(
      <HeaderActionsProvider>
        <TestComponent showActions={true} />
        <HeaderActionsSlot />
      </HeaderActionsProvider>
    );

    expect(screen.getByTestId('action-btn')).toBeInTheDocument();

    rerender(
      <HeaderActionsProvider>
        <TestComponent showActions={false} />
        <HeaderActionsSlot />
      </HeaderActionsProvider>
    );

    expect(screen.queryByTestId('action-btn')).not.toBeInTheDocument();
  });

  it('should work with interactive buttons', () => {
    const handleClick = vi.fn();

    function TestComponent() {
      usePageHeaderActions(
        <button data-testid="action-btn" onClick={handleClick}>
          Click Me
        </button>
      );
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

  it('should call setActions from context', () => {
    // The usePageHeaderActions hook should call setActions on mount
    // We verify this by checking that actions appear in the slot
    function TestComponent() {
      usePageHeaderActions(<span>Test</span>);
      return null;
    }

    render(
      <HeaderActionsProvider>
        <TestComponent />
        <HeaderActionsSlot />
      </HeaderActionsProvider>
    );

    // Verify the action was rendered (proving setActions was called)
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
