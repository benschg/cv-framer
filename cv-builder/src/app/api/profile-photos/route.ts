import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api-utils';
import { createClient } from '@/lib/supabase/server';
import type { ProfilePhoto, ProfilePhotoWithUrl } from '@/types/api.schemas';

// Signed URLs expire after 1 hour
const SIGNED_URL_EXPIRY_SECONDS = 3600;

async function addSignedUrls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  photos: ProfilePhoto[]
): Promise<ProfilePhotoWithUrl[]> {
  const photosWithUrls = await Promise.all(
    photos.map(async (photo) => {
      const { data } = await supabase.storage
        .from('profile-photos')
        .createSignedUrl(photo.storage_path, SIGNED_URL_EXPIRY_SECONDS);

      return {
        ...photo,
        signedUrl: data?.signedUrl || '',
      };
    })
  );

  return photosWithUrls;
}

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all photos for user
    const { data: photos, error } = await supabase
      .from('profile_photos')
      .select('*')
      .eq('user_id', user.id)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching photos:', error);
      return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 });
    }

    // Add signed URLs to all photos
    const photosWithUrls = await addSignedUrls(supabase, photos || []);
    const primaryPhoto = photosWithUrls.find((p) => p.is_primary) || null;

    return NextResponse.json({ photos: photosWithUrls, primaryPhoto });
  } catch (error) {
    console.error('Photos GET error:', error);
    return errorResponse(error);
  }
}
