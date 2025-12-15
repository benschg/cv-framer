'use client';

import { useState, useRef } from 'react';
import { EducationManager, EducationManagerRef } from '@/components/profile/education-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';

export default function EducationPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<EducationManagerRef>(null);

  return (
    <ProfilePageLayout
      title="Education"
      description="Manage your education history that will be used across all your CVs"
      addButtonLabel="Add Education"
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
