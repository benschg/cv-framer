'use client';

import { CertificationsManager } from '@/components/profile/certifications-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';

export default function CertificationsPage() {
  return (
    <ProfilePageLayout
      title="Certifications"
      description="Manage your professional certifications and licenses"
    >
      <CertificationsManager />
    </ProfilePageLayout>
  );
}
