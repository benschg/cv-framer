import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBody, errorResponse } from '@/lib/api-utils';
import { UpdateApplicationSchema, type UpdateApplicationInput } from '@/types/api.schemas';

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
    return errorResponse(error);
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

    // Validate request body
    const validated: UpdateApplicationInput = await validateBody(request, UpdateApplicationSchema);

    // Build update object from validated data
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (validated.company_name !== undefined) updateData.company_name = validated.company_name;
    if (validated.job_title !== undefined) updateData.job_title = validated.job_title;
    if (validated.job_url !== undefined) updateData.job_url = validated.job_url || null;
    if (validated.job_description !== undefined) updateData.job_description = validated.job_description;
    if (validated.location !== undefined) updateData.location = validated.location;
    if (validated.salary_range !== undefined) updateData.salary_range = validated.salary_range;
    if (validated.status !== undefined) updateData.status = validated.status;
    if (validated.applied_at !== undefined) updateData.applied_at = validated.applied_at;
    if (validated.deadline !== undefined) updateData.deadline = validated.deadline;
    if (validated.notes !== undefined) updateData.notes = validated.notes;
    if (validated.contact_name !== undefined) updateData.contact_name = validated.contact_name;
    if (validated.contact_email !== undefined) updateData.contact_email = validated.contact_email || null;
    if (validated.cv_id !== undefined) updateData.cv_id = validated.cv_id;
    if (validated.cover_letter_id !== undefined) updateData.cover_letter_id = validated.cover_letter_id;
    if (validated.is_archived !== undefined) updateData.is_archived = validated.is_archived;
    if (validated.is_favorite !== undefined) updateData.is_favorite = validated.is_favorite;

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
    return errorResponse(error);
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
    return errorResponse(error);
  }
}
