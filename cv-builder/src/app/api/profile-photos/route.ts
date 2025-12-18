import { NextResponse } from 'next/server';

import { errorResponse } from '@/lib/api-utils';
import { createClient } from '@/lib/supabase/server';

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

    const primaryPhoto = photos?.find((p) => p.is_primary) || null;

    return NextResponse.json({ photos: photos || [], primaryPhoto });
  } catch (error) {
    console.error('Photos GET error:', error);
    return errorResponse(error);
  }
}
