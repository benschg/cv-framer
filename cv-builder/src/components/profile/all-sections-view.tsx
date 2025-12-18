'use client';

import { CertificationsManager } from '@/components/profile/certifications-manager';
import { EducationManager } from '@/components/profile/education-manager';
import { HighlightsManager } from '@/components/profile/highlights-manager';
import { KeyCompetencesManager } from '@/components/profile/key-competences-manager';
import { ProjectsManager } from '@/components/profile/projects-manager';
import { ReferencesManager } from '@/components/profile/references-manager';
import { SkillsManager } from '@/components/profile/skills-manager';
import { WorkExperienceManager } from '@/components/profile/work-experience-manager';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppTranslation } from '@/hooks/use-app-translation';

/**
 * All profile sections displayed inline on a single page
 */
export function AllSectionsView() {
  const { t } = useAppTranslation();

  return (
    <div className="space-y-6">
      {/* Work Experience */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.workExperience.pageTitle')}</CardTitle>
          <CardDescription>{t('profile.workExperience.pageSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <WorkExperienceManager />
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.education.pageTitle')}</CardTitle>
          <CardDescription>{t('profile.education.pageSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <EducationManager />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.skills.pageTitle')}</CardTitle>
          <CardDescription>{t('profile.skills.pageSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <SkillsManager />
        </CardContent>
      </Card>

      {/* Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.highlights.pageTitle')}</CardTitle>
          <CardDescription>{t('profile.highlights.pageSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <HighlightsManager />
        </CardContent>
      </Card>

      {/* Projects */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.projects.pageTitle')}</CardTitle>
          <CardDescription>{t('profile.projects.pageSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectsManager />
        </CardContent>
      </Card>

      {/* Key Competences */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.keyCompetences.pageTitle')}</CardTitle>
          <CardDescription>{t('profile.keyCompetences.pageSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <KeyCompetencesManager />
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.certifications.pageTitle')}</CardTitle>
          <CardDescription>{t('profile.certifications.pageSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <CertificationsManager />
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.references.pageTitle')}</CardTitle>
          <CardDescription>{t('profile.references.pageSubtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ReferencesManager />
        </CardContent>
      </Card>
    </div>
  );
}
