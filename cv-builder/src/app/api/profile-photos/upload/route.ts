import { NextRequest, NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api-utils';
import { createClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

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
    const isPrimary = formData.get('is_primary') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPEG, PNG, or WebP images.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const storagePath = `${user.id}/${timestamp}_${randomStr}_${file.name}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-photos').getPublicUrl(storagePath);

    // Get image dimensions (from client-provided metadata or default)
    const width = formData.get('width') ? parseInt(formData.get('width') as string) : null;
    const height = formData.get('height') ? parseInt(formData.get('height') as string) : null;

    // Get current photo count for display_order
    const { count } = await supabase
      .from('profile_photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Insert photo record
    const { data: photo, error: insertError } = await supabase
      .from('profile_photos')
      .insert({
        user_id: user.id,
        storage_path: storagePath,
        filename: file.name,
        file_size: file.size,
        mime_type: file.type,
        width,
        height,
        is_primary: isPrimary || count === 0, // First photo becomes primary
        display_order: count || 0,
        upload_source: 'manual',
      })
      .select()
      .single();

    if (insertError) {
      console.error('DB insert error:', insertError);
      // Cleanup storage if DB insert fails
      await supabase.storage.from('profile-photos').remove([storagePath]);
      return NextResponse.json({ error: 'Failed to save photo record' }, { status: 500 });
    }

    // Update user_profiles.primary_photo_id if this is primary
    if (photo.is_primary) {
      await supabase
        .from('user_profiles')
        .update({ primary_photo_id: photo.id })
        .eq('user_id', user.id);
    }

    return NextResponse.json({ photo, publicUrl });
  } catch (error) {
    console.error('Photo upload error:', error);
    return errorResponse(error);
  }
}
