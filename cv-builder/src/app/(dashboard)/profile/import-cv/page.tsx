'use client';

import { useRouter } from 'next/navigation';

import { CVImportWorkflow } from '@/components/profile/cv-import-workflow';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';

export default function ImportCVPage() {
  const router = useRouter();

  const handleImportComplete = () => {
    // Navigate to profile overview
    router.push('/profile');
  };

  return (
    <ProfilePageLayout
      title="Upload Your Current CV"
      description="Upload your CV and let AI extract your career information"
    >
      <CVImportWorkflow onImportComplete={handleImportComplete} />
    </ProfilePageLayout>
  );
}
