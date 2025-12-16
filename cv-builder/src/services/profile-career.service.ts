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
  ProfileMotivationVision,
  ProfileHighlight,
  ProfileProject,
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
  ProfileMotivationVision,
  ProfileHighlight,
  ProfileProject,
  HighlightType,
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
// CERTIFICATION DOCUMENTS (Multiple per certification)
// ============================================

// Fetch all documents for a certification
export async function fetchCertificationDocuments(
  certificationId: string
): Promise<{ data: any[] | null; error: any }> {
  const { data, error } = await supabase
    .from('certification_documents')
    .select('*')
    .eq('certification_id', certificationId)
    .order('display_order', { ascending: true });

  if (error || !data) {
    return { data, error };
  }

  // Generate signed URLs for each document (valid for 1 hour)
  const documentsWithSignedUrls = await Promise.all(
    data.map(async (doc) => {
      const { data: signedUrlData } = await supabase.storage
        .from('certification-documents')
        .createSignedUrl(doc.storage_path, 3600); // 1 hour expiry

      return {
        ...doc,
        document_url: signedUrlData?.signedUrl || doc.document_url,
      };
    })
  );

  return { data: documentsWithSignedUrls, error: null };
}

// Create certification document
export async function createCertificationDocument(
  certificationId: string,
  file: File
): Promise<{ data: any | null; error: any }> {
  const { userId, error: userError } = await getCurrentUserId();
  if (userError || !userId) {
    return { data: null, error: userError || { message: 'User not authenticated' } };
  }

  // Upload file to storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${certificationId}_${Date.now()}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('certification-documents')
    .upload(filePath, file, { upsert: false });

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  // Generate a signed URL (valid for 1 hour)
  const { data: signedUrlData } = await supabase.storage
    .from('certification-documents')
    .createSignedUrl(filePath, 3600);

  // Create document record with signed URL
  const { data, error } = await supabase
    .from('certification_documents')
    .insert({
      certification_id: certificationId,
      user_id: userId,
      document_url: signedUrlData?.signedUrl || '', // Temporary signed URL
      document_name: file.name,
      storage_path: filePath,
      file_type: file.type,
      file_size: file.size,
    })
    .select()
    .single();

  return { data, error };
}

// Delete certification document
export async function deleteCertificationDocumentRecord(
  documentId: string,
  storagePath: string
): Promise<{ error: any }> {
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('certification-documents')
    .remove([storagePath]);

  if (storageError) {
    return { error: storageError };
  }

  // Delete database record
  const { error } = await supabase
    .from('certification_documents')
    .delete()
    .eq('id', documentId);

  return { error };
}

// ============================================
// REFERENCES
// ============================================

