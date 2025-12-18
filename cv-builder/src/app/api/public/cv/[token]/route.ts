import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ token: string }>;
}

// GET /api/public/cv/[token] - Get a publicly shared CV
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { token } = await params;

    // Find the share link by token
    const { data: shareLink, error: shareLinkError } = await supabase
      .from('share_links')
      .select('*')
      .eq('share_token', token)
      .single();

    if (shareLinkError || !shareLink) {
      return NextResponse.json({ error: 'Share link not found' }, { status: 404 });
    }

    // Check if link is active
    if (!shareLink.is_active) {
      return NextResponse.json({ error: 'This share link is no longer active' }, { status: 403 });
    }

    // Check if link has expired
    if (shareLink.expires_at && new Date(shareLink.expires_at) < new Date()) {
      return NextResponse.json({ error: 'This share link has expired' }, { status: 403 });
    }

    // Fetch the CV
    const { data: cv, error: cvError } = await supabase
      .from('cv_documents')
      .select('*')
      .eq('id', shareLink.cv_id)
      .single();

    if (cvError || !cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Fetch user from auth to get profile data from user_metadata
    let userProfile = null;
    if (shareLink.privacy_level !== 'full') {
      // Get user data from auth (admin access required for service role)
      const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(shareLink.user_id);

      if (!userError && user) {
        const firstName = user.user_metadata?.first_name || '';
        const lastName = user.user_metadata?.last_name || '';
        const email = user.email || '';
        const phone = user.user_metadata?.phone || '';
        const location = user.user_metadata?.location || '';

        // Filter profile data based on privacy level
        if (shareLink.privacy_level === 'personal') {
          // Hide contact info but show name and location
          userProfile = {
            first_name: firstName,
            last_name: lastName,
            location: location,
          };
        } else {
          // No privacy - show everything
          userProfile = {
            id: user.id,
            user_id: user.id,
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            location: location,
            preferred_language: (cv.language || 'en') as 'en' | 'de',
            created_at: user.created_at,
            updated_at: user.updated_at || user.created_at,
          };
        }
      }
    }

    // Update view count and last viewed
    await supabase
      .from('share_links')
      .update({
        view_count: (shareLink.view_count || 0) + 1,
        last_viewed_at: new Date().toISOString(),
      })
      .eq('id', shareLink.id);

    // Record visit (optional - requires share_link_visits table)
    const visitorIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    const referrer = request.headers.get('referer');

    // Try to record visit, ignore if table doesn't exist
    try {
      await supabase
        .from('share_link_visits')
        .insert({
          share_link_id: shareLink.id,
          visitor_ip: visitorIp,
          user_agent: userAgent,
          referrer: referrer,
        });
    } catch {
      // Table might not exist, ignore
    }

    return NextResponse.json({
      cv,
      userProfile,
      shareLink: {
        id: shareLink.id,
        privacy_level: shareLink.privacy_level,
        created_at: shareLink.created_at,
      },
    });
  } catch (error) {
    console.error('Public CV GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
