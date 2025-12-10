import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/cv/[id] - Get a specific CV
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the CV
    const { data: cv, error } = await supabase
      .from('cv_documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'CV not found' }, { status: 404 });
      }
      console.error('Error fetching CV:', error);
      return NextResponse.json({ error: 'Failed to fetch CV' }, { status: 500 });
    }

    return NextResponse.json({ cv });
  } catch (error) {
    console.error('CV GET by ID error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/cv/[id] - Update a CV
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
      name,
      description,
      content,
      job_context,
      display_settings,
      is_default,
      is_archived,
    } = body;

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (job_context !== undefined) updateData.job_context = job_context;
    if (display_settings !== undefined) updateData.display_settings = display_settings;
    if (is_default !== undefined) updateData.is_default = is_default;
    if (is_archived !== undefined) updateData.is_archived = is_archived;

    // If setting this CV as default, unset other defaults first
    if (is_default === true) {
      await supabase
        .from('cv_documents')
        .update({ is_default: false })
        .eq('user_id', user.id)
        .neq('id', id);
    }

    // Update the CV
    const { data: cv, error } = await supabase
      .from('cv_documents')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'CV not found' }, { status: 404 });
      }
      console.error('Error updating CV:', error);
      return NextResponse.json({ error: 'Failed to update CV' }, { status: 500 });
    }

    return NextResponse.json({ cv });
  } catch (error) {
    console.error('CV PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/cv/[id] - Delete a CV (soft delete by archiving)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if hard delete is requested via query param
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete) {
      // Permanently delete the CV
      const { error } = await supabase
        .from('cv_documents')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting CV:', error);
        return NextResponse.json({ error: 'Failed to delete CV' }, { status: 500 });
      }
    } else {
      // Soft delete (archive)
      const { error } = await supabase
        .from('cv_documents')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error archiving CV:', error);
        return NextResponse.json({ error: 'Failed to archive CV' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('CV DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
