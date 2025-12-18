'use client';

import { useRef, useState } from 'react';

import { AICertificationUploadDialog } from '@/components/profile/ai-certification-upload-dialog';
import { AIReferenceUploadDialog } from '@/components/profile/ai-reference-upload-dialog';
import {
  CertificationsManager,
  type CertificationsManagerRef,
} from '@/components/profile/certifications-manager';
import { EducationManager, type EducationManagerRef } from '@/components/profile/education-manager';
import {
  HighlightsManager,
  type HighlightsManagerRef,
} from '@/components/profile/highlights-manager';
import {
  KeyCompetencesManager,
  type KeyCompetencesManagerRef,
} from '@/components/profile/key-competences-manager';
import { ProjectsManager, type ProjectsManagerRef } from '@/components/profile/projects-manager';
import {
  ReferencesManager,
  type ReferencesManagerRef,
} from '@/components/profile/references-manager';
import { SectionCard } from '@/components/profile/SectionCard';
import { SkillsManager, type SkillsManagerRef } from '@/components/profile/skills-manager';
import {
  WorkExperienceManager,
  type WorkExperienceManagerRef,
} from '@/components/profile/work-experience-manager';
import { useAppTranslation } from '@/hooks/use-app-translation';

/**
 * All profile sections displayed inline on a single page.
 * Uses generic SectionCard component for consistent layout.
 */
export function AllSectionsView() {
  const { t } = useAppTranslation();

  // Refs for each manager
  const workExperienceRef = useRef<WorkExperienceManagerRef>(null);
  const educationRef = useRef<EducationManagerRef>(null);
  const skillsRef = useRef<SkillsManagerRef>(null);
  const highlightsRef = useRef<HighlightsManagerRef>(null);
  const projectsRef = useRef<ProjectsManagerRef>(null);
  const keyCompetencesRef = useRef<KeyCompetencesManagerRef>(null);
  const certificationsRef = useRef<CertificationsManagerRef>(null);
  const referencesRef = useRef<ReferencesManagerRef>(null);

  // AI dialog state
  const [certAiDialogOpen, setCertAiDialogOpen] = useState(false);
  const [refAiDialogOpen, setRefAiDialogOpen] = useState(false);

  return (
    <>
      <div className="space-y-6">
        <SectionCard
          title={t('profile.workExperience.pageTitle')}
          description={t('profile.workExperience.pageSubtitle')}
          addButtonLabel={t('profile.workExperience.addButton')}
          managerRef={workExperienceRef}
        >
          <WorkExperienceManager ref={workExperienceRef} />
        </SectionCard>

        <SectionCard
          title={t('profile.education.pageTitle')}
          description={t('profile.education.pageSubtitle')}
          addButtonLabel={t('profile.education.addButton')}
          managerRef={educationRef}
        >
          <EducationManager ref={educationRef} />
        </SectionCard>

        <SectionCard
          title={t('profile.skills.pageTitle')}
          description={t('profile.skills.pageSubtitle')}
          addButtonLabel={t('profile.skills.addButton')}
          managerRef={skillsRef}
        >
          <SkillsManager ref={skillsRef} />
        </SectionCard>

        <SectionCard
          title={t('profile.highlights.pageTitle')}
          description={t('profile.highlights.pageSubtitle')}
          addButtonLabel={t('profile.highlights.addButton')}
          managerRef={highlightsRef}
        >
          <HighlightsManager ref={highlightsRef} />
        </SectionCard>

        <SectionCard
          title={t('profile.projects.pageTitle')}
          description={t('profile.projects.pageSubtitle')}
          addButtonLabel={t('profile.projects.addButton')}
          managerRef={projectsRef}
        >
          <ProjectsManager ref={projectsRef} />
        </SectionCard>

        <SectionCard
          title={t('profile.keyCompetences.pageTitle')}
          description={t('profile.keyCompetences.pageSubtitle')}
          addButtonLabel={t('profile.keyCompetences.addButton')}
          managerRef={keyCompetencesRef}
        >
          <KeyCompetencesManager ref={keyCompetencesRef} />
        </SectionCard>

        <SectionCard
          title={t('profile.certifications.pageTitle')}
          description={t('profile.certifications.pageSubtitle')}
          addButtonLabel={t('profile.certifications.addButton')}
          managerRef={certificationsRef}
          hasAIFeatures
          aiButtonLabel={t('profile.certifications.addUsingAI')}
          onAIClick={() => setCertAiDialogOpen(true)}
        >
          <CertificationsManager ref={certificationsRef} />
        </SectionCard>

        <SectionCard
          title={t('profile.references.pageTitle')}
          description={t('profile.references.pageSubtitle')}
          addButtonLabel={t('profile.references.addButton')}
          managerRef={referencesRef}
          hasAIFeatures
          aiButtonLabel={t('profile.references.addUsingAI')}
          onAIClick={() => setRefAiDialogOpen(true)}
        >
          <ReferencesManager ref={referencesRef} />
        </SectionCard>
      </div>

      {/* AI Upload Dialogs */}
      <AICertificationUploadDialog
        open={certAiDialogOpen}
        onOpenChange={setCertAiDialogOpen}
        onAdd={async (certification, file) => {
          if (certificationsRef.current) {
            await certificationsRef.current.handleAddWithData(certification, file);
          }
        }}
      />

      <AIReferenceUploadDialog
        open={refAiDialogOpen}
        onOpenChange={setRefAiDialogOpen}
        onAdd={async (reference, file) => {
          if (referencesRef.current) {
            await referencesRef.current.handleAddWithData(reference, file);
          }
        }}
      />
    </>
  );
}
