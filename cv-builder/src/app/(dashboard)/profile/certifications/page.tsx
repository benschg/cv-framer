'use client';

import { useState, useRef } from 'react';
import { CertificationsManager, CertificationsManagerRef } from '@/components/profile/certifications-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';
import { AICertificationUploadDialog } from '@/components/profile/ai-certification-upload-dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function CertificationsPage() {
  const { t } = useAppTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const managerRef = useRef<CertificationsManagerRef>(null);

  return (
    <>
      <ProfilePageLayout
        title={t('profile.certifications.pageTitle')}
        description={t('profile.certifications.pageSubtitle')}
        addButtonLabel={t('profile.certifications.addButton')}
        onAdd={() => managerRef.current?.handleAdd()}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        headerActions={
          <Button
            variant="outline"
            onClick={() => setAiDialogOpen(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {t('profile.certifications.addUsingAI')}
          </Button>
        }
      >
        <div className="max-w-4xl mx-auto">
          <CertificationsManager
            ref={managerRef}
            onSavingChange={setIsSaving}
            onSaveSuccessChange={setSaveSuccess}
          />
        </div>
      </ProfilePageLayout>

      <AICertificationUploadDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onAdd={async (certification, file) => {
          if (managerRef.current) {
            await managerRef.current.handleAddWithData(certification, file);
          }
        }}
      />
    </>
  );
}
