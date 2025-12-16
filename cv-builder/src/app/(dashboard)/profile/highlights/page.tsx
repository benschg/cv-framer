'use client';

import { useState, useRef } from 'react';
import { HighlightsManager } from '@/components/profile/highlights-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function HighlightsPage() {
  const { t } = useAppTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<{ handleAdd: () => void }>(null);

  return (
    <ProfilePageLayout
      title={t('profile.highlights.pageTitle')}
      description={t('profile.highlights.pageSubtitle')}
      addButtonLabel={t('profile.highlights.addButton')}
      onAdd={() => managerRef.current?.handleAdd()}
      isSaving={isSaving}
      saveSuccess={saveSuccess}
    >
      <HighlightsManager
        ref={managerRef}
        onSavingChange={setIsSaving}
        onSaveSuccessChange={setSaveSuccess}
      />
    </ProfilePageLayout>
  );
}
