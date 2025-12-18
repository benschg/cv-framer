'use client';

import Link from 'next/link';

import { ProfileModalTrigger } from '@/components/profile/modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfileModal } from '@/hooks/use-profile-modal';

export default function TestModalPage() {
  const { openModal } = useProfileModal();

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="mb-4 text-3xl font-bold">Profile Manager Modal Test</h1>
          <p className="text-muted-foreground">
            Test the programmatic API for opening profile modals from anywhere in the application.
            All 11 sections are available via the registry.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Basic Profile Sections</CardTitle>
            <CardDescription>
              Simple CRUD managers without AI features (Education, Work Experience, Skills, etc.)
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => openModal({ section: 'education' })}>Open Education</Button>
            <Button onClick={() => openModal({ section: 'work-experience' })}>
              Open Work Experience
            </Button>
            <Button onClick={() => openModal({ section: 'skills' })}>Open Skills</Button>
            <Button onClick={() => openModal({ section: 'highlights' })}>Open Highlights</Button>
            <Button onClick={() => openModal({ section: 'projects' })}>Open Projects</Button>
            <Button onClick={() => openModal({ section: 'key-competences' })}>
              Open Key Competences
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Advanced Sections with AI</CardTitle>
            <CardDescription>
              Sections with document upload and AI extraction features
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => openModal({ section: 'references' })}>Open References</Button>
            <Button onClick={() => openModal({ section: 'certifications' })}>
              Open Certifications
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Special Sections (Placeholders)</CardTitle>
            <CardDescription>
              Sections not yet implemented - will use placeholder managers
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button
              onClick={() => openModal({ section: 'motivation-vision' })}
              variant="outline"
              disabled
            >
              Motivation & Vision (Coming Soon)
            </Button>
            <Button onClick={() => openModal({ section: 'import-cv' })} variant="outline" disabled>
              Import CV (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>With Callback</CardTitle>
            <CardDescription>
              Test onClose callback to trigger actions after modal closes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() =>
                openModal({
                  section: 'education',
                  onClose: () => {
                    console.log('Education modal closed - trigger refetch here');
                  },
                })
              }
            >
              Open Education with Callback
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Declarative Triggers</CardTitle>
            <CardDescription>Using ProfileModalTrigger component for cleaner JSX</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <ProfileModalTrigger section="education">
              <Button variant="secondary">Education (Declarative)</Button>
            </ProfileModalTrigger>
            <ProfileModalTrigger
              section="work-experience"
              onClose={() => console.log('Work experience closed')}
            >
              <Button variant="secondary">Work Experience (Declarative)</Button>
            </ProfileModalTrigger>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>URL-Based (Intercepting Routes)</CardTitle>
            <CardDescription>
              Links that open as modals via Next.js intercepting routes. Back button closes modal.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/profile/education">Education (URL)</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/profile/experience">Work Experience (URL)</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/profile/skills">Skills (URL)</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/profile/references">References (URL)</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
