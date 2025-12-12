import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { errorResponse } from '@/lib/api-utils';
import { parseJobPostingUrl } from '@/lib/ai/gemini';
import { z } from 'zod';

const ParseJobUrlSchema = z.object({
  url: z.string().url('Invalid URL format'),
});

// POST /api/parse-job-url - Parse a job posting URL and extract information
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate request body
    const body = await request.json();
    const parseResult = ParseJobUrlSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { url } = parseResult.data;

    // Fetch the job posting page content
    let pageContent: string;
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
          { status: 400 }
        );
      }

      pageContent = await response.text();
    } catch (fetchError) {
      console.error('Error fetching URL:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch the job posting URL. Please paste the job description manually.' },
        { status: 400 }
      );
    }

    // Parse the job posting using AI
    const result = await parseJobPostingUrl(pageContent, url);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Parse job URL error:', error);
    return errorResponse(error);
  }
}
