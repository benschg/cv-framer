import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBody, errorResponse } from '@/lib/api-utils';
import { CreateWerbeflaechenSchema } from '@/types/api.schemas';

// GET /api/werbeflaechen - Get all entries for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get language from query params
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';

    // Fetch entries for the user
    const { data: entries, error } = await supabase
      .from('werbeflaechen_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('language', language)
      .order('category_key');

    if (error) {
      console.error('Error fetching werbeflaechen entries:', error);
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 });
    }

    return NextResponse.json({ entries: entries || [] });
  } catch (error) {
    console.error('Werbeflaechen GET error:', error);
    return errorResponse(error);
  }
}

// POST /api/werbeflaechen - Create or update an entry
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const data = await validateBody(request, CreateWerbeflaechenSchema);
    const { category_key, language = 'en', content, is_complete = false, row_number } = data;

    // Check if entry already exists
    const { data: existing } = await supabase
      .from('werbeflaechen_entries')
      .select('id')
      .eq('user_id', user.id)
      .eq('language', language)
      .eq('category_key', category_key)
      .single();

    let result;

    if (existing) {
      // Update existing entry
      result = await supabase
        .from('werbeflaechen_entries')
        .update({
          content,
          is_complete,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      // Create new entry
      result = await supabase
        .from('werbeflaechen_entries')
        .insert({
          user_id: user.id,
          category_key,
          language,
          row_number: row_number || 1,
          content,
          is_complete,
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
    console.error('Werbeflaechen POST error:', error);
    return errorResponse(error);
  }
}
