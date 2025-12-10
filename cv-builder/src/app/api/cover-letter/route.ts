import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/cover-letter - Get all cover letters for the current user
export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch cover letters for the user
    const { data: coverLetters, error } = await supabase
      .from('cover_letters')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching cover letters:', error);
      return NextResponse.json({ error: 'Failed to fetch cover letters' }, { status: 500 });
    }

    return NextResponse.json({ coverLetters: coverLetters || [] });
  } catch (error) {
    console.error('Cover letter GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/cover-letter - Create a new cover letter
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      language = 'en',
      cv_id,
      content = {},
      job_context,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Create the cover letter
    const { data: coverLetter, error } = await supabase
      .from('cover_letters')
      .insert({
        user_id: user.id,
        name,
        language,
        cv_id,
        content,
        job_context,
        is_archived: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating cover letter:', error);
      return NextResponse.json({ error: 'Failed to create cover letter' }, { status: 500 });
    }

    return NextResponse.json({ coverLetter }, { status: 201 });
  } catch (error) {
    console.error('Cover letter POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
