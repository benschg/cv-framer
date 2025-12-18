'use client';

import { useState } from 'react';

import { EducationManager } from '@/components/profile/education-manager';
import { ProfileManagerModal } from '@/components/profile/modal';
import { Button } from '@/components/ui/button';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function TestModalPage() {
  const { t } = useAppTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-3xl font-bold">Profile Manager Modal Test</h1>
        <p className="mb-6 text-muted-foreground">
          This page tests the ProfileManagerModal component with the Education manager.
        </p>

        <Button onClick={() => setIsOpen(true)}>Open Education Modal</Button>

        <ProfileManagerModal
          section="education"
          open={isOpen}
          onOpenChange={setIsOpen}
          title={t('profile.education.pageTitle')}
          description={t('profile.education.pageSubtitle')}
          onClose={() => {
            console.log('Modal closed');
          }}
        >
          {({ managerRef, onSavingChange, onSaveSuccessChange }) => (
            <EducationManager
              ref={managerRef}
              onSavingChange={onSavingChange}
              onSaveSuccessChange={onSaveSuccessChange}
            />
          )}
        </ProfileManagerModal>
      </div>
    </div>
  );
}
