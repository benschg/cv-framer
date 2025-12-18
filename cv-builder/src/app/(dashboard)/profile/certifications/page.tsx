'use client';

import { Sparkles } from 'lucide-react';
import { useRef,useState } from 'react';

import { AICertificationUploadDialog } from '@/components/profile/ai-certification-upload-dialog';
import {
  CertificationsManager,
  CertificationsManagerRef,
} from '@/components/profile/certifications-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';
import { Button } from '@/components/ui/button';
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
          <Button variant="outline" onClick={() => setAiDialogOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            {t('profile.certifications.addUsingAI')}
          </Button>
        }
      >
        <div className="mx-auto max-w-4xl">
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
