'use client';

import { useState, useRef } from 'react';
import { ReferencesManager, ReferencesManagerRef } from '@/components/profile/references-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';

export default function ReferencesPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<ReferencesManagerRef>(null);

  return (
    <ProfilePageLayout
      title="References"
      description="Manage your professional references. Add contact information, upload reference letters, and link them to specific positions."
      addButtonLabel="Add Reference"
      onAdd={() => managerRef.current?.handleAdd()}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
    >
      <ReferencesManager
        ref={managerRef}
        onSavingChange={setIsSaving}
        onSaveSuccessChange={setSaveSuccess}
      />
    </ProfilePageLayout>
  );
}
