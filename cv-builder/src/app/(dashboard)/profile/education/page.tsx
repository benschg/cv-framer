'use client';

import { EducationManager } from '@/components/profile/education-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';

export default function EducationPage() {
  return (
    <ProfilePageLayout
      title="Education"
      description="Manage your education history that will be used across all your CVs"
    >
      <EducationManager />
    </ProfilePageLayout>
  );
}
