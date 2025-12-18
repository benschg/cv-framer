import { NextRequest, NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api-utils';
import { deleteFromStorageByUrl } from '@/lib/storage-utils';
import { createClient } from '@/lib/supabase/server';

const BUCKET = 'reference-documents' as const;

interface RouteParams {
  params: Promise<{ id: string }>;
}

// DELETE /api/reference-documents/[id] - Delete a reference document
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id: referenceId } = await params;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the reference to verify ownership and get document URL
    const { data: reference, error: refError } = await supabase
      .from('profile_references')
      .select('id, user_id, document_url')
      .eq('id', referenceId)
      .single();

    if (refError || !reference) {
      return NextResponse.json({ error: 'Reference not found' }, { status: 404 });
    }

    if (reference.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete from storage if exists
    if (reference.document_url) {
      await deleteFromStorageByUrl(supabase, BUCKET, reference.document_url);
    }

    // Clear document fields in database
    const { error: updateError } = await supabase
      .from('profile_references')
      .update({
        document_url: null,
        document_name: null,
      })
      .eq('id', referenceId);

    if (updateError) {
      console.error('DB update error:', updateError);
      return NextResponse.json({ error: 'Failed to remove document record' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reference document delete error:', error);
    return errorResponse(error);
  }
}
