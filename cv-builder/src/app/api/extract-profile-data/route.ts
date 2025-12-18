import { NextRequest, NextResponse } from 'next/server';

import { extractProfileData } from '@/lib/ai/gemini';
import { createClient } from '@/lib/supabase/server';

// POST /api/extract-profile-data - Extract profile data from CV document
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF files are supported.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      return NextResponse.json(
        { error: `File too large (${sizeMB}MB). Maximum size is 10MB.` },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract profile data using Gemini Vision API
    let extractionResult;
    try {
      extractionResult = await extractProfileData(buffer, file.type);
    } catch (aiError) {
      console.error('AI extraction error:', aiError);

      // Provide specific error message based on error type
      let errorMessage = 'Could not analyze CV.';
      if (aiError instanceof Error) {
        if (aiError.message.includes('quota')) {
          errorMessage = 'AI service quota exceeded. Please try again later.';
        } else if (aiError.message.includes('timeout')) {
          errorMessage = 'Analysis timed out. The CV may be too large or complex.';
        } else if (aiError.message.includes('JSON')) {
          errorMessage = 'Failed to parse AI response. The CV format may be unsupported.';
        } else {
          errorMessage = `AI analysis error: ${aiError.message}`;
        }
      }

      // Return empty data for manual entry
      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          extractedData: {
            motivationVision: {},
            highlights: [],
            projects: [],
          },
          confidence: {
            motivationVision: 0,
            highlights: 0,
            projects: 0,
          },
          sectionCounts: {
            motivationVision: 0,
            highlights: 0,
            projects: 0,
          },
          reasoning: 'Extraction failed',
        },
        { status: 200 } // Not an error - return empty data for manual entry
      );
    }

    // Return extracted data with success flag
    return NextResponse.json({
      success: true,
      ...extractionResult,
    });
  } catch (error) {
    console.error('Profile data extraction endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
