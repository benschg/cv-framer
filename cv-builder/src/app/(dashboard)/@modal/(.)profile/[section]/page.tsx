'use client';

import { useRouter } from 'next/navigation';
import React, { use } from 'react';

import {
  getProfileModalEntry,
  ProfileManagerModal,
  type ProfileSection,
} from '@/components/profile/modal';
import { useAppTranslation } from '@/hooks/use-app-translation';

// Map URL segments to ProfileSection types
const URL_TO_SECTION: Record<string, ProfileSection> = {
  education: 'education',
  experience: 'work-experience',
  'work-experience': 'work-experience',
  references: 'references',
  certifications: 'certifications',
  skills: 'skills',
  highlights: 'highlights',
  projects: 'projects',
  'key-competences': 'key-competences',
  'motivation-vision': 'motivation-vision',
  'import-cv': 'import-cv',
};

interface InterceptedProfileModalProps {
  params: Promise<{ section: string }>;
}

export default function InterceptedProfileModal({ params }: InterceptedProfileModalProps) {
  const router = useRouter();
  const { t } = useAppTranslation();

  // Unwrap params (Next.js 15 async params)
  const { section: urlSection } = use(params);

  // Map URL segment to ProfileSection
  const section = URL_TO_SECTION[urlSection];

  // If invalid section, close modal
  if (!section) {
    router.back();
    return null;
  }

  const registryEntry = getProfileModalEntry(section);

  if (!registryEntry) {
    router.back();
    return null;
  }

  const handleClose = () => {
    router.back();
  };

  return (
    <ProfileManagerModal
      section={section}
      open={true}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      title={registryEntry.title(t)}
      description={registryEntry.description(t)}
      onClose={handleClose}
    >
      {({ managerRef, onSavingChange, onSaveSuccessChange, onRefreshNeeded, refreshKey }) => {
        const ManagerComponent = registryEntry.ManagerComponent as React.ForwardRefExoticComponent<
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
  );
}
