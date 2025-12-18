'use client';

import {
  Award,
  Briefcase,
  ChevronRight,
  Code,
  FolderKanban,
  GraduationCap,
  type LucideIcon,
  Sparkles,
  Star,
  Target,
  UserCheck,
  Zap,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppTranslation } from '@/hooks/use-app-translation';

interface ProfileSection {
  titleKey: string;
  descriptionKey: string;
  href: string;
  icon: LucideIcon;
}

const profileSections: ProfileSection[] = [
  {
    titleKey: 'profile.motivationVision.pageTitle',
    descriptionKey: 'profile.motivationVision.pageSubtitle',
    href: '/profile/motivation-vision',
    icon: Target,
  },
  {
    titleKey: 'profile.highlights.pageTitle',
    descriptionKey: 'profile.highlights.pageSubtitle',
    href: '/profile/highlights',
    icon: Star,
  },
  {
    titleKey: 'profile.projects.pageTitle',
    descriptionKey: 'profile.projects.pageSubtitle',
    href: '/profile/projects',
    icon: FolderKanban,
  },
  {
    titleKey: 'profile.workExperience.pageTitle',
    descriptionKey: 'profile.workExperience.pageSubtitle',
    href: '/profile/experience',
    icon: Briefcase,
  },
  {
    titleKey: 'profile.education.pageTitle',
    descriptionKey: 'profile.education.pageSubtitle',
    href: '/profile/education',
    icon: GraduationCap,
  },
  {
    titleKey: 'profile.skills.pageTitle',
    descriptionKey: 'profile.skills.pageSubtitle',
    href: '/profile/skills',
    icon: Code,
  },
  {
    titleKey: 'profile.keyCompetences.pageTitle',
    descriptionKey: 'profile.keyCompetences.pageSubtitle',
    href: '/profile/key-competences',
    icon: Zap,
  },
  {
    titleKey: 'profile.certifications.pageTitle',
    descriptionKey: 'profile.certifications.pageSubtitle',
    href: '/profile/certifications',
    icon: Award,
  },
  {
    titleKey: 'profile.references.pageTitle',
    descriptionKey: 'profile.references.pageSubtitle',
    href: '/profile/references',
    icon: UserCheck,
  },
];

export function CareerInfoNavigation() {
  const { t } = useAppTranslation();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t('profile.careerInfo.title')}</CardTitle>
            <CardDescription>{t('profile.careerInfo.subtitle')}</CardDescription>
          </div>
          <Link href="/profile/import-cv">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              {t('profile.careerInfo.importButton')}
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
                <p className="text-sm font-medium">{t(section.titleKey)}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t(section.descriptionKey)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
