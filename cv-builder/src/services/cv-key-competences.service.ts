/**
 * CV Key Competences Service
 * Manages per-CV key competence selections and customizations
 */

import { createClient } from '@/lib/supabase/client';
import type {
  CVKeyCompetenceSelection,
  CVKeyCompetenceWithSelection,
  ProfileKeyCompetence,
} from '@/types/profile-career.types';

const supabase = createClient();

/**
 * Fetch all key competences with their CV-specific selections for a given CV
 * Returns profile key competences merged with selection data
 */
export async function fetchCVKeyCompetences(
  cvId: string
): Promise<{ data: CVKeyCompetenceWithSelection[] | null; error: string | null }> {
  // Fetch all profile key competences
  const { data: competences, error: compError } = await supabase
    .from('profile_key_competences')
    .select('*')
    .order('display_order', { ascending: true, nullsFirst: false });

  if (compError) {
    return { data: null, error: compError.message };
  }

  // Fetch selections for this CV
  const { data: selections, error: selError } = await supabase
    .from('cv_key_competence_selections')
    .select('*')
    .eq('cv_id', cvId);

  if (selError) {
    return { data: null, error: selError.message };
  }

  // Create a map of selections by key_competence_id
  const selectionMap = new Map<string, CVKeyCompetenceSelection>();
  selections?.forEach((sel) => selectionMap.set(sel.key_competence_id, sel));

  // Merge competences with selections
  const merged: CVKeyCompetenceWithSelection[] =
    (competences as ProfileKeyCompetence[])?.map((comp, index) => {
      const sel = selectionMap.get(comp.id);
      return {
        id: comp.id,
        title: comp.title,
        description: comp.description,
        display_order: comp.display_order,
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
 * Bulk upsert key competence selections for a CV
 * Used when saving all changes at once
 */
export async function bulkUpsertCVKeyCompetenceSelections(
  cvId: string,
  selections: Array<{
    key_competence_id: string;
    is_selected?: boolean;
    is_favorite?: boolean;
    display_order?: number;
    description_override?: string | null;
  }>
): Promise<{ data: CVKeyCompetenceSelection[] | null; error: string | null }> {
  if (selections.length === 0) {
    return { data: [], error: null };
  }

  const upsertData = selections.map((sel) => ({
    cv_id: cvId,
    key_competence_id: sel.key_competence_id,
    is_selected: sel.is_selected,
    is_favorite: sel.is_favorite,
    display_order: sel.display_order,
    description_override: sel.description_override,
  }));

  const { data, error } = await supabase
    .from('cv_key_competence_selections')
    .upsert(upsertData, { onConflict: 'cv_id,key_competence_id' })
    .select();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
