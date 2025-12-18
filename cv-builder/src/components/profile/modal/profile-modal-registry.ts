import type { ComponentType } from 'react';

import { CertificationsManager } from '@/components/profile/certifications-manager';
import { EducationManager } from '@/components/profile/education-manager';
import { HighlightsManager } from '@/components/profile/highlights-manager';
import { KeyCompetencesManager } from '@/components/profile/key-competences-manager';
import { ProjectsManager } from '@/components/profile/projects-manager';
import { ReferencesManager } from '@/components/profile/references-manager';
import { SkillsManager } from '@/components/profile/skills-manager';
import { WorkExperienceManager } from '@/components/profile/work-experience-manager';

import type { ManagerProps, ProfileSection } from './ProfileManagerModal';

export interface ProfileModalRegistryEntry {
  section: ProfileSection;
  // Use ComponentType to allow different manager ref interfaces without strict typing
  // Each manager has its own XyzManagerRef type, registry doesn't need to enforce it
  ManagerComponent: ComponentType<ManagerProps>;
  title: (t: (key: string) => string) => string;
  description: (t: (key: string) => string) => string;
  addButtonLabel?: (t: (key: string) => string) => string;
  hasAIFeatures?: boolean;
  AIDialogComponent?: ComponentType<unknown>;
}

export const PROFILE_MODAL_REGISTRY: Record<ProfileSection, ProfileModalRegistryEntry> = {
  education: {
    section: 'education',
    ManagerComponent: EducationManager,
    title: (t) => t('profile.education.pageTitle'),
    description: (t) => t('profile.education.pageSubtitle'),
    addButtonLabel: (t) => t('profile.education.addButton'),
    hasAIFeatures: false,
  },
  'work-experience': {
    section: 'work-experience',
    ManagerComponent: WorkExperienceManager,
    title: (t) => t('profile.workExperience.pageTitle'),
    description: (t) => t('profile.workExperience.pageSubtitle'),
    addButtonLabel: (t) => t('profile.workExperience.addButton'),
    hasAIFeatures: false,
  },
  references: {
    section: 'references',
    ManagerComponent: ReferencesManager,
    title: (t) => t('profile.references.pageTitle'),
    description: (t) => t('profile.references.pageSubtitle'),
    addButtonLabel: (t) => t('profile.references.addButton'),
    hasAIFeatures: true,
    // AIDialogComponent will be added in Phase 3
  },
  certifications: {
    section: 'certifications',
    ManagerComponent: CertificationsManager,
    title: (t) => t('profile.certifications.pageTitle'),
    description: (t) => t('profile.certifications.pageSubtitle'),
    addButtonLabel: (t) => t('profile.certifications.addButton'),
    hasAIFeatures: true,
    // AIDialogComponent will be added in Phase 3
  },
  skills: {
    section: 'skills',
    ManagerComponent: SkillsManager,
    title: (t) => t('profile.skills.pageTitle'),
    description: (t) => t('profile.skills.pageSubtitle'),
    addButtonLabel: (t) => t('profile.skills.addButton'),
    hasAIFeatures: false,
  },
  highlights: {
    section: 'highlights',
    ManagerComponent: HighlightsManager,
    title: (t) => t('profile.highlights.pageTitle'),
    description: (t) => t('profile.highlights.pageSubtitle'),
    addButtonLabel: (t) => t('profile.highlights.addButton'),
    hasAIFeatures: false,
  },
  projects: {
    section: 'projects',
    ManagerComponent: ProjectsManager,
    title: (t) => t('profile.projects.pageTitle'),
    description: (t) => t('profile.projects.pageSubtitle'),
    addButtonLabel: (t) => t('profile.projects.addButton'),
    hasAIFeatures: false,
  },
  'key-competences': {
    section: 'key-competences',
    ManagerComponent: KeyCompetencesManager,
    title: (t) => t('profile.keyCompetences.pageTitle'),
    description: (t) => t('profile.keyCompetences.pageSubtitle'),
    addButtonLabel: (t) => t('profile.keyCompetences.addButton'),
    hasAIFeatures: false,
  },
  // Note: motivation-vision and import-cv will be added later as they have different patterns
  'motivation-vision': {
    section: 'motivation-vision',
    // Placeholder - will be implemented when we handle form-based (not list-based) managers
    ManagerComponent: EducationManager as ComponentType<ManagerProps>,
    title: (t) => t('profile.motivationVision.pageTitle'),
    description: (t) => t('profile.motivationVision.pageSubtitle'),
    hasAIFeatures: false,
  },
  'import-cv': {
    section: 'import-cv',
    // Placeholder - import-cv is a workflow, not a CRUD manager
    ManagerComponent: EducationManager as ComponentType<ManagerProps>,
    title: (_t) => 'Import CV',
    description: (_t) => 'Import your CV from a file',
    hasAIFeatures: true,
  },
};

/**
 * Get registry entry for a profile section
 */
export function getProfileModalEntry(section: ProfileSection): ProfileModalRegistryEntry | null {
  return PROFILE_MODAL_REGISTRY[section] || null;
}

/**
 * Get all available profile sections
 */
export function getAllProfileSections(): ProfileSection[] {
  return Object.keys(PROFILE_MODAL_REGISTRY) as ProfileSection[];
}
