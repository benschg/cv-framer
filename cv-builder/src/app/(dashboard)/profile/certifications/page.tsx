'use client';

import { useState, useRef } from 'react';
import { CertificationsManager, CertificationsManagerRef } from '@/components/profile/certifications-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';

export default function CertificationsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<CertificationsManagerRef>(null);

  return (
    <ProfilePageLayout
      title="Certifications"
      description="Manage your professional certifications and licenses"
      addButtonLabel="Add Certification"
      onAdd={() => managerRef.current?.handleAdd()}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
    >
      <CertificationsManager
        ref={managerRef}
        onSavingChange={setIsSaving}
        onSaveSuccessChange={setSaveSuccess}
      />
    </ProfilePageLayout>
  );
}
