import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractReferenceData } from '@/lib/ai/gemini';

// POST /api/references/analyze - Analyze reference document and extract data
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf'
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload JPG, PNG, WebP, or PDF.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract reference data using Gemini Vision API
    let extractionResult;
    try {
      extractionResult = await extractReferenceData(buffer, file.type);
    } catch (aiError) {
      console.error('AI extraction error:', aiError);

      // Provide specific error message based on error type
      let errorMessage = 'Could not analyze document.';
      if (aiError instanceof Error) {
        if (aiError.message.includes('quota')) {
          errorMessage = 'AI service quota exceeded. Please try again later.';
        } else if (aiError.message.includes('timeout')) {
          errorMessage = 'Analysis timed out. The document may be too large or complex.';
        } else if (aiError.message.includes('JSON')) {
          errorMessage = 'Failed to parse AI response. The document format may be unsupported.';
        } else {
          errorMessage = `AI analysis error: ${aiError.message}`;
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          extractedData: {
            name: null,
            title: null,
            company: null,
            relationship: null,
            email: null,
            phone: null,
            quote: null,
          },
          confidence: {
            name: 0,
            title: 0,
            company: 0,
            relationship: 0,
            email: 0,
            phone: 0,
            quote: 0,
          },
        },
        { status: 200 } // Not an error - return empty data for manual entry
      );
    }

    return NextResponse.json({
      extractedData: extractionResult.extractedData,
      confidence: extractionResult.confidence,
    });

  } catch (error) {
    console.error('Analysis endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
