/**
 * Profile Career Data Service
 * Manages user's master career information (work experience, education, skills, certifications, references)
 * with auto-save functionality
 *
 * Uses auto-generated types from Supabase schema for type safety.
 */

import { createClient } from '@/lib/supabase/client';
import type { Certification, Reference } from '@/types/cv.types';
import type {
  ProfileWorkExperience,
  ProfileEducation,
  ProfileSkillCategory,
  ProfileCertification,
  ProfileReference,
  ProfileKeyCompetence,
} from '@/types/profile-career.types';

const supabase = createClient();

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the current authenticated user ID
 */
async function getCurrentUserId(): Promise<{ userId: string | null; error: any }> {
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error) {
    return { userId: null, error };
  }

  if (!user) {
    return { userId: null, error: { message: 'User not authenticated' } };
  }

  return { userId: user.id, error: null };
}

/**
 * Generic fetch function for profile data
 */
async function fetchProfileData<T>(
  table: string,
  orderBy: { column: string; ascending: boolean }[]
): Promise<{ data: T[] | null; error: any }> {
  let query = supabase.from(table).select('*');

  // Apply ordering
  orderBy.forEach(({ column, ascending }) => {
    query = query.order(column, { ascending });
  });

  const { data, error } = await query;
  return { data, error };
}

/**
 * Generic create function for profile data
 */
async function createProfileData<T>(
  table: string,
  data: Omit<T, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ data: T | null; error: any }> {
  const { userId, error: authError } = await getCurrentUserId();

  if (authError || !userId) {
    return { data: null, error: authError };
  }

  const { data: result, error } = await supabase
    .from(table)
    .insert([{ ...data, user_id: userId }])
    .select()
    .single();

  return { data: result, error };
}

/**
 * Generic update function for profile data
 */
async function updateProfileData<T>(
  table: string,
  id: string,
  updates: Partial<Omit<T, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: T | null; error: any }> {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

/**
 * Generic delete function for profile data
 */
async function deleteProfileData(
  table: string,
  id: string
): Promise<{ error: any }> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  return { error };
}

/**
 * Generic auto-save wrapper with debouncing
 */
function createAutoSave<T>(
  updateFn: (id: string, updates: Partial<T>) => Promise<{ data: T | null; error: any }>,
  resourceType: string,
  delay: number = 1000
) {
  return (id: string, updates: Partial<T>) => {
    const debouncedSave = debounce(
      `${resourceType}-${id}`,
      async () => {
        const { error } = await updateFn(id, updates);
        if (error) {
          console.error(`Auto-save ${resourceType} failed:`, error);
        }
      },
      delay
    );

    debouncedSave();
  };
}

// ============================================
// RE-EXPORT TYPES
// ============================================

// Re-export types for convenience
export type {
  ProfileWorkExperience,
  ProfileEducation,
  ProfileSkillCategory,
  ProfileCertification,
  ProfileReference,
  ProfileKeyCompetence,
} from '@/types/profile-career.types';

// Debounce utility for auto-save
const debounceTimers = new Map<string, NodeJS.Timeout>();

export function debounce<T extends (...args: any[]) => any>(
  key: string,
  fn: T,
  delay: number = 1000
): (...args: Parameters<T>) => void {
  return (...args: Parameters<T>) => {
    const existingTimer = debounceTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      fn(...args);
      debounceTimers.delete(key);
    }, delay);

    debounceTimers.set(key, timer);
  };
}

// ============================================
// WORK EXPERIENCE
// ============================================

export async function fetchWorkExperiences(): Promise<{ data: ProfileWorkExperience[] | null; error: any }> {
  return fetchProfileData<ProfileWorkExperience>('profile_work_experiences', [
    { column: 'display_order', ascending: true },
    { column: 'start_date', ascending: false },
  ]);
}

export async function createWorkExperience(
  experience: Omit<ProfileWorkExperience, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ data: ProfileWorkExperience | null; error: any }> {
  return createProfileData<ProfileWorkExperience>('profile_work_experiences', experience);
}

