'use client';

import {
  Award,
  Briefcase,
  ChevronRight,
  Code,
  FolderKanban,
  GraduationCap,
  LucideIcon,
  Sparkles,
  Star,
  Target,
  Upload,
  UserCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileSection {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const profileSections: ProfileSection[] = [
  {
    title: 'Motivation & Vision',
    description: 'Your professional vision, mission, and what drives you',
    href: '/profile/motivation-vision',
    icon: Target,
  },
  {
    title: 'Highlights & Achievements',
    description: 'Career highlights, achievements, and unique value',
    href: '/profile/highlights',
    icon: Star,
  },
  {
    title: 'Projects',
    description: "Key projects you've worked on",
    href: '/profile/projects',
    icon: FolderKanban,
  },
  {
    title: 'Work Experience',
    description: 'Manage your work history',
    href: '/profile/experience',
    icon: Briefcase,
  },
  {
    title: 'Education',
    description: 'Add your degrees and qualifications',
    href: '/profile/education',
    icon: GraduationCap,
  },
  {
    title: 'Skills',
    description: 'Organize your skills by category',
    href: '/profile/skills',
    icon: Code,
  },
  {
    title: 'Key Competences',
    description: 'Define your core professional competences',
    href: '/profile/key-competences',
    icon: Zap,
  },
  {
    title: 'Certifications',
    description: 'Add professional certifications',
    href: '/profile/certifications',
    icon: Award,
  },
  {
    title: 'References',
    description: 'Upload reference letters',
    href: '/profile/references',
    icon: UserCheck,
  },
];

export function CareerInfoNavigation() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Career Information</CardTitle>
            <CardDescription>
              Manage your professional background that will be used across all your CVs
            </CardDescription>
          </div>
          <Link href="/profile/import-cv">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import from CV
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profileSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <section.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{section.title}</p>
                <p className="truncate text-xs text-muted-foreground">{section.description}</p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
