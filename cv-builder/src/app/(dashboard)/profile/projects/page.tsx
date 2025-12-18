'use client';

import { useRef,useState } from 'react';

import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';
import { ProjectsManager } from '@/components/profile/projects-manager';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function ProjectsPage() {
  const { t } = useAppTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<{ handleAdd: () => void }>(null);

  return (
    <ProfilePageLayout
      title={t('profile.projects.pageTitle')}
      description={t('profile.projects.pageSubtitle')}
      addButtonLabel={t('profile.projects.addButton')}
      onAdd={() => managerRef.current?.handleAdd()}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
    >
      <ProjectsManager
        ref={managerRef}
        onSavingChange={setIsSaving}
        onSaveSuccessChange={setSaveSuccess}
      />
    </ProfilePageLayout>
  );
}
