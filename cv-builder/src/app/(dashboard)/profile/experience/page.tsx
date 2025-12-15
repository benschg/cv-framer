'use client';

import { useState, useRef } from 'react';
import { WorkExperienceManager } from '@/components/profile/work-experience-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';

export default function WorkExperiencePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<{ handleAdd: () => void }>(null);

  return (
    <ProfilePageLayout
      title="Work Experience"
      description="Manage your work history that will be used across all your CVs"
      addButtonLabel="Add Experience"
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
