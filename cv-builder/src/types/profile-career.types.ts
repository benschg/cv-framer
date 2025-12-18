/**
 * Profile Career Data Types
 *
 * Type-safe interfaces for profile career data, derived from Supabase schema.
 * These types provide better IDE support and compile-time safety.
 */

import { Database } from './database.types';

// Extract table types from generated Database type
type Tables = Database['public']['Tables'];

// Row types (what you get from SELECT queries)
export type ProfileWorkExperience = Tables['profile_work_experiences']['Row'];
export type ProfileEducation = Tables['profile_educations']['Row'];
export type ProfileSkillCategory = Tables['profile_skill_categories']['Row'];
export type ProfileCertification = Tables['profile_certifications']['Row'];
export type ProfileReference = Tables['profile_references']['Row'];
export type CertificationDocument = Tables['certification_documents']['Row'];

// NEW: Motivation & Vision, Highlights, Projects types
export type ProfileMotivationVision = Tables['profile_motivation_vision']['Row'];
export type ProfileHighlight = Tables['profile_highlights']['Row'];
export type ProfileProject = Tables['profile_projects']['Row'];

// CV Work Experience Selection (junction table for per-CV customization)
export type CVWorkExperienceSelection = Tables['cv_work_experience_selections']['Row'];
export type CVWorkExperienceSelectionInsert = Tables['cv_work_experience_selections']['Insert'];
export type CVWorkExperienceSelectionUpdate = Tables['cv_work_experience_selections']['Update'];

// CV Education Selection (junction table for per-CV customization)
export type CVEducationSelection = Tables['cv_education_selections']['Row'];
export type CVEducationSelectionInsert = Tables['cv_education_selections']['Insert'];
export type CVEducationSelectionUpdate = Tables['cv_education_selections']['Update'];

// CV Skill Category Selection (junction table for per-CV customization)
export type CVSkillCategorySelection = Tables['cv_skill_category_selections']['Row'];
export type CVSkillCategorySelectionInsert = Tables['cv_skill_category_selections']['Insert'];
export type CVSkillCategorySelectionUpdate = Tables['cv_skill_category_selections']['Update'];

// CV Key Competence Selection (junction table for per-CV customization)
export type CVKeyCompetenceSelection = Tables['cv_key_competence_selections']['Row'];
export type CVKeyCompetenceSelectionInsert = Tables['cv_key_competence_selections']['Insert'];
export type CVKeyCompetenceSelectionUpdate = Tables['cv_key_competence_selections']['Update'];

// CV Project Selection (junction table for per-CV customization)
export type CVProjectSelection = Tables['cv_project_selections']['Row'];
export type CVProjectSelectionInsert = Tables['cv_project_selections']['Insert'];
export type CVProjectSelectionUpdate = Tables['cv_project_selections']['Update'];

// Display modes for work experience in CV
export type WorkExperienceDisplayMode = 'simple' | 'with_description' | 'custom';

// Composite type for CV editor: work experience merged with CV-specific selection
export interface CVWorkExperienceWithSelection {
  // From profile_work_experiences
  id: string;
  company: string;
  title: string;
  location: string | null;
  start_date: string;
  end_date: string | null;
  current: boolean | null;
  description: string | null;
  bullets: string[] | null;
  display_order: number | null;

  // From cv_work_experience_selections (or defaults if no selection exists)
  selection: {
    id?: string; // undefined if no selection record exists yet
    is_selected: boolean;
    is_favorite: boolean;
    display_order: number;
    display_mode: WorkExperienceDisplayMode; // simple, with_description, or custom
    description_override: string | null;
    selected_bullet_indices: number[] | null; // null means all bullets
  };
}

// Manual type for profile_key_competences (pending database.types.ts regeneration)
export interface ProfileKeyCompetence {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}

// Composite type for CV editor: education merged with CV-specific selection
export interface CVEducationWithSelection {
  // From profile_educations
  id: string;
  institution: string;
  degree: string;
  field: string | null;
  start_date: string;
  end_date: string | null;
  description: string | null;
  grade: string | null;
  display_order: number | null;

  // From cv_education_selections (or defaults if no selection exists)
  selection: {
    id?: string;
    is_selected: boolean;
    is_favorite: boolean;
    display_order: number;
    description_override: string | null;
  };
}

