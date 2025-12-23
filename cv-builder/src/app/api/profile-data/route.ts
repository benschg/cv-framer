import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/profile-data
 * Fetches all profile section data and counts in a single optimized request
 */
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch all data in parallel for maximum efficiency
    const [
      motivationVision,
      highlights,
      projects,
      workExperiences,
      educations,
      skillCategories,
      keyCompetences,
      certifications,
      references,
      userProfile,
    ] = await Promise.all([
      supabase
        .from('profile_motivation_vision')
        .select('*')
        .eq('user_id', user.id)
        .single(),
      supabase
        .from('profile_highlights')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true }),
      supabase
        .from('profile_projects')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true }),
      supabase
        .from('profile_work_experiences')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true }),
      supabase
        .from('profile_educations')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true }),
      supabase
        .from('profile_skill_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true }),
      supabase
        .from('profile_key_competences')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true }),
      supabase
        .from('profile_certifications')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true }),
      supabase
        .from('profile_references')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true }),
      supabase.from('user_profiles').select('*').eq('user_id', user.id).single(),
    ]);

    // Build response with data and counts
    const response = {
      sections: {
        motivationVision: {
          data: motivationVision.data,
          count: motivationVision.data ? 1 : 0,
          error: motivationVision.error?.message,
        },
        highlights: {
          data: highlights.data || [],
          count: highlights.data?.length || 0,
          error: highlights.error?.message,
        },
        projects: {
          data: projects.data || [],
          count: projects.data?.length || 0,
          error: projects.error?.message,
        },
        workExperiences: {
          data: workExperiences.data || [],
          count: workExperiences.data?.length || 0,
          error: workExperiences.error?.message,
        },
        educations: {
          data: educations.data || [],
          count: educations.data?.length || 0,
          error: educations.error?.message,
        },
        skillCategories: {
          data: skillCategories.data || [],
          count: skillCategories.data?.length || 0,
          error: skillCategories.error?.message,
        },
        keyCompetences: {
          data: keyCompetences.data || [],
          count: keyCompetences.data?.length || 0,
          error: keyCompetences.error?.message,
        },
        certifications: {
          data: certifications.data || [],
          count: certifications.data?.length || 0,
          error: certifications.error?.message,
        },
        references: {
          data: references.data || [],
          count: references.data?.length || 0,
          error: references.error?.message,
        },
      },
      profile: {
        data: userProfile.data,
        error: userProfile.error?.message,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching profile data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
}
