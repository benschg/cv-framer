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

// Insert types (what you pass to INSERT queries)
export type ProfileWorkExperienceInsert = Tables['profile_work_experiences']['Insert'];
export type ProfileEducationInsert = Tables['profile_educations']['Insert'];
export type ProfileSkillCategoryInsert = Tables['profile_skill_categories']['Insert'];
export type ProfileCertificationInsert = Tables['profile_certifications']['Insert'];
export type ProfileReferenceInsert = Tables['profile_references']['Insert'];

// Update types (what you pass to UPDATE queries)
export type ProfileWorkExperienceUpdate = Tables['profile_work_experiences']['Update'];
export type ProfileEducationUpdate = Tables['profile_educations']['Update'];
export type ProfileSkillCategoryUpdate = Tables['profile_skill_categories']['Update'];
export type ProfileCertificationUpdate = Tables['profile_certifications']['Update'];
export type ProfileReferenceUpdate = Tables['profile_references']['Update'];

// Helper type for creating new entries (omits auto-generated fields)
export type NewProfileWorkExperience = Omit<ProfileWorkExperience, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type NewProfileEducation = Omit<ProfileEducation, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type NewProfileSkillCategory = Omit<ProfileSkillCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type NewProfileCertification = Omit<ProfileCertification, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type NewProfileReference = Omit<ProfileReference, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
