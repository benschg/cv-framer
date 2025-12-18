import { NextRequest, NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api-utils';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: photoId } = await params;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch photo to get storage_path and check ownership
    const { data: photo, error: fetchError } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    const wasPrimary = photo.is_primary;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('profile-photos')
      .remove([photo.storage_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      // Continue anyway - DB cleanup is more important
    }

    // Delete from database
    const { error: deleteError } = await supabase.from('profile_photos').delete().eq('id', photoId);

    if (deleteError) {
      console.error('DB delete error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 });
    }

    // If deleted photo was primary, set another photo as primary
    if (wasPrimary) {
      const { data: remainingPhotos } = await supabase
        .from('profile_photos')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (remainingPhotos && remainingPhotos.length > 0) {
        const newPrimaryId = remainingPhotos[0].id;
        await supabase.from('profile_photos').update({ is_primary: true }).eq('id', newPrimaryId);

        await supabase
          .from('user_profiles')
          .update({ primary_photo_id: newPrimaryId })
          .eq('user_id', user.id);
      } else {
        // No photos left, clear primary_photo_id
        await supabase
          .from('user_profiles')
          .update({ primary_photo_id: null })
          .eq('user_id', user.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete photo error:', error);
    return errorResponse(error);
  }
}