// Composite type for CV editor: skill category merged with CV-specific selection
export interface CVSkillCategoryWithSelection {
  // From profile_skill_categories
  id: string;
  category: string;
  skills: string[];
  display_order: number | null;

  // From cv_skill_category_selections (or defaults if no selection exists)
  selection: {
    id?: string;
    is_selected: boolean;
    is_favorite: boolean;
    display_order: number;
    selected_skill_indices: number[] | null; // null means all skills
  };
}

// Composite type for CV editor: key competence merged with CV-specific selection
export interface CVKeyCompetenceWithSelection {
  // From profile_key_competences
  id: string;
  title: string;
  description: string | null;
  display_order: number | null;

  // From cv_key_competence_selections (or defaults if no selection exists)
  selection: {
    id?: string;
    is_selected: boolean;
    is_favorite: boolean;
    display_order: number;
    description_override: string | null;
  };
}

// Composite type for CV editor: project merged with CV-specific selection
export interface CVProjectWithSelection {
  // From profile_projects
  id: string;
  name: string;
  description: string | null;
  role: string | null;
  technologies: string[] | null;
  url: string | null;
  start_date: string | null;
  end_date: string | null;
  current: boolean | null;
  outcome: string | null;
  display_order: number | null;

  // From cv_project_selections (or defaults if no selection exists)
  selection: {
    id?: string;
    is_selected: boolean;
    is_favorite: boolean;
    display_order: number;
    description_override: string | null;
  };
}

// Insert types (what you pass to INSERT queries)
export type ProfileWorkExperienceInsert = Tables['profile_work_experiences']['Insert'];
export type ProfileEducationInsert = Tables['profile_educations']['Insert'];
export type ProfileSkillCategoryInsert = Tables['profile_skill_categories']['Insert'];
export type ProfileCertificationInsert = Tables['profile_certifications']['Insert'];
export type ProfileReferenceInsert = Tables['profile_references']['Insert'];
export type CertificationDocumentInsert = Tables['certification_documents']['Insert'];

// NEW: Insert types for new profile tables
export type ProfileMotivationVisionInsert = Tables['profile_motivation_vision']['Insert'];
export type ProfileHighlightInsert = Tables['profile_highlights']['Insert'];
export type ProfileProjectInsert = Tables['profile_projects']['Insert'];

// Update types (what you pass to UPDATE queries)
export type ProfileWorkExperienceUpdate = Tables['profile_work_experiences']['Update'];
export type ProfileEducationUpdate = Tables['profile_educations']['Update'];
export type ProfileSkillCategoryUpdate = Tables['profile_skill_categories']['Update'];
export type ProfileCertificationUpdate = Tables['profile_certifications']['Update'];
export type ProfileReferenceUpdate = Tables['profile_references']['Update'];
export type CertificationDocumentUpdate = Tables['certification_documents']['Update'];

// NEW: Update types for new profile tables
export type ProfileMotivationVisionUpdate = Tables['profile_motivation_vision']['Update'];
export type ProfileHighlightUpdate = Tables['profile_highlights']['Update'];
export type ProfileProjectUpdate = Tables['profile_projects']['Update'];

// Helper type for creating new entries (omits auto-generated fields)
export type NewProfileWorkExperience = Omit<
  ProfileWorkExperience,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;
export type NewProfileEducation = Omit<
  ProfileEducation,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;
export type NewProfileSkillCategory = Omit<
  ProfileSkillCategory,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;
export type NewProfileCertification = Omit<
  ProfileCertification,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;
export type NewProfileReference = Omit<
  ProfileReference,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;
export type NewProfileKeyCompetence = Omit<
  ProfileKeyCompetence,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;
export type NewCertificationDocument = Omit<
  CertificationDocument,
  'id' | 'user_id' | 'uploaded_at'
>;

// NEW: Helper types for new profile tables
export type NewProfileMotivationVision = Omit<
  ProfileMotivationVision,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;
export type NewProfileHighlight = Omit<
  ProfileHighlight,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;
export type NewProfileProject = Omit<
  ProfileProject,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

// Type alias for highlight types
export type HighlightType = 'highlight' | 'achievement' | 'mehrwert' | 'usp';
