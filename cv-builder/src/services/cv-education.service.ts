/**
 * CV Education Service
 * Manages per-CV education selections and customizations
 */

import { createClient } from '@/lib/supabase/client';
import type {
  CVEducationSelection,
  CVEducationWithSelection,
  ProfileEducation,
} from '@/types/profile-career.types';

const supabase = createClient();

/**
 * Fetch all educations with their CV-specific selections for a given CV
 * Returns profile educations merged with selection data
 */
export async function fetchCVEducations(
  cvId: string
): Promise<{ data: CVEducationWithSelection[] | null; error: string | null }> {
  // Fetch all profile educations
  const { data: educations, error: eduError } = await supabase
    .from('profile_educations')
    .select('*')
    .order('display_order', { ascending: true, nullsFirst: false })
    .order('start_date', { ascending: false });

  if (eduError) {
    return { data: null, error: eduError.message };
  }

  // Fetch selections for this CV
  const { data: selections, error: selError } = await supabase
    .from('cv_education_selections')
    .select('*')
    .eq('cv_id', cvId);

  if (selError) {
    return { data: null, error: selError.message };
  }

  // Create a map of selections by education_id
  const selectionMap = new Map<string, CVEducationSelection>();
  selections?.forEach((sel) => selectionMap.set(sel.education_id, sel));

  // Merge educations with selections
  const merged: CVEducationWithSelection[] =
    (educations as ProfileEducation[])?.map((edu, index) => {
      const sel = selectionMap.get(edu.id);
      return {
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        start_date: edu.start_date,
        end_date: edu.end_date,
        description: edu.description,
        grade: edu.grade,
        display_order: edu.display_order,
        selection: {
          id: sel?.id,
          is_selected: sel?.is_selected ?? true, // Default: selected
          is_favorite: sel?.is_favorite ?? false,
          display_order: sel?.display_order ?? index,
          description_override: sel?.description_override ?? null,
        },
      };
    }) || [];

  // Sort by selection display_order
  merged.sort((a, b) => a.selection.display_order - b.selection.display_order);

  return { data: merged, error: null };
}

/**
 * Bulk upsert education selections for a CV
 * Used when saving all changes at once
 */
export async function bulkUpsertCVEducationSelections(
  cvId: string,
  selections: Array<{
    education_id: string;
    is_selected?: boolean;
    is_favorite?: boolean;
    display_order?: number;
    description_override?: string | null;
  }>
): Promise<{ data: CVEducationSelection[] | null; error: string | null }> {
  if (selections.length === 0) {
    return { data: [], error: null };
  }

  const upsertData = selections.map((sel) => ({
    cv_id: cvId,
    education_id: sel.education_id,
    is_selected: sel.is_selected,
    is_favorite: sel.is_favorite,
    display_order: sel.display_order,
    description_override: sel.description_override,
  }));

  const { data, error } = await supabase
    .from('cv_education_selections')
    .upsert(upsertData, { onConflict: 'cv_id,education_id' })
    .select();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
