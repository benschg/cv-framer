import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMockSupabaseClient } from '@/test/mocks/supabase';

// Mock the Supabase client FIRST - before any imports that use it
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => createMockSupabaseClient()),
}));

// Mock the auth context
vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'test-user-id' },
    isLoading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    resetPassword: vi.fn(),
    updatePassword: vi.fn(),
  })),
  AuthProvider: ({ children }: { children: ReactNode }) => children,
}));

// Mock the translation hook
vi.mock('@/hooks/use-app-translation', () => ({
  useAppTranslation: () => ({
    t: (key: string) => key,
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

    it('should call onClose callback when modal closes', () => {
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

    it('should handle switching sections', () => {
      const { result } = renderHook(() => useProfileModal(), { wrapper });

      act(() => {
        result.current.openModal({ section: 'education' });
      });

      expect(result.current.currentSection).toBe('education');

      act(() => {
        result.current.openModal({ section: 'work-experience' });
      });

      expect(result.current.currentSection).toBe('work-experience');
    });

    it('should handle multiple onClose callbacks correctly', () => {
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
