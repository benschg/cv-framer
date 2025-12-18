import { NextRequest, NextResponse } from 'next/server';

import { generateJSON } from '@/lib/ai/gemini';
import { errorResponse } from '@/lib/api-utils';
import { createClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface FitAnalysisResult {
  overall_score: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
  summary: string;
}

// POST /api/applications/[id]/analyze - Analyze job fit
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the application with its details
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (appError) {
      if (appError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      console.error('Error fetching application:', appError);
      return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
    }

    if (!application.job_description) {
      return NextResponse.json(
        { error: 'No job description available to analyze' },
        { status: 400 }
      );
    }

    // Fetch user's werbeflaechen data for context
    const { data: werbeflaechenData } = await supabase
      .from('werbeflaechen_entries')
      .select('category_key, content')
      .eq('user_id', user.id);

    // Fetch user's CV data if linked
    let cvContent = null;
    if (application.cv_id) {
      const { data: cv } = await supabase
        .from('cv_documents')
        .select('content')
        .eq('id', application.cv_id)
        .single();
      cvContent = cv?.content;
    }

    // Generate the fit analysis using AI
    const prompt = `You are an expert job fit analyst. Analyze how well a candidate matches a job posting.

Job Details:
- Company: ${application.company_name}
- Position: ${application.job_title}
- Description: ${application.job_description}
${application.location ? `- Location: ${application.location}` : ''}

Candidate Profile Data:
${
  werbeflaechenData
    ? JSON.stringify(
        werbeflaechenData.reduce(
          (acc, entry) => {
            acc[entry.category_key] = entry.content;
            return acc;
          },
          {} as Record<string, unknown>
        ),
        null,
        2
      )
    : 'No profile data available'
}

${
  cvContent
    ? `
Candidate CV Content:
${JSON.stringify(cvContent, null, 2)}
`
    : ''
}

Analyze the fit between this candidate and the job. Return a JSON object with:
{
  "overall_score": <number 0-100, where 100 is perfect fit>,
  "strengths": ["strength 1", "strength 2", ...], // 3-5 key strengths relevant to this role
  "gaps": ["gap 1", "gap 2", ...], // 2-4 areas where candidate may fall short
  "recommendations": ["recommendation 1", ...], // 3-5 actionable suggestions to improve fit
  "summary": "A brief 2-3 sentence summary of the overall fit assessment"
}

Guidelines:
- Be objective and constructive
- Focus on specific, relevant matches and gaps
- Provide actionable recommendations
- Consider both hard skills and soft skills
- Score should reflect realistic chances in competitive hiring`;

    const analysisResult = await generateJSON<FitAnalysisResult>(prompt);

    // Upsert the analysis into job_fit_analyses table
    const { data: fitAnalysis, error: upsertError } = await supabase
      .from('job_fit_analyses')
      .upsert(
        {
          application_id: id,
          overall_score: analysisResult.overall_score,
          strengths: analysisResult.strengths,
          gaps: analysisResult.gaps,
          recommendations: analysisResult.recommendations,
          summary: analysisResult.summary,
          raw_analysis: analysisResult,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'application_id',
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error('Error saving fit analysis:', upsertError);
      return NextResponse.json({ error: 'Failed to save fit analysis' }, { status: 500 });
    }

    return NextResponse.json({ fitAnalysis });
  } catch (error) {
    console.error('Application analyze error:', error);
    return errorResponse(error);
  }
}

// GET /api/applications/[id]/analyze - Get existing fit analysis
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user owns this application
    const { data: application, error: appError } = await supabase
      .from('job_applications')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Fetch the fit analysis
    const { data: fitAnalysis, error } = await supabase
      .from('job_fit_analyses')
      .select('*')
      .eq('application_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ fitAnalysis: null });
      }
      console.error('Error fetching fit analysis:', error);
      return NextResponse.json({ error: 'Failed to fetch fit analysis' }, { status: 500 });
    }

    return NextResponse.json({ fitAnalysis });
  } catch (error) {
    console.error('Fit analysis GET error:', error);
    return errorResponse(error);
  }
}