export async function updateWorkExperience(
  id: string,
  updates: Partial<Omit<ProfileWorkExperience, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ProfileWorkExperience | null; error: any }> {
  return updateProfileData<ProfileWorkExperience>('profile_work_experiences', id, updates);
}

export async function deleteWorkExperience(id: string): Promise<{ error: any }> {
  return deleteProfileData('profile_work_experiences', id);
}

export const autoSaveWorkExperience = createAutoSave<ProfileWorkExperience>(
  updateWorkExperience,
  'work-experience'
);

// ============================================
// EDUCATION
// ============================================

export async function fetchEducations(): Promise<{ data: ProfileEducation[] | null; error: any }> {
  return fetchProfileData<ProfileEducation>('profile_educations', [
    { column: 'display_order', ascending: true },
    { column: 'start_date', ascending: false },
  ]);
}

export async function createEducation(
  education: Omit<ProfileEducation, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ data: ProfileEducation | null; error: any }> {
  return createProfileData<ProfileEducation>('profile_educations', education);
}

export async function updateEducation(
  id: string,
  updates: Partial<Omit<ProfileEducation, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ProfileEducation | null; error: any }> {
  return updateProfileData<ProfileEducation>('profile_educations', id, updates);
}

export async function deleteEducation(id: string): Promise<{ error: any }> {
  return deleteProfileData('profile_educations', id);
}

export const autoSaveEducation = createAutoSave<ProfileEducation>(
  updateEducation,
  'education'
);

// ============================================
// SKILL CATEGORIES
// ============================================

export async function fetchSkillCategories(): Promise<{ data: ProfileSkillCategory[] | null; error: any }> {
  return fetchProfileData<ProfileSkillCategory>('profile_skill_categories', [
    { column: 'display_order', ascending: true },
  ]);
}

export async function createSkillCategory(
  category: Omit<ProfileSkillCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ data: ProfileSkillCategory | null; error: any }> {
  return createProfileData<ProfileSkillCategory>('profile_skill_categories', category);
}

export async function updateSkillCategory(
  id: string,
  updates: Partial<Omit<ProfileSkillCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ProfileSkillCategory | null; error: any }> {
  return updateProfileData<ProfileSkillCategory>('profile_skill_categories', id, updates);
}

export async function deleteSkillCategory(id: string): Promise<{ error: any }> {
  return deleteProfileData('profile_skill_categories', id);
}

export const autoSaveSkillCategory = createAutoSave<ProfileSkillCategory>(
  updateSkillCategory,
  'skill-category'
);

// ============================================
// KEY COMPETENCES
// ============================================

export async function fetchKeyCompetences(): Promise<{ data: ProfileKeyCompetence[] | null; error: any }> {
  return fetchProfileData<ProfileKeyCompetence>('profile_key_competences', [
    { column: 'display_order', ascending: true },
  ]);
}

export async function createKeyCompetence(
  competence: Omit<ProfileKeyCompetence, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ data: ProfileKeyCompetence | null; error: any }> {
  return createProfileData<ProfileKeyCompetence>('profile_key_competences', competence);
}

export async function updateKeyCompetence(
  id: string,
  updates: Partial<Omit<ProfileKeyCompetence, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ProfileKeyCompetence | null; error: any }> {
  return updateProfileData<ProfileKeyCompetence>('profile_key_competences', id, updates);
}

export async function deleteKeyCompetence(id: string): Promise<{ error: any }> {
  return deleteProfileData('profile_key_competences', id);
}

export const autoSaveKeyCompetence = createAutoSave<ProfileKeyCompetence>(
  updateKeyCompetence,
  'key-competence'
);

// ============================================
// CERTIFICATIONS
// ============================================

export async function fetchCertifications(): Promise<{ data: ProfileCertification[] | null; error: any }> {
  return fetchProfileData<ProfileCertification>('profile_certifications', [
    { column: 'display_order', ascending: true },
    { column: 'date', ascending: false },
  ]);
}

export async function createCertification(
  certification: Omit<ProfileCertification, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ data: ProfileCertification | null; error: any }> {
  return createProfileData<ProfileCertification>('profile_certifications', certification);
}

