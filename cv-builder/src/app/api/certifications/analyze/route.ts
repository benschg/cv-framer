import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractCertificationData } from '@/lib/ai/gemini';
import { uploadCertificationDocument } from '@/services/profile-career.service';

// POST /api/certifications/analyze - Analyze certification document and extract data
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
    const certificationId = formData.get('certificationId') as string | null;

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

    // Upload to storage first (prevents data loss if AI fails)
    let documentUrl: string | undefined;
    let storagePath: string | undefined;

    if (certificationId) {
      const uploadResult = await uploadCertificationDocument(
        user.id,
        certificationId,
        file
      );

      if (uploadResult.error) {
        console.error('Storage upload error:', uploadResult.error);
        // Continue with analysis even if upload fails
      } else {
        documentUrl = uploadResult.data?.url;
        storagePath = uploadResult.data?.path;
      }
    }

    // Extract certification data using Gemini Vision API
    let extractionResult;
    try {
      extractionResult = await extractCertificationData(buffer, file.type);
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
            issuer: null,
            date: null,
            expiry_date: null,
            credential_id: null,
            url: null,
          },
          confidence: {
            name: 0,
            issuer: 0,
            date: 0,
            expiry_date: 0,
            credential_id: 0,
            url: 0,
          },
          documentUploaded: !!documentUrl,
          documentUrl,
          storagePath,
          documentName: file.name,
        },
        { status: 200 } // Not an error - return empty data for manual entry
      );
    }

    return NextResponse.json({
      extractedData: extractionResult.extractedData,
      confidence: extractionResult.confidence,
      documentUploaded: !!documentUrl,
      documentUrl,
      storagePath,
      documentName: file.name,
    });

  } catch (error) {
    console.error('Analysis endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
