import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { errorResponse,validateBody } from '@/lib/api-utils';
import { createClient } from '@/lib/supabase/server';
import { CreateShareLinkSchema } from '@/types/api.schemas';

// Generate a unique share token
function generateShareToken(): string {
  return crypto.randomBytes(8).toString('base64url');
}

// Hash password for storage
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// GET /api/share - Get share links for a CV
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const cvId = searchParams.get('cv_id');

    if (!cvId) {
      return NextResponse.json({ error: 'cv_id is required' }, { status: 400 });
    }

    // Verify CV belongs to user
    const { data: cv } = await supabase
      .from('cv_documents')
      .select('id')
      .eq('id', cvId)
      .eq('user_id', user.id)
      .single();

    if (!cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Fetch share links
    const { data: shareLinks, error } = await supabase
      .from('share_links')
      .select('*')
      .eq('cv_id', cvId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching share links:', error);
      return NextResponse.json({ error: 'Failed to fetch share links' }, { status: 500 });
    }

    return NextResponse.json({ shareLinks: shareLinks || [] });
  } catch (error) {
    console.error('Share GET error:', error);
    return errorResponse(error);
  }
}

// POST /api/share - Create a new share link
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

    // Validate request body
    const data = await validateBody(request, CreateShareLinkSchema);
    const { cv_id, privacy_level = 'personal', expires_at, password } = data;

    // Verify CV belongs to user
    const { data: cv } = await supabase
      .from('cv_documents')
      .select('id')
      .eq('id', cv_id)
      .eq('user_id', user.id)
      .single();

    if (!cv) {
      return NextResponse.json({ error: 'CV not found' }, { status: 404 });
    }

    // Generate share token
    const shareToken = generateShareToken();

    // Create share link
    const { data: shareLink, error } = await supabase
      .from('share_links')
      .insert({
        cv_id,
        user_id: user.id,
        share_token: shareToken,
        privacy_level,
        is_active: true,
        expires_at: expires_at || null,
        password_hash: password ? hashPassword(password) : null,
        view_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating share link:', error);
      return NextResponse.json({ error: 'Failed to create share link' }, { status: 500 });
    }

    return NextResponse.json({ shareLink }, { status: 201 });
  } catch (error) {
    console.error('Share POST error:', error);
    return errorResponse(error);
  }
}
