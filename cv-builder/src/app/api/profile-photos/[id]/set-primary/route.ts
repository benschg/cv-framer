import { NextRequest, NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api-utils';
import { createClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    // Verify photo belongs to user
    const { data: photo, error: fetchError } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('id', photoId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 });
    }

    // Update photo to primary (trigger will handle unsetting others)
    const { data: updatedPhoto, error: updateError } = await supabase
      .from('profile_photos')
      .update({ is_primary: true })
      .eq('id', photoId)
      .select()
      .single();

    if (updateError) {
      console.error('Error setting primary:', updateError);
      return NextResponse.json({ error: 'Failed to set primary photo' }, { status: 500 });
    }

    // Update user_profiles.primary_photo_id
    await supabase
      .from('user_profiles')
      .update({ primary_photo_id: photoId })
      .eq('user_id', user.id);

    return NextResponse.json({ success: true, photo: updatedPhoto });
  } catch (error) {
    console.error('Set primary error:', error);
    return errorResponse(error);
  }
}
