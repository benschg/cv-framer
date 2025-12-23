/**
 * Centralized Profile Data Service
 * Single source of truth for accessing all profile section data and completion tracking
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

import type { UserProfile } from './user-profile.service';

export interface ProfileSectionInfo<T = unknown> {
  data: T;
  count: number;
  error?: string;
}

export interface ProfileDataResponse {
  sections: {
    motivationVision: ProfileSectionInfo<ProfileMotivationVision | null>;
    highlights: ProfileSectionInfo<ProfileHighlight[]>;
    projects: ProfileSectionInfo<ProfileProject[]>;
    workExperiences: ProfileSectionInfo<ProfileWorkExperience[]>;
    educations: ProfileSectionInfo<ProfileEducation[]>;
    skillCategories: ProfileSectionInfo<ProfileSkillCategory[]>;
    keyCompetences: ProfileSectionInfo<ProfileKeyCompetence[]>;
    certifications: ProfileSectionInfo<ProfileCertification[]>;
    references: ProfileSectionInfo<ProfileReference[]>;
  };
  profile: {
    data: UserProfile | null;
    error?: string;
  };
}

export interface ProfileDataServiceResponse {
  data: ProfileDataResponse | null;
  error: string | null;
}

/**
 * Section metadata for easy reference
 */
export const PROFILE_SECTIONS_METADATA = {
  motivationVision: {
    key: 'motivationVision',
    name: 'Motivation & Vision',
    href: '/profile/motivation-vision',
    translationKey: 'profile.motivationVision',
    required: false,
  },
  highlights: {
    key: 'highlights',
    name: 'Highlights',
    href: '/profile/highlights',
    translationKey: 'profile.highlights',
    required: false,
  },
  projects: {
    key: 'projects',
    name: 'Projects',
    href: '/profile/projects',
    translationKey: 'profile.projects',
    required: false,
  },
  workExperiences: {
    key: 'workExperiences',
    name: 'Work Experience',
    href: '/profile/experience',
    translationKey: 'profile.workExperience',
    required: true,
  },
  educations: {
    key: 'educations',
    name: 'Education',
    href: '/profile/education',
    translationKey: 'profile.education',
    required: true,
  },
  skillCategories: {
    key: 'skillCategories',
    name: 'Skills',
    href: '/profile/skills',
    translationKey: 'profile.skills',
    required: true,
  },
  keyCompetences: {
    key: 'keyCompetences',
    name: 'Key Competences',
    href: '/profile/key-competences',
    translationKey: 'profile.keyCompetences',
    required: false,
  },
  certifications: {
    key: 'certifications',
    name: 'Certifications',
    href: '/profile/certifications',
    translationKey: 'profile.certifications',
    required: false,
  },
  references: {
    key: 'references',
    name: 'References',
    href: '/profile/references',
    translationKey: 'profile.references',
    required: false,
  },
} as const;

export type ProfileSectionKey = keyof typeof PROFILE_SECTIONS_METADATA;

/**
 * Fetch all profile data in a single optimized request
 */
export async function fetchAllProfileData(): Promise<ProfileDataServiceResponse> {
  try {
    const response = await fetch('/api/profile-data', {
      cache: 'no-store',
    });

    if (!response.ok) {
      const json = await response.json();
      return { data: null, error: json.error || 'Failed to fetch profile data' };
    }

    const data = await response.json();
    return { data, error: null };
  } catch (error) {
    console.error('fetchAllProfileData error:', error);
    return { data: null, error: 'Network error' };
  }
}

/**
 * Calculate completion percentage for a specific section
 */
export function getSectionCompletion(
  sectionKey: ProfileSectionKey,
  data: ProfileDataResponse
): {
  isComplete: boolean;
  count: number;
  percentage: number;
} {
  const section = data.sections[sectionKey];
  const count = section.count;
  let isComplete = false;

  // Special handling for motivationVision
  if (sectionKey === 'motivationVision') {
    const mv = section.data as ProfileMotivationVision | null;
    isComplete = Boolean(mv && (mv.vision || mv.mission || mv.career_goals));
  } else {
    isComplete = count > 0;
  }

  return {
    isComplete,
    count,
    percentage: isComplete ? 100 : 0,
  };
}

/**
 * Calculate overall profile completion
 */
export function calculateOverallCompletion(data: ProfileDataResponse): {
  overallPercentage: number;
  completedSections: number;
  totalSections: number;
  requiredComplete: boolean;
  sections: Array<{
    key: ProfileSectionKey;
    name: string;
    href: string;
    count: number;
    isComplete: boolean;
    required: boolean;
  }>;
} {
  const sections = Object.keys(PROFILE_SECTIONS_METADATA).map((key) => {
    const sectionKey = key as ProfileSectionKey;
    const metadata = PROFILE_SECTIONS_METADATA[sectionKey];
    const completion = getSectionCompletion(sectionKey, data);

    return {
      key: sectionKey,
      name: metadata.name,
      href: metadata.href,
      count: completion.count,
      isComplete: completion.isComplete,
      required: metadata.required,
    };
  });

  const totalSections = sections.length;
  const completedSections = sections.filter((s) => s.isComplete).length;
  const overallPercentage = Math.round((completedSections / totalSections) * 100);

  const requiredSections = sections.filter((s) => s.required);
  const requiredComplete = requiredSections.every((s) => s.isComplete);

  return {
    overallPercentage,
    completedSections,
    totalSections,
    requiredComplete,
    sections,
  };
}

/**
 * Get completion status for a specific section by href
 */
export function getSectionCompletionByHref(
  href: string,
  data: ProfileDataResponse
): { isComplete: boolean; count: number } | null {
  const section = Object.values(PROFILE_SECTIONS_METADATA).find((s) => s.href === href);
  if (!section) return null;

  const completion = getSectionCompletion(section.key as ProfileSectionKey, data);
  return {
    isComplete: completion.isComplete,
    count: completion.count,
  };
}
