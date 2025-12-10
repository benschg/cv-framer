import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/applications - Get all applications for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const includeArchived = searchParams.get('includeArchived') === 'true';

    // Build query
    let query = supabase
      .from('job_applications')
      .select('*')
      .eq('user_id', user.id);

    if (!includeArchived) {
      query = query.eq('is_archived', false);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('updated_at', { ascending: false });

    const { data: applications, error } = await query;

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    return NextResponse.json({ applications: applications || [] });
  } catch (error) {
    console.error('Applications GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/applications - Create a new application
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
      company_name,
      job_title,
      job_url,
      job_description,
      location,
      salary_range,
      status = 'draft',
      deadline,
      notes,
      contact_name,
      contact_email,
      cv_id,
      cover_letter_id,
    } = body;

    if (!company_name || !job_title) {
      return NextResponse.json(
        { error: 'Company name and job title are required' },
        { status: 400 }
      );
    }

    // Create the application
    const { data: application, error } = await supabase
      .from('job_applications')
      .insert({
        user_id: user.id,
        company_name,
        job_title,
        job_url,
        job_description,
        location,
        salary_range,
        status,
        deadline,
        notes,
        contact_name,
        contact_email,
        cv_id,
        cover_letter_id,
        is_archived: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error) {
    console.error('Applications POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
