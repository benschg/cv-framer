'use client';

import { useRouter } from 'next/navigation';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';
import { CVImportWorkflow } from '@/components/profile/cv-import-workflow';

export default function ImportCVPage() {
  const router = useRouter();

  const handleImportComplete = () => {
    // Navigate to profile overview
    router.push('/profile');
  };

  return (
    <ProfilePageLayout
      title="Import from CV"
      description="Upload your CV and let AI extract your career information"
    >
      <CVImportWorkflow onImportComplete={handleImportComplete} />
    </ProfilePageLayout>
  );
}
