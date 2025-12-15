'use client';

import { useState, useRef } from 'react';
import { KeyCompetencesManager, KeyCompetencesManagerRef } from '@/components/profile/key-competences-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';

export default function KeyCompetencesPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<KeyCompetencesManagerRef>(null);

  return (
    <ProfilePageLayout
      title="Key Competences"
      description="Define your core professional competences"
      addButtonLabel="Add Competence"
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
