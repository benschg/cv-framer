import { NextRequest, NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api-utils';
import {
  deleteFromStorageByUrl,
  generateStoragePath,
  uploadToStorage,
  validateDocumentFile,
} from '@/lib/storage-utils';
import { createClient } from '@/lib/supabase/server';

const BUCKET = 'reference-documents' as const;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const referenceId = formData.get('reference_id') as string | null;

    // Validate file
    const validationError = validateDocumentFile(file);
    if (validationError) return validationError;

    if (!referenceId) {
      return NextResponse.json({ error: 'No reference_id provided' }, { status: 400 });
    }

    // Verify the reference belongs to the user
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

    // Delete old document if exists
    if (reference.document_url) {
      await deleteFromStorageByUrl(supabase, BUCKET, reference.document_url);
    }

    // Upload new document
    const storagePath = generateStoragePath(user.id, referenceId, file!.name);
    const { publicUrl } = await uploadToStorage(supabase, BUCKET, storagePath, file!);

    // Update reference record with document info
    const { error: updateError } = await supabase
      .from('profile_references')
      .update({
        document_url: publicUrl,
        document_name: file!.name,
      })
      .eq('id', referenceId);

    if (updateError) {
      console.error('DB update error:', updateError);
      // Cleanup storage if DB update fails
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return NextResponse.json({ error: 'Failed to save document record' }, { status: 500 });
    }

    return NextResponse.json({
      document_url: publicUrl,
      document_name: file!.name,
    });
  } catch (error) {
    console.error('Reference document upload error:', error);
    return errorResponse(error);
  }
}
