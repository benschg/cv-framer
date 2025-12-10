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

    // TODO: Check password if required
    // const password = request.headers.get('X-Share-Password');
    // if (shareLink.password_hash && !verifyPassword(password, shareLink.password_hash)) {
    //   return NextResponse.json({ error: 'Password required' }, { status: 401 });
    // }

    // Fetch the CV
    const { data: cv, error: cvError } = await supabase
      .from('cv_documents')
      .select('*')
      .eq('id', shareLink.cv_id)
      .single();

    if (cvError || !cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Fetch user profile based on privacy level
    let userProfile = null;
    if (shareLink.privacy_level !== 'full') {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', shareLink.user_id)
        .single();

      if (profile) {
        // Filter profile data based on privacy level
        if (shareLink.privacy_level === 'personal') {
          // Hide contact info but show name and location
          userProfile = {
            first_name: profile.first_name,
            last_name: profile.last_name,
            location: profile.location,
          };
        } else {
          // No privacy - show everything
          userProfile = profile;
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
