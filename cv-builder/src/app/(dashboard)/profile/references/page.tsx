'use client';

import { Sparkles } from 'lucide-react';
import { useRef,useState } from 'react';

import { AIReferenceUploadDialog } from '@/components/profile/ai-reference-upload-dialog';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';
import { ReferencesManager, ReferencesManagerRef } from '@/components/profile/references-manager';
import { Button } from '@/components/ui/button';
import { useAppTranslation } from '@/hooks/use-app-translation';

export default function ReferencesPage() {
  const { t } = useAppTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const managerRef = useRef<ReferencesManagerRef>(null);

  return (
    <>
      <ProfilePageLayout
        title={t('profile.references.pageTitle')}
        description={t('profile.references.pageSubtitle')}
        addButtonLabel={t('profile.references.addButton')}
        onAdd={() => managerRef.current?.handleAdd()}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        headerActions={
          <Button variant="outline" onClick={() => setAiDialogOpen(true)}>
            <Sparkles className="mr-2 h-4 w-4" />
            {t('profile.references.addUsingAI')}
          </Button>
        }
      >
        <div className="mx-auto max-w-4xl">
          <ReferencesManager
            ref={managerRef}
            onSavingChange={setIsSaving}
            onSaveSuccessChange={setSaveSuccess}
          />
        </div>
      </ProfilePageLayout>

      <AIReferenceUploadDialog
        open={aiDialogOpen}
        onOpenChange={setAiDialogOpen}
        onAdd={async (reference, file) => {
          if (managerRef.current) {
            await managerRef.current.handleAddWithData(reference, file);
          }
        }}
      />
    </>
  );
}
