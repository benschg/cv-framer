import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { CategoryKey } from '@/types/werbeflaechen.types';

interface RouteParams {
  params: Promise<{ category: string }>;
}

// GET /api/werbeflaechen/[category] - Get a specific category entry
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { category } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get language from query params
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';

    // Fetch specific entry
    const { data: entry, error } = await supabase
      .from('werbeflaechen_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('language', language)
      .eq('category_key', category)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is expected for new entries
      console.error('Error fetching werbeflaechen entry:', error);
      return NextResponse.json({ error: 'Failed to fetch entry' }, { status: 500 });
    }

    return NextResponse.json({ entry: entry || null });
  } catch (error) {
    console.error('Werbeflaechen category GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/werbeflaechen/[category] - Update a specific category entry
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { category } = await params;
    const categoryKey = category as CategoryKey;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { language = 'en', content, is_complete, row_number } = body;

    // Check if entry exists
    const { data: existing } = await supabase
      .from('werbeflaechen_entries')
      .select('id')
      .eq('user_id', user.id)
      .eq('language', language)
      .eq('category_key', categoryKey)
      .single();

    let result;

    if (existing) {
      // Update existing
      const updateData: Record<string, unknown> = {
        content,
        updated_at: new Date().toISOString(),
      };
      if (typeof is_complete === 'boolean') {
        updateData.is_complete = is_complete;
      }

      result = await supabase
        .from('werbeflaechen_entries')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Create new
      result = await supabase
        .from('werbeflaechen_entries')
        .insert({
          user_id: user.id,
          category_key: categoryKey,
          language,
          row_number: row_number || 1,
          content,
          is_complete: is_complete || false,
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error('Error saving werbeflaechen entry:', result.error);
      return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
    }

    return NextResponse.json({ entry: result.data });
  } catch (error) {
    console.error('Werbeflaechen category PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/werbeflaechen/[category] - Delete a specific category entry
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { category } = await params;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get language from query params
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';

    const { error } = await supabase
      .from('werbeflaechen_entries')
      .delete()
      .eq('user_id', user.id)
      .eq('language', language)
      .eq('category_key', category);

    if (error) {
      console.error('Error deleting werbeflaechen entry:', error);
      return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Werbeflaechen category DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
