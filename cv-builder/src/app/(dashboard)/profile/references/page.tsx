'use client';

import { useState, useRef } from 'react';
import { ReferencesManager, ReferencesManagerRef } from '@/components/profile/references-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';
import { AIReferenceUploadDialog } from '@/components/profile/ai-reference-upload-dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export default function ReferencesPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const managerRef = useRef<ReferencesManagerRef>(null);

  return (
    <>
      <ProfilePageLayout
        title="References"
        description="Manage your professional references. Add contact information, upload reference letters, and link them to specific positions."
        addButtonLabel="Add Reference"
        onAdd={() => managerRef.current?.handleAdd()}
        isSaving={isSaving}
        saveSuccess={saveSuccess}
        headerActions={
          <Button
            variant="outline"
            onClick={() => setAiDialogOpen(true)}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Add using AI
          </Button>
        }
      >
        <div className="max-w-4xl mx-auto">
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
