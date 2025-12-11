import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { errorResponse } from '@/lib/api-utils';
import mammoth from 'mammoth';

// POST /api/cv-upload - Upload and extract text from a CV file
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
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
      'application/pdf',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOCX, or TXT files.' },
        { status: 400 }
      );
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    // Determine file type
    let fileType = 'txt';
    if (file.type === 'application/pdf') {
      fileType = 'pdf';
    } else if (file.type.includes('wordprocessingml')) {
      fileType = 'docx';
    }

    // Extract text based on file type
    let extractedText = '';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (fileType === 'txt') {
      extractedText = buffer.toString('utf-8');
    } else if (fileType === 'pdf') {
      // For PDF, we'll use a simple text extraction
      // In production, you might want to use pdf-parse or similar
      extractedText = await extractTextFromPDF(buffer);
    } else if (fileType === 'docx') {
      // For DOCX, extract text
      extractedText = await extractTextFromDOCX(buffer);
    }

    if (!extractedText || extractedText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract sufficient text from the file. Please try pasting the text directly.' },
        { status: 400 }
      );
    }

    // Store the upload record
    const { data: uploadRecord, error: insertError } = await supabase
      .from('uploaded_cvs')
      .insert({
        user_id: user.id,
        filename: file.name,
        file_type: fileType,
        file_size: file.size,
        extracted_text: extractedText,
        status: 'completed',
        extraction_metadata: {
          extractedAt: new Date().toISOString(),
          charCount: extractedText.length,
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing upload record:', insertError);
      // Continue anyway - the extraction worked
    }

    return NextResponse.json({
      success: true,
      uploadId: uploadRecord?.id,
      extractedText,
      filename: file.name,
      charCount: extractedText.length,
    });
  } catch (error) {
    console.error('CV upload error:', error);
    return errorResponse(error);
  }
}

// PDF text extraction using unpdf (serverless-compatible)
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const { extractText } = await import('unpdf');
    // unpdf requires Uint8Array, not Buffer
    const uint8Array = new Uint8Array(buffer);
    const result = await extractText(uint8Array);

    // extractText returns { text: string[], totalPages } where each element is a page
    const textArray = result.text || [];

    // Process each page to preserve structure
    const processedPages = (Array.isArray(textArray) ? textArray : [String(textArray)])
      .map(pageText => formatExtractedText(pageText));

    // Join pages with clear separator
    return processedPages.join('\n\n---\n\n');
  } catch (error) {
    console.error('PDF parsing error:', error);
    return '';
  }
}

// Format extracted text to preserve structure (sections, bullets, numbers)
function formatExtractedText(text: string): string {
  let formatted = text
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

    // Preserve bullet points - normalize various bullet characters to •
    .replace(/^[\s]*[●○◦▪▸►‣⁃∙·]\s*/gm, '• ')
    .replace(/^[\s]*[-–—]\s+/gm, '• ')

    // Preserve numbered lists - normalize to "1. " format
    .replace(/^[\s]*(\d+)[.)]\s*/gm, '$1. ')
    .replace(/^[\s]*([a-z])[.)]\s*/gim, '   $1. ')

    // Detect section headers (lines in ALL CAPS or Title Case followed by newline)
    .replace(/^([A-Z][A-Z\s&]+)$/gm, '\n## $1\n')

    // Collapse multiple spaces (but preserve newlines)
    .replace(/[ \t]+/g, ' ')

    // Collapse more than 2 consecutive newlines to 2
    .replace(/\n{3,}/g, '\n\n')

    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .join('\n')

    // Remove empty lines at start/end
    .trim();

  return formatted;
}

// DOCX text extraction using mammoth library
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });

    // mammoth returns the text content with some structure preserved
    const text = result.value || '';

    // Apply the same formatting to preserve structure
    return formatExtractedText(text);
  } catch (error) {
    console.error('DOCX parsing error:', error);
    return '';
  }
}

// GET /api/cv-upload - Get user's uploaded CVs
export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: uploads, error } = await supabase
      .from('uploaded_cvs')
      .select('id, filename, file_type, file_size, status, created_at, extraction_metadata')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching uploads:', error);
      return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 });
    }

    return NextResponse.json({ uploads: uploads || [] });
  } catch (error) {
    console.error('CV upload GET error:', error);
    return errorResponse(error);
  }
}
