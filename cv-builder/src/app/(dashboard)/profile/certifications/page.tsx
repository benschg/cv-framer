'use client';

import { CertificationsManager } from '@/components/profile/certifications-manager';

export default function CertificationsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
        <p className="text-muted-foreground">
          Manage your professional certifications and licenses
        </p>
      </div>

      <CertificationsManager />
    </div>
  );
}
