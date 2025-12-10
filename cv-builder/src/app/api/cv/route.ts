import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CreateCVSchema } from '@/types/api.schemas';
import { validateBody, errorResponse } from '@/lib/api-utils';

// GET /api/cv - Get all CVs for the current user
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch CVs for the user
    const { data: cvs, error } = await supabase
      .from('cv_documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching CVs:', error);
      return NextResponse.json({ error: 'Failed to fetch CVs' }, { status: 500 });
    }

    return NextResponse.json({ cvs: cvs || [] });
  } catch (error) {
    console.error('CV GET error:', error);
    return errorResponse(error);
  }
}

// POST /api/cv - Create a new CV
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const validatedData = await validateBody(request, CreateCVSchema);

    const {
      name,
      description,
      language = 'en',
      template_id,
      content = {},
      job_context,
      display_settings = {
        theme: 'light',
        showPhoto: true,
        showExperience: true,
        showAttachments: false,
        privacyLevel: 'personal',
      },
    } = validatedData;

    // Create the CV
    const { data: cv, error } = await supabase
      .from('cv_documents')
      .insert({
        user_id: user.id,
        name,
        description,
        language,
        template_id,
        content,
        job_context,
        display_settings,
        is_default: false,
        is_archived: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating CV:', error);
      return NextResponse.json({ error: 'Failed to create CV' }, { status: 500 });
    }

    return NextResponse.json({ cv }, { status: 201 });
  } catch (error) {
    console.error('CV POST error:', error);
    return errorResponse(error);
  }
}
