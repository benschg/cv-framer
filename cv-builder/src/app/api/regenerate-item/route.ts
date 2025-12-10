import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { regenerateSection, generateExperienceBullets, CompanyResearchResult } from '@/lib/ai/gemini';

// POST /api/regenerate-item - Regenerate a single CV section or item
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      cv_id,
      section,
      current_content,
      custom_instructions,
      language = 'en',
      // For experience bullets
      experience_context,
    } = body;

    if (!section) {
      return NextResponse.json({ error: 'Section is required' }, { status: 400 });
    }

    // Fetch werbeflaechen data for the user
    const { data: werbeflaechenEntries, error: wfError } = await supabase
      .from('werbeflaechen_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('language', language);

    if (wfError) {
      console.error('Error fetching werbeflaechen:', wfError);
    }

    // Transform werbeflaechen entries
    const werbeflaechenData: Record<string, unknown> = {};
    for (const entry of werbeflaechenEntries || []) {
      werbeflaechenData[entry.category_key] = entry.content;
    }

    // Fetch CV job context if cv_id provided
    let jobContext: {
      company?: string;
      position?: string;
      companyResearch?: CompanyResearchResult;
    } | undefined;

    if (cv_id) {
      const { data: cv } = await supabase
        .from('cv_documents')
        .select('job_context')
        .eq('id', cv_id)
        .eq('user_id', user.id)
        .single();

      if (cv?.job_context) {
        const rawContext = cv.job_context as {
          company?: string;
          position?: string;
          companyResearch?: CompanyResearchResult;
        };
        jobContext = rawContext;
      }
    }

    let result: string | string[];

    // Handle experience bullets separately
    if (section === 'experience_bullets' && experience_context) {
      result = await generateExperienceBullets(
        experience_context.company,
        experience_context.title,
        experience_context.description || '',
        werbeflaechenData,
        {
          requiredSkills: jobContext?.companyResearch?.role?.requiredSkills,
          keywords: jobContext?.companyResearch?.role?.keywords,
        },
        language as 'en' | 'de'
      );
    } else {
      // Regenerate a text section
      result = await regenerateSection(
        section,
        current_content || '',
        werbeflaechenData,
        jobContext,
        custom_instructions,
        language as 'en' | 'de'
      );
    }

    return NextResponse.json({
      section,
      content: result,
      ai_metadata: {
        model: 'gemini-2.0-flash',
        regeneratedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Regenerate item error:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate content' },
      { status: 500 }
    );
  }
}
