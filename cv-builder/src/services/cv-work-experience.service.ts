/**
 * CV Work Experience Service
 * Manages per-CV work experience selections and customizations
 */

import { createClient } from '@/lib/supabase/client';
import type {
  CVWorkExperienceSelection,
  CVWorkExperienceWithSelection,
  ProfileWorkExperience,
} from '@/types/profile-career.types';

const supabase = createClient();

/**
 * Fetch all work experiences with their CV-specific selections for a given CV
 * Returns profile work experiences merged with selection data
 */
export async function fetchCVWorkExperiences(
  cvId: string
): Promise<{ data: CVWorkExperienceWithSelection[] | null; error: string | null }> {
  // Fetch all profile work experiences
  const { data: experiences, error: expError } = await supabase
    .from('profile_work_experiences')
    .select('*')
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('start_date', { ascending: false });

  if (expError) {
    return { data: null, error: expError.message };
  }

  // Fetch selections for this CV
  const { data: selections, error: selError } = await supabase
    .from('cv_work_experience_selections')
    .select('*')
    .eq('cv_id', cvId);

  if (selError) {
    return { data: null, error: selError.message };
  }

  // Create a map of selections by work_experience_id
  const selectionMap = new Map<string, CVWorkExperienceSelection>();
  selections?.forEach(sel => selectionMap.set(sel.work_experience_id, sel));

  // Merge experiences with selections
  const merged: CVWorkExperienceWithSelection[] = (experiences as ProfileWorkExperience[])?.map((exp, index) => {
    const sel = selectionMap.get(exp.id);
    return {
      id: exp.id,
      company: exp.company,
      title: exp.title,
      location: exp.location,
      start_date: exp.start_date,
      end_date: exp.end_date,
      current: exp.current,
      description: exp.description,
      bullets: exp.bullets,
      display_order: exp.display_order,
      selection: {
        id: sel?.id,
        is_selected: sel?.is_selected ?? true, // Default: selected
        is_favorite: sel?.is_favorite ?? false,
        display_order: sel?.display_order ?? index,
        description_override: sel?.description_override ?? null,
        selected_bullet_indices: sel?.selected_bullet_indices ?? null,
      },
    };
  }) || [];

  // Sort by selection display_order
  merged.sort((a, b) => a.selection.display_order - b.selection.display_order);

  return { data: merged, error: null };
}

/**
 * Upsert a single work experience selection for a CV
 */
export async function upsertCVWorkExperienceSelection(
  cvId: string,
  workExperienceId: string,
  updates: {
    is_selected?: boolean;
    is_favorite?: boolean;
    display_order?: number;
    description_override?: string | null;
    selected_bullet_indices?: number[] | null;
  }
): Promise<{ data: CVWorkExperienceSelection | null; error: string | null }> {
  const { data, error } = await supabase
    .from('cv_work_experience_selections')
    .upsert(
      {
        cv_id: cvId,
        work_experience_id: workExperienceId,
        ...updates,
      },
      { onConflict: 'cv_id,work_experience_id' }
    )
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Bulk upsert work experience selections for a CV
 * Used when saving all changes at once
 */
export async function bulkUpsertCVWorkExperienceSelections(
  cvId: string,
  selections: Array<{
    work_experience_id: string;
    is_selected?: boolean;
    is_favorite?: boolean;
    display_order?: number;
    description_override?: string | null;
    selected_bullet_indices?: number[] | null;
  }>
): Promise<{ data: CVWorkExperienceSelection[] | null; error: string | null }> {
  if (selections.length === 0) {
    return { data: [], error: null };
  }

  const upsertData = selections.map(sel => ({
    cv_id: cvId,
    work_experience_id: sel.work_experience_id,
    is_selected: sel.is_selected,
    is_favorite: sel.is_favorite,
    display_order: sel.display_order,
    description_override: sel.description_override,
    selected_bullet_indices: sel.selected_bullet_indices,
  }));

  const { data, error } = await supabase
    .from('cv_work_experience_selections')
    .upsert(upsertData, { onConflict: 'cv_id,work_experience_id' })
    .select();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Delete all selections for a CV (used when resetting to defaults)
 */
export async function deleteCVWorkExperienceSelections(
  cvId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('cv_work_experience_selections')
    .delete()
    .eq('cv_id', cvId);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
