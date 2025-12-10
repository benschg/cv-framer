import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/applications/[id] - Get a specific application
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the application
    const { data: application, error } = await supabase
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      console.error('Error fetching application:', error);
      return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Application GET by ID error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/applications/[id] - Update an application
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

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
      status,
      applied_at,
      deadline,
      notes,
      contact_name,
      contact_email,
      cv_id,
      cover_letter_id,
      fit_analysis,
      is_archived,
    } = body;

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (company_name !== undefined) updateData.company_name = company_name;
    if (job_title !== undefined) updateData.job_title = job_title;
    if (job_url !== undefined) updateData.job_url = job_url;
    if (job_description !== undefined) updateData.job_description = job_description;
    if (location !== undefined) updateData.location = location;
    if (salary_range !== undefined) updateData.salary_range = salary_range;
    if (status !== undefined) updateData.status = status;
    if (applied_at !== undefined) updateData.applied_at = applied_at;
    if (deadline !== undefined) updateData.deadline = deadline;
    if (notes !== undefined) updateData.notes = notes;
    if (contact_name !== undefined) updateData.contact_name = contact_name;
    if (contact_email !== undefined) updateData.contact_email = contact_email;
    if (cv_id !== undefined) updateData.cv_id = cv_id;
    if (cover_letter_id !== undefined) updateData.cover_letter_id = cover_letter_id;
    if (fit_analysis !== undefined) updateData.fit_analysis = fit_analysis;
    if (is_archived !== undefined) updateData.is_archived = is_archived;

    // Update the application
    const { data: application, error } = await supabase
      .from('job_applications')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      console.error('Error updating application:', error);
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error('Application PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/applications/[id] - Delete an application
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if hard delete is requested
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete) {
      // Permanently delete
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting application:', error);
        return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
      }
    } else {
      // Soft delete (archive)
      const { error } = await supabase
        .from('job_applications')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error archiving application:', error);
        return NextResponse.json({ error: 'Failed to archive application' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Application DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
