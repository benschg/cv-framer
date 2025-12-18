import { useContext } from 'react';

import { ProfileModalContext } from '@/components/profile/modal/ProfileModalProvider';

/**
 * Hook to programmatically control profile modals
 *
 * @example
 * ```tsx
 * const { openModal, closeModal } = useProfileModal();
 *
 * // Open education modal
 * openModal({
 *   section: 'education',
 *   onClose: () => refetchData()
 * });
 *
 * // Close modal
 * closeModal();
 * ```
 */
export function useProfileModal() {
  const context = useContext(ProfileModalContext);

  if (!context) {
    throw new Error('useProfileModal must be used within ProfileModalProvider');
  }

  return context;
}
