import { Metadata } from 'next';
import { ReferencesManager } from '@/components/profile/references-manager';
import { ProfilePageLayout } from '@/components/profile/ProfilePageLayout';

export const metadata: Metadata = {
  title: 'References - Profile',
  description: 'Manage your professional references',
};

export default function ReferencesPage() {
  return (
    <ProfilePageLayout
      title="References"
      description="Manage your professional references. Add contact information, upload reference letters, and link them to specific positions."
    >
      <ReferencesManager />
    </ProfilePageLayout>
  );
}
