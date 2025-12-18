'use client';

import { cloneElement, type ReactElement } from 'react';

import { useProfileModal } from '@/hooks/use-profile-modal';

import type { ProfileSection } from './ProfileManagerModal';

interface ProfileModalTriggerProps {
  /** Profile section to open */
  section: ProfileSection;
  /** Callback when modal closes */
  onClose?: () => void;
  /** Child element that triggers the modal (receives onClick) */
  children: ReactElement<{ onClick?: () => void }>;
}

/**
 * Declarative trigger for profile modals
 *
 * @example
 * ```tsx
 * <ProfileModalTrigger section="education" onClose={() => refetch()}>
 *   <Button>Add Education</Button>
 * </ProfileModalTrigger>
 * ```
 */
export function ProfileModalTrigger({ section, onClose, children }: ProfileModalTriggerProps) {
  const { openModal } = useProfileModal();

  const handleClick = () => {
    openModal({ section, onClose });
  };

  return cloneElement(children, {
    onClick: handleClick,
  });
}
