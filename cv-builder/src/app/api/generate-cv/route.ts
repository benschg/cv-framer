import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBody, errorResponse } from '@/lib/api-utils';
import { GenerateCVSchema, type GenerateCVInput } from '@/types/api.schemas';
import {
  generateCVContent,
  analyzeJobPosting,
  type CompanyResearchResult,
} from '@/lib/ai/gemini';

// POST /api/generate-cv - Generate CV content using AI
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const data = await validateBody(request, GenerateCVSchema);
    const {
      cv_id,
      language = 'en',
      sections,
      job_context,
      analyze_job_posting = true,
    } = data;

    // Fetch werbeflaechen data for the user
    const { data: werbeflaechenEntries, error: wfError } = await supabase
      .from('werbeflaechen_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('language', language);

    if (wfError) {
      console.error('Error fetching werbeflaechen:', wfError);
      return NextResponse.json(
        { error: 'Failed to fetch werbeflaechen data' },
        { status: 500 }
      );
    }

    // Transform werbeflaechen entries into a structured object
    const werbeflaechenData: Record<string, unknown> = {};
    for (const entry of werbeflaechenEntries || []) {
      werbeflaechenData[entry.category_key] = entry.content;
    }

    // Analyze job posting if provided
    let companyResearch: CompanyResearchResult | undefined;
    if (analyze_job_posting && job_context?.jobPosting) {
      try {
        companyResearch = await analyzeJobPosting(
          job_context.jobPosting,
          job_context.company,
          job_context.position
        );
      } catch (error) {
        console.error('Error analyzing job posting:', error);
        // Continue without company research
      }
    }

    // Generate CV content
    const generatedContent = await generateCVContent(
      werbeflaechenData,
      {
        company: job_context?.company,
        position: job_context?.position,
        jobPosting: job_context?.jobPosting,
        companyResearch,
      },
      language as 'en' | 'de',
      sections
    );

    // If a CV ID was provided, update the CV with the generated content
    if (cv_id) {
      // Fetch existing CV
      const { data: existingCV, error: cvError } = await supabase
        .from('cv_documents')
        .select('content, job_context')
        .eq('id', cv_id)
        .eq('user_id', user.id)
        .single();

      if (cvError) {
        console.error('Error fetching CV:', cvError);
        return NextResponse.json({ error: 'CV not found' }, { status: 404 });
      }

      // Merge generated content with existing content
      const mergedContent = {
        ...existingCV.content,
        ...generatedContent,
      };

      // Update job context with company research if available
      const updatedJobContext = {
        ...existingCV.job_context,
        ...job_context,
        companyResearch,
      };

      // Update the CV
      const { error: updateError } = await supabase
        .from('cv_documents')
        .update({
          content: mergedContent,
          job_context: updatedJobContext,
          ai_metadata: {
            model: 'gemini-2.0-flash',
            promptVersion: '1.0',
            generatedAt: new Date().toISOString(),
            sectionsGenerated: sections || ['tagline', 'profile', 'keyCompetences'],
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', cv_id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating CV:', updateError);
        return NextResponse.json(
          { error: 'Failed to update CV' },
          { status: 500 }
        );
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
    console.error('Generate CV error:', error);
    return errorResponse(error);
  }
}
