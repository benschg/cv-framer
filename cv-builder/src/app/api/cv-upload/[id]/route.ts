import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { errorResponse } from '@/lib/api-utils';

// GET /api/cv-upload/[id] - Get a specific uploaded CV
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: upload, error } = await supabase
      .from('uploaded_cvs')
      .select('id, filename, file_type, extracted_text, extraction_metadata, created_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: upload.id,
      filename: upload.filename,
      fileType: upload.file_type,
      extractedText: upload.extracted_text,
      metadata: upload.extraction_metadata,
      createdAt: upload.created_at,
    });
  } catch (error) {
    console.error('CV upload GET error:', error);
    return errorResponse(error);
  }
}

// DELETE /api/cv-upload/[id] - Delete an uploaded CV
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('uploaded_cvs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting upload:', error);
      return NextResponse.json({ error: 'Failed to delete upload' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('CV upload DELETE error:', error);
    return errorResponse(error);
  }
}
