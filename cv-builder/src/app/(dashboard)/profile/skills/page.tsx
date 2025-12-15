'use client';

import { useState, useRef } from 'react';
import { SkillsManager, SkillsManagerRef } from '@/components/profile/skills-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';

export default function SkillsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<SkillsManagerRef>(null);

  return (
    <ProfilePageLayout
      title="Skills"
      description="Manage your skills organized by category"
      addButtonLabel="Add Category"
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