export async function updateCertification(
  id: string,
  updates: Partial<Omit<ProfileCertification, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ProfileCertification | null; error: any }> {
  return updateProfileData<ProfileCertification>('profile_certifications', id, updates);
}

export async function deleteCertification(id: string): Promise<{ error: any }> {
  // Delete associated document if exists
  const { data: cert } = await supabase
    .from('profile_certifications')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (cert?.storage_path) {
    await supabase.storage
      .from('certification-documents')
      .remove([cert.storage_path]);
  }

  return deleteProfileData('profile_certifications', id);
}

export const autoSaveCertification = createAutoSave<ProfileCertification>(
  updateCertification,
  'certification'
);

// Upload certification document
export async function uploadCertificationDocument(
  userId: string,
  certificationId: string,
  file: File
): Promise<{ data: { url: string; path: string } | null; error: any }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${certificationId}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('certification-documents')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('certification-documents')
    .getPublicUrl(filePath);

  return {
    data: { url: publicUrl, path: filePath },
    error: null,
  };
}

// Delete certification document
export async function deleteCertificationDocument(storagePath: string): Promise<{ error: any }> {
  const { error } = await supabase.storage
    .from('certification-documents')
    .remove([storagePath]);

  return { error };
}

// ============================================
// REFERENCES
// ============================================

export async function fetchReferences(): Promise<{ data: ProfileReference[] | null; error: any }> {
  return fetchProfileData<ProfileReference>('profile_references', [
    { column: 'display_order', ascending: true },
  ]);
}

export async function createReference(
  reference: Omit<ProfileReference, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ data: ProfileReference | null; error: any }> {
  return createProfileData<ProfileReference>('profile_references', reference);
}

export async function updateReference(
  id: string,
  updates: Partial<Omit<ProfileReference, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ProfileReference | null; error: any }> {
  return updateProfileData<ProfileReference>('profile_references', id, updates);
}

export async function deleteReference(id: string): Promise<{ error: any }> {
  // Delete associated document if exists
  const { data: ref } = await supabase
    .from('profile_references')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (ref?.storage_path) {
    await supabase.storage
      .from('reference-letters')
      .remove([ref.storage_path]);
  }

  return deleteProfileData('profile_references', id);
}

export const autoSaveReference = createAutoSave<ProfileReference>(
  updateReference,
  'reference'
);

// Upload reference letter
export async function uploadReferenceLetter(
  userId: string,
  referenceId: string,
  file: File
): Promise<{ data: { url: string; path: string } | null; error: any }> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${referenceId}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('reference-letters')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  const { data: { publicUrl } } = supabase.storage
    .from('reference-letters')
    .getPublicUrl(filePath);

  return {
    data: { url: publicUrl, path: filePath },
    error: null,
  };
}

// Delete reference letter
export async function deleteReferenceLetter(storagePath: string): Promise<{ error: any }> {
  const { error } = await supabase.storage
    .from('reference-letters')
    .remove([storagePath]);

  return { error };
}

// ============================================
// CONVERSION UTILITIES
// ============================================

/**
 * Convert ProfileCertification to CV Certification format
 * Converts null values to undefined for CV types
 */
export function convertToCertification(profile: ProfileCertification): Certification {
  return {
    id: profile.id,
    name: profile.name,
    issuer: profile.issuer,
    date: profile.date ?? undefined,
    expiryDate: profile.expiry_date ?? undefined,
    url: profile.url ?? undefined,
    credentialId: profile.credential_id ?? undefined,
    documentUrl: profile.document_url ?? undefined,
    documentName: profile.document_name ?? undefined,
  };
}

/**
 * Convert ProfileReference to CV Reference format
 * Converts null values to undefined for CV types
 */
export function convertToReference(profile: ProfileReference): Reference {
  return {
    id: profile.id,
    name: profile.name,
    title: profile.title,
    company: profile.company,
    relationship: profile.relationship ?? undefined,
    email: profile.email ?? undefined,
    phone: profile.phone ?? undefined,
    quote: profile.quote ?? undefined,
    linkedPosition: profile.linked_position ?? undefined,
    documentUrl: profile.document_url ?? undefined,
    documentName: profile.document_name ?? undefined,
  };
}
