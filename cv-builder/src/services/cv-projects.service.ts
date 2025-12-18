import { createClient } from '@/lib/supabase/client';
import type { CVProjectWithSelection } from '@/types/profile-career.types';

/**
 * Fetch all profile projects with their CV selection status for a specific CV
 */
export async function fetchCVProjects(cvId: string): Promise<{
  data: CVProjectWithSelection[] | null;
  error: unknown;
}> {
  const supabase = createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: authError || new Error('Not authenticated') };
  }

  // Fetch all profile projects
  const { data: projects, error: projectsError } = await supabase
    .from('profile_projects')
    .select('*')
    .eq('user_id', user.id)
    .order('display_order', { ascending: true });

  if (projectsError) {
    return { data: null, error: projectsError };
  }

  if (!projects || projects.length === 0) {
    return { data: [], error: null };
  }

  // Fetch existing selections for this CV
  const { data: selections, error: selectionsError } = await supabase
    .from('cv_project_selections')
    .select('*')
    .eq('cv_id', cvId);

  if (selectionsError) {
    return { data: null, error: selectionsError };
  }

  // Map selections to projects
  const selectionsMap = new Map((selections || []).map((sel) => [sel.profile_project_id, sel]));

  const projectsWithSelections: CVProjectWithSelection[] = projects.map((project) => ({
    ...project,
    selection: selectionsMap.get(project.id) || {
      id: undefined,
      cv_id: cvId,
      profile_project_id: project.id,
      is_selected: false,
      is_favorite: false,
      display_order: 0,
      description_override: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  }));

  return { data: projectsWithSelections, error: null };
}

/**
 * Bulk upsert CV project selections
 */
export async function bulkUpsertCVProjectSelections(
  cvId: string,
  projects: CVProjectWithSelection[]
): Promise<{ error: unknown }> {
  const supabase = createClient();

  const selections = projects.map((project) => ({
    cv_id: cvId,
    profile_project_id: project.id,
    is_selected: project.selection.is_selected,
    is_favorite: project.selection.is_favorite,
    display_order: project.selection.display_order,
    description_override: project.selection.description_override,
  }));

  const { error } = await supabase.from('cv_project_selections').upsert(selections, {
    onConflict: 'cv_id,profile_project_id',
  });

  return { error };
}
