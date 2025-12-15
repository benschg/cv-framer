'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, GraduationCap, Code, Award, ChevronRight, UserCheck, Zap, Upload, LucideIcon, Sparkles } from 'lucide-react';

interface ProfileSection {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

const profileSections: ProfileSection[] = [
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
        <div className="grid gap-3 sm:grid-cols-2">
          {profileSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent transition-colors group"
            >
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <section.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{section.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {section.description}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
