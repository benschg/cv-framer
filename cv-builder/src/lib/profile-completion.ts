/**
 * Profile Completion Calculator
 * Calculates completion percentages for each profile section
 */

import type {
  ProfileCertification,
  ProfileEducation,
  ProfileHighlight,
  ProfileKeyCompetence,
  ProfileMotivationVision,
  ProfileProject,
  ProfileReference,
  ProfileSkillCategory,
  ProfileWorkExperience,
} from '@/types/profile-career.types';

export interface ProfileSectionData {
  motivationVision: ProfileMotivationVision | null;
  highlights: ProfileHighlight[];
  projects: ProfileProject[];
  workExperiences: ProfileWorkExperience[];
  educations: ProfileEducation[];
  skills: ProfileSkillCategory[];
  keyCompetences: ProfileKeyCompetence[];
  certifications: ProfileCertification[];
  references: ProfileReference[];
}

export interface SectionCompletion {
  key: string;
  labelKey: string;
  href: string;
  count: number;
  isComplete: boolean;
  percentage: number;
}

export interface ProfileCompletion {
  sections: SectionCompletion[];
  totalPercentage: number;
  completedSections: number;
  totalSections: number;
  /** Map of href to completion status for sidebar */
  completionByHref: Record<string, { isComplete: boolean; count: number }>;
}

// Define the profile sections with their translation keys and hrefs
export const PROFILE_SECTIONS = [
  { key: 'motivationVision', labelKey: 'motivationVision', href: '/profile/motivation-vision' },
  { key: 'highlights', labelKey: 'highlights', href: '/profile/highlights' },
  { key: 'projects', labelKey: 'projects', href: '/profile/projects' },
  { key: 'workExperiences', labelKey: 'workExperience', href: '/profile/experience' },
  { key: 'educations', labelKey: 'education', href: '/profile/education' },
  { key: 'skills', labelKey: 'skills', href: '/profile/skills' },
  { key: 'keyCompetences', labelKey: 'keyCompetences', href: '/profile/key-competences' },
  { key: 'certifications', labelKey: 'certifications', href: '/profile/certifications' },
  { key: 'references', labelKey: 'references', href: '/profile/references' },
] as const;

/**
 * Check if motivation/vision section has meaningful content
 */
function isMotivationVisionComplete(data: ProfileMotivationVision | null): boolean {
  if (!data) return false;
  // Consider complete if at least vision, mission, or career goals are filled
  return Boolean(data.vision || data.mission || data.career_goals);
}

/**
 * Calculate profile completion for each section
 */
export function calculateProfileCompletion(data: ProfileSectionData): ProfileCompletion {
  const sections: SectionCompletion[] = PROFILE_SECTIONS.map((section) => {
    let count = 0;
    let isComplete = false;

    switch (section.key) {
      case 'motivationVision':
        isComplete = isMotivationVisionComplete(data.motivationVision);
        count = isComplete ? 1 : 0;
        break;
      case 'highlights':
        count = data.highlights.length;
        isComplete = count > 0;
        break;
      case 'projects':
        count = data.projects.length;
        isComplete = count > 0;
        break;
      case 'workExperiences':
        count = data.workExperiences.length;
        isComplete = count > 0;
        break;
      case 'educations':
        count = data.educations.length;
        isComplete = count > 0;
        break;
      case 'skills':
        count = data.skills.length;
        isComplete = count > 0;
        break;
      case 'keyCompetences':
        count = data.keyCompetences.length;
        isComplete = count > 0;
        break;
      case 'certifications':
        count = data.certifications.length;
        isComplete = count > 0;
        break;
      case 'references':
        count = data.references.length;
        isComplete = count > 0;
        break;
    }

    return {
      key: section.key,
      labelKey: section.labelKey,
      href: section.href,
      count,
      isComplete,
      percentage: isComplete ? 100 / PROFILE_SECTIONS.length : 0,
    };
  });

  const completedSections = sections.filter((s) => s.isComplete).length;
  const totalPercentage = Math.round((completedSections / PROFILE_SECTIONS.length) * 100);

  // Create a map of href to completion status for easy lookup in sidebar
  const completionByHref: Record<string, { isComplete: boolean; count: number }> = {};
  sections.forEach((section) => {
    completionByHref[section.href] = {
      isComplete: section.isComplete,
      count: section.count,
    };
  });

  return {
    sections,
    totalPercentage,
    completedSections,
    totalSections: PROFILE_SECTIONS.length,
    completionByHref,
  };
}
