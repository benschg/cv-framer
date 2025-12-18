'use client';

import { useRef,useState } from 'react';

import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';
import { SkillsManager, SkillsManagerRef } from '@/components/profile/skills-manager';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function SkillsPage() {
  const { t } = useAppTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<SkillsManagerRef>(null);

  return (
    <ProfilePageLayout
      title={t('profile.skills.pageTitle')}
      description={t('profile.skills.pageSubtitle')}
      addButtonLabel={t('profile.skills.addButton')}
      onAdd={() => managerRef.current?.handleAdd()}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
    >
      <SkillsManager
        ref={managerRef}
        onSavingChange={setIsSaving}
        onSaveSuccessChange={setSaveSuccess}
      />
    </ProfilePageLayout>
  );
}
