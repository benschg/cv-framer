import { NextRequest, NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api-utils';
import { generateStoragePath, uploadToStorage, validateDocumentFile } from '@/lib/storage-utils';
import { createClient } from '@/lib/supabase/server';

const BUCKET = 'certification-documents' as const;

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
    const certificationId = formData.get('certification_id') as string | null;

    // Validate file
    const validationError = validateDocumentFile(file);
    if (validationError) return validationError;

    if (!certificationId) {
      return NextResponse.json({ error: 'No certification_id provided' }, { status: 400 });
    }

    // Verify the certification belongs to the user
    const { data: certification, error: certError } = await supabase
      .from('profile_certifications')
      .select('id, user_id')
      .eq('id', certificationId)
      .single();

    if (certError || !certification) {
      return NextResponse.json({ error: 'Certification not found' }, { status: 404 });
    }

    if (certification.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Upload document
    const storagePath = generateStoragePath(user.id, certificationId, file!.name);
    const { publicUrl } = await uploadToStorage(supabase, BUCKET, storagePath, file!);

    // Get current max display_order
    const { data: existingDocs } = await supabase
      .from('certification_documents')
      .select('display_order')
      .eq('certification_id', certificationId)
      .order('display_order', { ascending: false })
      .limit(1);

    const nextOrder =
      existingDocs && existingDocs.length > 0 ? (existingDocs[0].display_order || 0) + 1 : 0;

    // Create record in certification_documents table
    const { data: docRecord, error: insertError } = await supabase
      .from('certification_documents')
      .insert({
        certification_id: certificationId,
        document_url: publicUrl,
        document_name: file!.name,
        storage_path: storagePath,
        file_type: file!.type,
        file_size: file!.size,
        display_order: nextOrder,
      })
      .select()
      .single();

    if (insertError) {
      console.error('DB insert error:', insertError);
      // Cleanup storage if DB insert fails
      await supabase.storage.from(BUCKET).remove([storagePath]);
      return NextResponse.json({ error: 'Failed to save document record' }, { status: 500 });
    }

    return NextResponse.json(docRecord);
  } catch (error) {
    console.error('Certification document upload error:', error);
    return errorResponse(error);
  }
}
