'use client';

import { useRef,useState } from 'react';

import { EducationManager, EducationManagerRef } from '@/components/profile/education-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function EducationPage() {
  const { t } = useAppTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<EducationManagerRef>(null);

  return (
    <ProfilePageLayout
      title={t('profile.education.pageTitle')}
      description={t('profile.education.pageSubtitle')}
      addButtonLabel={t('profile.education.addButton')}
      onAdd={() => managerRef.current?.handleAdd()}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
    >
      <EducationManager
        ref={managerRef}
        onSavingChange={setIsSaving}
        onSaveSuccessChange={setSaveSuccess}
      />
    </ProfilePageLayout>
  );
}
