'use client';

import { WorkExperienceManager } from '@/components/profile/work-experience-manager';

export default function WorkExperiencePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Work Experience</h1>
        <p className="text-muted-foreground">
          Manage your work history that will be used across all your CVs
        </p>
      </div>

      <WorkExperienceManager />
    </div>
  );
}
