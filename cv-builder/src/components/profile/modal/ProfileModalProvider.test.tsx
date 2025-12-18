import { act, render, renderHook, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the translation hook
vi.mock('@/hooks/use-app-translation', () => ({
  useAppTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'profile.education.pageTitle': 'Education',
        'profile.education.pageSubtitle': 'Manage your education history',
        'profile.education.addButton': 'Add Education',
        'profile.workExperience.pageTitle': 'Work Experience',
        'profile.workExperience.pageSubtitle': 'Manage your work history',
        'profile.workExperience.addButton': 'Add Experience',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the modal save indicator hook
vi.mock('@/hooks/use-modal-save-indicator', () => ({
  useModalSaveIndicator: vi.fn(),
}));

// Import after mocking
import { useProfileModal } from '@/hooks/use-profile-modal';

import { ProfileModalProvider } from './ProfileModalProvider';

describe('ProfileModalProvider', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <ProfileModalProvider>{children}</ProfileModalProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useProfileModal hook', () => {
    it('should throw error when used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useProfileModal());
      }).toThrow('useProfileModal must be used within ProfileModalProvider');

      consoleSpy.mockRestore();
    });

    it('should return openModal, closeModal, isOpen, and currentSection', () => {
      const { result } = renderHook(() => useProfileModal(), { wrapper });

      expect(result.current.openModal).toBeDefined();
      expect(result.current.closeModal).toBeDefined();
      expect(result.current.isOpen).toBe(false);
      expect(result.current.currentSection).toBeNull();
    });

    it('should set isOpen to true when openModal is called', () => {
      const { result } = renderHook(() => useProfileModal(), { wrapper });

      act(() => {
        result.current.openModal({ section: 'education' });
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentSection).toBe('education');
    });

    it('should set isOpen to false when closeModal is called', async () => {
      const { result } = renderHook(() => useProfileModal(), { wrapper });

      act(() => {
        result.current.openModal({ section: 'education' });
      });

      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.isOpen).toBe(false);

      // Wait for state cleanup
      await waitFor(() => {
        expect(result.current.currentSection).toBeNull();
      });
    });

    it('should call onClose callback when modal closes', async () => {
      const onClose = vi.fn();
      const { result } = renderHook(() => useProfileModal(), { wrapper });

      act(() => {
        result.current.openModal({ section: 'education', onClose });
      });

      act(() => {
        result.current.closeModal();
      });

      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Modal Rendering', () => {
    it('should render modal with correct title when opened', async () => {
      function TestComponent() {
        const { openModal } = useProfileModal();
        return <button onClick={() => openModal({ section: 'education' })}>Open Education</button>;
      }

      render(
        <ProfileModalProvider>
          <TestComponent />
        </ProfileModalProvider>
      );

      const user = userEvent.setup();
      await user.click(screen.getByText('Open Education'));

      await waitFor(() => {
        expect(screen.getByText('Education')).toBeInTheDocument();
      });
    });

    it('should render modal with description when opened', async () => {
      function TestComponent() {
        const { openModal } = useProfileModal();
        return <button onClick={() => openModal({ section: 'education' })}>Open Education</button>;
      }

      render(
        <ProfileModalProvider>
          <TestComponent />
        </ProfileModalProvider>
      );

      const user = userEvent.setup();
      await user.click(screen.getByText('Open Education'));

      await waitFor(() => {
        expect(screen.getByText('Manage your education history')).toBeInTheDocument();
      });
    });

    it('should render add button in modal header', async () => {
      function TestComponent() {
        const { openModal } = useProfileModal();
        return <button onClick={() => openModal({ section: 'education' })}>Open Education</button>;
      }

      render(
        <ProfileModalProvider>
          <TestComponent />
        </ProfileModalProvider>
      );

      const user = userEvent.setup();
      await user.click(screen.getByText('Open Education'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /add education/i })).toBeInTheDocument();
      });
    });

    it('should switch sections when opening different modals', async () => {
      function TestComponent() {
        const { openModal, closeModal } = useProfileModal();
        return (
          <>
            <button onClick={() => openModal({ section: 'education' })}>Open Education</button>
            <button onClick={() => openModal({ section: 'work-experience' })}>
              Open Work Experience
            </button>
            <button onClick={() => closeModal()}>Close</button>
          </>
        );
      }

      render(
        <ProfileModalProvider>
          <TestComponent />
        </ProfileModalProvider>
      );

      const user = userEvent.setup();

      // Open education modal
      await user.click(screen.getByText('Open Education'));
      await waitFor(() => {
        expect(screen.getByText('Education')).toBeInTheDocument();
      });

      // Close it
      await user.click(screen.getByText('Close'));

      // Wait for cleanup
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Open work experience modal
      await user.click(screen.getByText('Open Work Experience'));
      await waitFor(() => {
        expect(screen.getByText('Work Experience')).toBeInTheDocument();
      });
    });
  });

  describe('Provider', () => {
    it('should render children', () => {
      render(
        <ProfileModalProvider>
          <div data-testid="child">Child Content</div>
        </ProfileModalProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should provide context to nested components', () => {
      function DeepChild() {
        const { isOpen } = useProfileModal();
        return <div data-testid="deep">{isOpen ? 'Open' : 'Closed'}</div>;
      }

      render(
        <ProfileModalProvider>
          <div>
            <div>
              <DeepChild />
            </div>
          </div>
        </ProfileModalProvider>
      );

      expect(screen.getByTestId('deep')).toHaveTextContent('Closed');
    });
  });

  describe('Modal State Management', () => {
    it('should handle rapid open/close calls', async () => {
      const { result } = renderHook(() => useProfileModal(), { wrapper });

      act(() => {
        result.current.openModal({ section: 'education' });
        result.current.closeModal();
        result.current.openModal({ section: 'work-experience' });
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.currentSection).toBe('work-experience');
    });

    it('should handle multiple onClose callbacks', async () => {
      const onClose1 = vi.fn();
      const onClose2 = vi.fn();
      const { result } = renderHook(() => useProfileModal(), { wrapper });

      // First modal with callback
      act(() => {
        result.current.openModal({ section: 'education', onClose: onClose1 });
      });
      act(() => {
        result.current.closeModal();
      });

      expect(onClose1).toHaveBeenCalledTimes(1);

      // Second modal with different callback
      act(() => {
        result.current.openModal({ section: 'work-experience', onClose: onClose2 });
      });
      act(() => {
        result.current.closeModal();
      });

      expect(onClose2).toHaveBeenCalledTimes(1);
      // First callback should not be called again
      expect(onClose1).toHaveBeenCalledTimes(1);
    });
  });
});
