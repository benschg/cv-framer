'use client';

import { EducationManager } from '@/components/profile/education-manager';

export default function EducationPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Education</h1>
        <p className="text-muted-foreground">
          Manage your education history that will be used across all your CVs
        </p>
      </div>

      <EducationManager />
    </div>
  );
}
