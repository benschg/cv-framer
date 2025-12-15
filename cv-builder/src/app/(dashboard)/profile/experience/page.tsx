'use client';

import { useState, useRef } from 'react';
import { WorkExperienceManager } from '@/components/profile/work-experience-manager';
import { useHeaderSaveIndicator } from '@/hooks/use-header-save-indicator';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function WorkExperiencePage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const managerRef = useRef<{ handleAdd: () => void }>(null);

  // Display save status in breadcrumb header
  useHeaderSaveIndicator(isSaving, saveSuccess);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Experience</h1>
          <p className="text-muted-foreground">
            Manage your work history that will be used across all your CVs
          </p>
        </div>
        <Button onClick={() => managerRef.current?.handleAdd()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </div>

      <WorkExperienceManager
        ref={managerRef}
        onSavingChange={setIsSaving}
        onSaveSuccessChange={setSaveSuccess}
      />
    </div>
  );
}
