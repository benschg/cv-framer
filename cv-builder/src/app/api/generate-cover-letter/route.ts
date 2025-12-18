import { NextRequest, NextResponse } from 'next/server';

import { analyzeJobPosting,generateCoverLetter } from '@/lib/ai/gemini';
import { errorResponse,validateBody } from '@/lib/api-utils';
import { createClient } from '@/lib/supabase/server';
import { type GenerateCoverLetterInput,GenerateCoverLetterSchema } from '@/types/api.schemas';

// POST /api/generate-cover-letter - Generate cover letter content using AI
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
    const data = await validateBody(request, GenerateCoverLetterSchema);
    const { cover_letter_id, cv_id, language = 'en', job_context } = data;

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

    // Fetch CV content if cv_id provided
    let cvContent: Record<string, unknown> | undefined;
    if (cv_id) {
      const { data: cv } = await supabase
        .from('cv_documents')
        .select('content, job_context')
        .eq('id', cv_id)
        .eq('user_id', user.id)
        .single();

      if (cv?.content) {
        cvContent = cv.content;
      }
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('first_name, last_name, email, phone')
      .eq('user_id', user.id)
      .single();

    // Analyze job posting if provided
    let companyResearch;
    if (job_context?.jobPosting) {
      try {
        companyResearch = await analyzeJobPosting(
          job_context.jobPosting,
          job_context.company,
          job_context.position
        );
      } catch (err) {
        console.error('Error analyzing job posting:', err);
      }
    }

    // Generate cover letter content
    const generatedContent = await generateCoverLetter(
      werbeflaechenData,
      cvContent,
      {
        company: job_context?.company,
        position: job_context?.position,
        companyResearch,
      },
      profile
        ? {
            firstName: profile.first_name,
            lastName: profile.last_name,
            email: profile.email,
            phone: profile.phone,
          }
        : undefined,
      language as 'en' | 'de'
    );

    // If cover_letter_id provided, update it
    if (cover_letter_id) {
      const { error: updateError } = await supabase
        .from('cover_letters')
        .update({
          content: generatedContent,
          ai_metadata: {
            model: 'gemini-2.0-flash',
            promptVersion: '1.0',
            generatedAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', cover_letter_id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating cover letter:', updateError);
      }
    }

    return NextResponse.json({
      content: generatedContent,
      companyResearch,
      ai_metadata: {
        model: 'gemini-2.0-flash',
        promptVersion: '1.0',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Generate cover letter error:', error);
    return errorResponse(error);
  }
}
