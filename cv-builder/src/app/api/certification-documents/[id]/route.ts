import { NextRequest, NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api-utils';
import { deleteFromStorage } from '@/lib/storage-utils';
import { createClient } from '@/lib/supabase/server';

const BUCKET = 'certification-documents' as const;

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/certification-documents/[id] - Delete a certification document
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id: documentId } = await params;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the document to verify ownership
    const { data: document, error: docError } = await supabase
      .from('certification_documents')
      .select('id, certification_id, storage_path')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Verify the certification belongs to the user
    const { data: certification, error: certError } = await supabase
      .from('profile_certifications')
      .select('id, user_id')
      .eq('id', document.certification_id)
      .single();

    if (certError || !certification) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    if (certification.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete from storage
    if (document.storage_path) {
      await deleteFromStorage(supabase, BUCKET, document.storage_path);
    }

    // Delete record from database
    const { error: deleteError } = await supabase
      .from('certification_documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      console.error('DB delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete document record' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Certification document delete error:', error);
    return errorResponse(error);
  }
}
