'use client';

import { useRef,useState } from 'react';

import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';
import { WorkExperienceManager } from '@/components/profile/work-experience-manager';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function WorkExperiencePage() {
  const { t } = useAppTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<{ handleAdd: () => void }>(null);

  return (
    <ProfilePageLayout
      title={t('profile.workExperience.pageTitle')}
      description={t('profile.workExperience.pageSubtitle')}
      addButtonLabel={t('profile.workExperience.addButton')}
      onAdd={() => managerRef.current?.handleAdd()}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
    >
      <WorkExperienceManager
        ref={managerRef}
        onSavingChange={setIsSaving}
        onSaveSuccessChange={setSaveSuccess}
      />
    </ProfilePageLayout>
  );
}
