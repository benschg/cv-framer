/**
 * CV Skill Categories Service
 * Manages per-CV skill category selections and customizations
 */

import { createClient } from '@/lib/supabase/client';
import type {
  CVSkillCategorySelection,
  CVSkillCategoryWithSelection,
  ProfileSkillCategory,
} from '@/types/profile-career.types';

const supabase = createClient();

/**
 * Fetch all skill categories with their CV-specific selections for a given CV
 * Returns profile skill categories merged with selection data
 */
export async function fetchCVSkillCategories(
  cvId: string
): Promise<{ data: CVSkillCategoryWithSelection[] | null; error: string | null }> {
  // Fetch all profile skill categories
  const { data: categories, error: catError } = await supabase
    .from('profile_skill_categories')
    .select('*')
    .order('display_order', { ascending: true, nullsFirst: false });

  if (catError) {
    return { data: null, error: catError.message };
  }

  // Fetch selections for this CV
  const { data: selections, error: selError } = await supabase
    .from('cv_skill_category_selections')
    .select('*')
    .eq('cv_id', cvId);

  if (selError) {
    return { data: null, error: selError.message };
  }

  // Create a map of selections by skill_category_id
  const selectionMap = new Map<string, CVSkillCategorySelection>();
  selections?.forEach((sel) => selectionMap.set(sel.skill_category_id, sel));

  // Merge categories with selections
  const merged: CVSkillCategoryWithSelection[] =
    (categories as ProfileSkillCategory[])?.map((cat, index) => {
      const sel = selectionMap.get(cat.id);
      return {
        id: cat.id,
        category: cat.category,
        skills: cat.skills || [],
        display_order: cat.display_order,
        selection: {
          id: sel?.id,
          is_selected: sel?.is_selected ?? true, // Default: selected
          is_favorite: sel?.is_favorite ?? false,
          display_order: sel?.display_order ?? index,
          selected_skill_indices: sel?.selected_skill_indices ?? null,
        },
      };
    }) || [];

  // Sort by selection display_order
  merged.sort((a, b) => a.selection.display_order - b.selection.display_order);

  return { data: merged, error: null };
}

/**
 * Bulk upsert skill category selections for a CV
 * Used when saving all changes at once
 */
export async function bulkUpsertCVSkillCategorySelections(
  cvId: string,
  selections: Array<{
    skill_category_id: string;
    is_selected?: boolean;
    is_favorite?: boolean;
    display_order?: number;
    selected_skill_indices?: number[] | null;
  }>
): Promise<{ data: CVSkillCategorySelection[] | null; error: string | null }> {
  if (selections.length === 0) {
    return { data: [], error: null };
  }

  const upsertData = selections.map((sel) => ({
    cv_id: cvId,
    skill_category_id: sel.skill_category_id,
    is_selected: sel.is_selected,
    is_favorite: sel.is_favorite,
    display_order: sel.display_order,
    selected_skill_indices: sel.selected_skill_indices,
  }));

  const { data, error } = await supabase
    .from('cv_skill_category_selections')
    .upsert(upsertData, { onConflict: 'cv_id,skill_category_id' })
    .select();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
