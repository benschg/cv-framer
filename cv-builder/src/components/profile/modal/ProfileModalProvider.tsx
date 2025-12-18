'use client';

import React, { createContext, type ReactNode, useRef, useState } from 'react';

import { useAppTranslation } from '@/hooks/use-app-translation';

import { getProfileModalEntry } from './profile-modal-registry';
import { ProfileManagerModal, type ProfileSection } from './ProfileManagerModal';

interface OpenModalOptions {
  section: ProfileSection;
  onClose?: () => void;
}

interface ProfileModalContextValue {
  openModal: (options: OpenModalOptions) => void;
  closeModal: () => void;
  isOpen: boolean;
  currentSection: ProfileSection | null;
}

export const ProfileModalContext = createContext<ProfileModalContextValue | null>(null);

interface ProfileModalProviderProps {
  children: ReactNode;
}

/**
 * Provider for programmatic modal control
 *
 * Usage:
 * ```tsx
 * // In layout
 * <ProfileModalProvider>
 *   {children}
 * </ProfileModalProvider>
 *
 * // In any component
 * const { openModal } = useProfileModal();
 * openModal({ section: 'education', onClose: () => refetch() });
 * ```
 */
export function ProfileModalProvider({ children }: ProfileModalProviderProps) {
  const { t } = useAppTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<ProfileSection | null>(null);
  const onCloseCallbackRef = useRef<(() => void) | null>(null);

  const openModal = ({ section, onClose }: OpenModalOptions) => {
    setCurrentSection(section);
    onCloseCallbackRef.current = onClose || null;
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Call onClose callback if provided
    if (onCloseCallbackRef.current) {
      onCloseCallbackRef.current();
    }
    // Clear state after animation completes
    setTimeout(() => {
      setCurrentSection(null);
      onCloseCallbackRef.current = null;
    }, 300);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeModal();
    } else {
      setIsOpen(true);
    }
  };

  // Get registry entry for current section
  const registryEntry = currentSection ? getProfileModalEntry(currentSection) : null;

  return (
    <ProfileModalContext.Provider
      value={{
        openModal,
        closeModal,
        isOpen,
        currentSection,
      }}
    >
      {children}

      {/* Dynamically render modal based on current section */}
      {registryEntry && (
        <ProfileManagerModal
          section={registryEntry.section}
          open={isOpen}
          onOpenChange={handleOpenChange}
          title={registryEntry.title(t)}
          description={registryEntry.description(t)}
          onClose={closeModal}
        >
          {({ managerRef, onSavingChange, onSaveSuccessChange, onRefreshNeeded, refreshKey }) => {
            const ManagerComponent =
              registryEntry.ManagerComponent as React.ForwardRefExoticComponent<
                React.PropsWithoutRef<{
                  onSavingChange?: (saving: boolean) => void;
                  onSaveSuccessChange?: (success: boolean) => void;
                  onRefreshNeeded?: () => void;
                }> &
                  React.RefAttributes<unknown>
              >;

            return (
              <ManagerComponent
                key={refreshKey}
                ref={managerRef as React.Ref<unknown>}
                onSavingChange={onSavingChange}
                onSaveSuccessChange={onSaveSuccessChange}
                onRefreshNeeded={onRefreshNeeded}
              />
            );
          }}
        </ProfileManagerModal>
      )}
    </ProfileModalContext.Provider>
  );
}
