'use client';

import { useRef,useState } from 'react';

import {
  KeyCompetencesManager,
  KeyCompetencesManagerRef,
} from '@/components/profile/key-competences-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function KeyCompetencesPage() {
  const { t } = useAppTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<KeyCompetencesManagerRef>(null);

  return (
    <ProfilePageLayout
      title={t('profile.keyCompetences.pageTitle')}
      description={t('profile.keyCompetences.pageSubtitle')}
      addButtonLabel={t('profile.keyCompetences.addButton')}
      onAdd={() => managerRef.current?.handleAdd()}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
    >
      <KeyCompetencesManager
        ref={managerRef}
        onSavingChange={setIsSaving}
        onSaveSuccessChange={setSaveSuccess}
      />
    </ProfilePageLayout>
  );
}
