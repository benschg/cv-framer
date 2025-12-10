import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UpdateCoverLetterSchema } from '@/types/api.schemas';
import { validateBody, errorResponse } from '@/lib/api-utils';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/cover-letter/[id] - Get a specific cover letter
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the cover letter
    const { data: coverLetter, error } = await supabase
      .from('cover_letters')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 });
      }
      console.error('Error fetching cover letter:', error);
      return NextResponse.json({ error: 'Failed to fetch cover letter' }, { status: 500 });
    }

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error('Cover letter GET by ID error:', error);
    return errorResponse(error);
  }
}

// PUT /api/cover-letter/[id] - Update a cover letter
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
    const validatedData = await validateBody(request, UpdateCoverLetterSchema);

    const {
      name,
      content,
      job_context,
      cv_id,
      is_archived,
    } = validatedData;

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (content !== undefined) updateData.content = content;
    if (job_context !== undefined) updateData.job_context = job_context;
    if (cv_id !== undefined) updateData.cv_id = cv_id;
    if (is_archived !== undefined) updateData.is_archived = is_archived;

    // Update the cover letter
    const { data: coverLetter, error } = await supabase
      .from('cover_letters')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Cover letter not found' }, { status: 404 });
      }
      console.error('Error updating cover letter:', error);
      return NextResponse.json({ error: 'Failed to update cover letter' }, { status: 500 });
    }

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error('Cover letter PUT error:', error);
    return errorResponse(error);
  }
}

// DELETE /api/cover-letter/[id] - Delete a cover letter
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
        .from('cover_letters')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting cover letter:', error);
        return NextResponse.json({ error: 'Failed to delete cover letter' }, { status: 500 });
      }
    } else {
      // Soft delete (archive)
      const { error } = await supabase
        .from('cover_letters')
        .update({ is_archived: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error archiving cover letter:', error);
        return NextResponse.json({ error: 'Failed to archive cover letter' }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cover letter DELETE error:', error);
    return errorResponse(error);
  }
}
