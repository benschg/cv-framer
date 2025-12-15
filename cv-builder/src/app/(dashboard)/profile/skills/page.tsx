'use client';

import { SkillsManager } from '@/components/profile/skills-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';

export default function SkillsPage() {
  return (
    <ProfilePageLayout
      title="Skills"
      description="Manage your skills organized by category"
    >
      <SkillsManager />
    </ProfilePageLayout>
  );
}