export async function fetchReferences(): Promise<{ data: ProfileReference[] | null; error: any }> {
  const result = await fetchProfileData<ProfileReference>('profile_references', [
    { column: 'display_order', ascending: true },
  ]);

  if (result.error || !result.data) {
    return result;
  }

  // Generate signed URLs for reference documents with storage paths
  const referencesWithSignedUrls = await Promise.all(
    result.data.map(async (reference) => {
      if (reference.storage_path) {
        const { data: signedUrlData } = await supabase.storage
          .from('reference-letters')
          .createSignedUrl(reference.storage_path, 3600); // 1 hour expiry

        return {
          ...reference,
          document_url: signedUrlData?.signedUrl || reference.document_url,
        };
      }
      return reference;
    })
  );

  return { data: referencesWithSignedUrls, error: null };
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

  // Generate a signed URL (valid for 1 hour)
  const { data: signedUrlData } = await supabase.storage
    .from('reference-letters')
    .createSignedUrl(filePath, 3600);

  return {
    data: { url: signedUrlData?.signedUrl || '', path: filePath },
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

// ============================================
// BULK IMPORT (for CV upload)
// ============================================

/**
 * Bulk create work experiences from CV import
 * Automatically assigns display_order based on existing count
 */
export async function bulkCreateWorkExperiences(
  experiences: Array<Omit<ProfileWorkExperience, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_order'>>
): Promise<{ data: ProfileWorkExperience[] | null; error: any }> {
  const { userId, error: authError } = await getCurrentUserId();
  if (authError || !userId) {
    return { data: null, error: authError };
  }

  // Get current count for display_order offset
  const { data: existing } = await fetchWorkExperiences();
  const startOrder = existing?.length || 0;

  // Add user_id and display_order to each item
  const itemsToInsert = experiences.map((exp, idx) => ({
    ...exp,
    user_id: userId,
    display_order: startOrder + idx,
  }));

  const { data, error } = await supabase
    .from('profile_work_experiences')
    .insert(itemsToInsert)
    .select();

  return { data, error };
}

/**
 * Bulk create educations from CV import
 * Automatically assigns display_order based on existing count
 */
export async function bulkCreateEducations(
  educations: Array<Omit<ProfileEducation, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_order'>>
): Promise<{ data: ProfileEducation[] | null; error: any }> {
  const { userId, error: authError } = await getCurrentUserId();
  if (authError || !userId) {
    return { data: null, error: authError };
  }

  const { data: existing } = await fetchEducations();
  const startOrder = existing?.length || 0;

  const itemsToInsert = educations.map((edu, idx) => ({
    ...edu,
    user_id: userId,
    display_order: startOrder + idx,
  }));

  const { data, error } = await supabase
    .from('profile_educations')
    .insert(itemsToInsert)
    .select();

  return { data, error };
}

/**
 * Bulk create skill categories from CV import
 * Automatically assigns display_order based on existing count
 */
export async function bulkCreateSkillCategories(
  categories: Array<Omit<ProfileSkillCategory, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_order'>>
): Promise<{ data: ProfileSkillCategory[] | null; error: any }> {
  const { userId, error: authError } = await getCurrentUserId();
  if (authError || !userId) {
    return { data: null, error: authError };
  }

  const { data: existing } = await fetchSkillCategories();
  const startOrder = existing?.length || 0;

  const itemsToInsert = categories.map((cat, idx) => ({
    ...cat,
    user_id: userId,
    display_order: startOrder + idx,
  }));

  const { data, error } = await supabase
    .from('profile_skill_categories')
    .insert(itemsToInsert)
    .select();

  return { data, error };
}

/**
 * Bulk create key competences from CV import
 * Automatically assigns display_order based on existing count
 */
export async function bulkCreateKeyCompetences(
  competences: Array<Omit<ProfileKeyCompetence, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_order'>>
): Promise<{ data: ProfileKeyCompetence[] | null; error: any }> {
  const { userId, error: authError } = await getCurrentUserId();
  if (authError || !userId) {
    return { data: null, error: authError };
  }

  const { data: existing } = await fetchKeyCompetences();
  const startOrder = existing?.length || 0;

  const itemsToInsert = competences.map((comp, idx) => ({
    ...comp,
    user_id: userId,
    display_order: startOrder + idx,
  }));

  const { data, error } = await supabase
    .from('profile_key_competences')
    .insert(itemsToInsert)
    .select();

  return { data, error };
}

/**
 * Bulk create certifications from CV import (without documents)
 * Automatically assigns display_order based on existing count
 */
export async function bulkCreateCertifications(
  certifications: Array<Omit<ProfileCertification, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'display_order' | 'document_url' | 'document_name' | 'storage_path'>>
): Promise<{ data: ProfileCertification[] | null; error: any }> {
  const { userId, error: authError } = await getCurrentUserId();
  if (authError || !userId) {
    return { data: null, error: authError };
  }

  const { data: existing } = await fetchCertifications();
  const startOrder = existing?.length || 0;

  const itemsToInsert = certifications.map((cert, idx) => ({
    ...cert,
    user_id: userId,
    display_order: startOrder + idx,
    document_url: null,
    document_name: null,
    storage_path: null,
  }));

  const { data, error } = await supabase
    .from('profile_certifications')
    .insert(itemsToInsert)
    .select();

  return { data, error };
}

// ============================================
// MOTIVATION & VISION
// ============================================

/**
 * Fetch motivation & vision data for current user
 * Note: Only one entry per user (UNIQUE constraint on user_id)
 */
export async function fetchMotivationVision(): Promise<{
  data: ProfileMotivationVision | null;
  error: any;
}> {
  const { data, error } = await supabase
    .from('profile_motivation_vision')
    .select('*')
    .single();

  return { data, error };
}

/**
 * Create or update motivation & vision data
 * Since there's only one entry per user, we use upsert
 */
export async function upsertMotivationVision(
  updates: Partial<Omit<ProfileMotivationVision, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ProfileMotivationVision | null; error: any }> {
  const { userId, error: authError } = await getCurrentUserId();

  if (authError || !userId) {
    return { data: null, error: authError };
  }

  const { data, error } = await supabase
    .from('profile_motivation_vision')
    .upsert(
      { ...updates, user_id: userId },
      { onConflict: 'user_id' }
    )
    .select()
    .single();

  return { data, error };
}

// ============================================
// HIGHLIGHTS & ACHIEVEMENTS
// ============================================

/**
 * Fetch all highlights for current user
 */
export async function fetchHighlights(): Promise<{
  data: ProfileHighlight[] | null;
  error: any;
}> {
  return fetchProfileData<ProfileHighlight>(
    'profile_highlights',
    [{ column: 'display_order', ascending: true }]
  );
}

/**
 * Create a new highlight
 */
export async function createHighlight(
  highlight: Omit<ProfileHighlight, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ data: ProfileHighlight | null; error: any }> {
  return createProfileData<ProfileHighlight>('profile_highlights', highlight);
}

/**
 * Update a highlight
 */
export async function updateHighlight(
  id: string,
  updates: Partial<Omit<ProfileHighlight, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ProfileHighlight | null; error: any }> {
  return updateProfileData<ProfileHighlight>('profile_highlights', id, updates);
}

/**
 * Delete a highlight
 */
export async function deleteHighlight(id: string): Promise<{ error: any }> {
  return deleteProfileData('profile_highlights', id);
}

/**
 * Bulk create highlights (for AI import)
 */
export async function bulkCreateHighlights(
  highlights: Omit<ProfileHighlight, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]
): Promise<{ data: ProfileHighlight[] | null; error: any }> {
  const { userId, error: authError } = await getCurrentUserId();
  if (authError || !userId) {
    return { data: null, error: authError };
  }

  const { data: existing } = await fetchHighlights();
  const startOrder = existing?.length || 0;

  const itemsToInsert = highlights.map((highlight, idx) => ({
    ...highlight,
    user_id: userId,
    display_order: startOrder + idx,
  }));

  const { data, error } = await supabase
    .from('profile_highlights')
    .insert(itemsToInsert)
    .select();

  return { data, error };
}

// ============================================
// PROJECTS
// ============================================

/**
 * Fetch all projects for current user
 */
export async function fetchProjects(): Promise<{
  data: ProfileProject[] | null;
  error: any;
}> {
  return fetchProfileData<ProfileProject>(
    'profile_projects',
    [{ column: 'display_order', ascending: true }]
  );
}

/**
 * Create a new project
 */
export async function createProject(
  project: Omit<ProfileProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<{ data: ProfileProject | null; error: any }> {
  return createProfileData<ProfileProject>('profile_projects', project);
}

/**
 * Update a project
 */
export async function updateProject(
  id: string,
  updates: Partial<Omit<ProfileProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: ProfileProject | null; error: any }> {
  return updateProfileData<ProfileProject>('profile_projects', id, updates);
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<{ error: any }> {
  return deleteProfileData('profile_projects', id);
}

/**
 * Bulk create projects (for AI import)
 */
export async function bulkCreateProjects(
  projects: Omit<ProfileProject, 'id' | 'user_id' | 'created_at' | 'updated_at'>[]
): Promise<{ data: ProfileProject[] | null; error: any }> {
  const { userId, error: authError } = await getCurrentUserId();
  if (authError || !userId) {
    return { data: null, error: authError };
  }

  const { data: existing } = await fetchProjects();
  const startOrder = existing?.length || 0;

  const itemsToInsert = projects.map((project, idx) => ({
    ...project,
    user_id: userId,
    display_order: startOrder + idx,
  }));

  const { data, error } = await supabase
    .from('profile_projects')
    .insert(itemsToInsert)
    .select();

  return { data, error };
}
