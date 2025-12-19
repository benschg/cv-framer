import { act, render, renderHook, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  HeaderActionsProvider,
  HeaderActionsSlot,
  useHeaderActions,
} from './header-actions-context';

describe('HeaderActionsContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <HeaderActionsProvider>{children}</HeaderActionsProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useHeaderActions', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useHeaderActions());
      }).toThrow('useHeaderActions must be used within a HeaderActionsProvider');

      consoleSpy.mockRestore();
    });

    it('should return setActions function when used within provider', () => {
      const { result } = renderHook(() => useHeaderActions(), { wrapper });

      expect(result.current.setActions).toBeDefined();
      expect(typeof result.current.setActions).toBe('function');
    });

    it('should return null actions initially', () => {
      const { result } = renderHook(() => useHeaderActions(), { wrapper });

      expect(result.current.actions).toBeNull();
    });

    it('should update actions when setActions is called', () => {
      const { result } = renderHook(() => useHeaderActions(), { wrapper });

      act(() => {
        result.current.setActions(<button>Test Action</button>);
      });

      expect(result.current.actions).not.toBeNull();
    });
  });

  describe('HeaderActionsSlot', () => {
    it('should render nothing when no actions are set', () => {
      const { container } = render(
        <HeaderActionsProvider>
          <HeaderActionsSlot />
        </HeaderActionsProvider>
      );

      expect(container.innerHTML).toBe('');
    });

    it('should render actions when set via context', () => {
      function TestComponent() {
        const { setActions } = useHeaderActions();
        return (
          <button onClick={() => setActions(<span data-testid="action">Action Button</span>)}>
            Set Action
          </button>
        );
      }

      render(
        <HeaderActionsProvider>
          <TestComponent />
          <HeaderActionsSlot />
        </HeaderActionsProvider>
      );

      // Click button to set actions
      act(() => {
        screen.getByText('Set Action').click();
      });

      expect(screen.getByTestId('action')).toBeInTheDocument();
      expect(screen.getByTestId('action')).toHaveTextContent('Action Button');
    });

    it('should update when actions change', () => {
      function TestComponent() {
        const { setActions } = useHeaderActions();
        return (
          <>
            <button onClick={() => setActions(<span data-testid="action">First</span>)}>
              Set First
            </button>
            <button onClick={() => setActions(<span data-testid="action">Second</span>)}>
              Set Second
            </button>
          </>
        );
      }

      render(
        <HeaderActionsProvider>
          <TestComponent />
          <HeaderActionsSlot />
        </HeaderActionsProvider>
      );

      // Set first action
      act(() => {
        screen.getByText('Set First').click();
      });
      expect(screen.getByTestId('action')).toHaveTextContent('First');

      // Set second action
      act(() => {
        screen.getByText('Set Second').click();
      });
      expect(screen.getByTestId('action')).toHaveTextContent('Second');
    });

    it('should clear actions when set to null', () => {
      function TestComponent() {
        const { setActions } = useHeaderActions();
        return (
          <>
            <button onClick={() => setActions(<span data-testid="action">Action</span>)}>
              Set Action
            </button>
            <button onClick={() => setActions(null)}>Clear</button>
          </>
        );
      }

      render(
        <HeaderActionsProvider>
          <TestComponent />
          <HeaderActionsSlot />
        </HeaderActionsProvider>
      );

      // Set action
      act(() => {
        screen.getByText('Set Action').click();
      });
      expect(screen.getByTestId('action')).toBeInTheDocument();

      // Clear action
      act(() => {
        screen.getByText('Clear').click();
      });
      expect(screen.queryByTestId('action')).not.toBeInTheDocument();
    });
  });

  describe('HeaderActionsProvider', () => {
    it('should render children', () => {
      render(
        <HeaderActionsProvider>
          <div data-testid="child">Child Content</div>
        </HeaderActionsProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should allow nested components to share state', () => {
      function Setter() {
        const { setActions } = useHeaderActions();
        return (
          <button onClick={() => setActions(<span data-testid="shared">Shared</span>)}>Set</button>
        );
      }

      function Reader() {
        const { actions } = useHeaderActions();
        return <div data-testid="reader">{actions ? 'Has actions' : 'No actions'}</div>;
      }

      render(
        <HeaderActionsProvider>
          <Setter />
          <Reader />
          <HeaderActionsSlot />
        </HeaderActionsProvider>
      );

      expect(screen.getByTestId('reader')).toHaveTextContent('No actions');

      act(() => {
        screen.getByText('Set').click();
      });

      expect(screen.getByTestId('reader')).toHaveTextContent('Has actions');
      expect(screen.getByTestId('shared')).toBeInTheDocument();
    });
  });
});
