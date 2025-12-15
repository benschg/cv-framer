'use client';

import { SkillsManager } from '@/components/profile/skills-manager';

export default function SkillsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
        <p className="text-muted-foreground">
          Manage your skills organized by category
        </p>
      </div>

      <SkillsManager />
    </div>
  );
}
