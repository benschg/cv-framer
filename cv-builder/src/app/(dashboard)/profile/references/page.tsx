import { Metadata } from 'next';
import { ReferencesManager } from '@/components/profile/references-manager';

export const metadata: Metadata = {
  title: 'References - Profile',
  description: 'Manage your professional references',
};

export default function ReferencesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">References</h1>
        <p className="text-muted-foreground mt-2">
          Manage your professional references. Add contact information, upload reference letters, and link them to specific positions.
        </p>
      </div>

      <ReferencesManager />
    </div>
  );
}
