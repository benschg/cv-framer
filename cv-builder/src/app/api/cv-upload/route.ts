import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    return NextResponse.json(
      { error: 'Failed to process uploaded file' },
      { status: 500 }
    );
  }
}

// Simple PDF text extraction (basic implementation)
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Basic PDF text extraction - looks for text between stream markers
  // This is a simplified approach; for production use pdf-parse library
  const content = buffer.toString('latin1');

  // Try to find text content in the PDF
  const textParts: string[] = [];

  // Look for text in BT...ET blocks (PDF text objects)
  const btEtRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;

  while ((match = btEtRegex.exec(content)) !== null) {
    const block = match[1];
    // Extract strings in parentheses (literal strings) and hex strings
    const stringRegex = /\(([^)]*)\)|<([0-9A-Fa-f]+)>/g;
    let stringMatch;

    while ((stringMatch = stringRegex.exec(block)) !== null) {
      if (stringMatch[1]) {
        // Literal string - decode escape sequences
        const decoded = stringMatch[1]
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\\(/g, '(')
          .replace(/\\\)/g, ')')
          .replace(/\\\\/g, '\\');
        textParts.push(decoded);
      } else if (stringMatch[2]) {
        // Hex string
        const hex = stringMatch[2];
        let decoded = '';
        for (let i = 0; i < hex.length; i += 2) {
          decoded += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        }
        textParts.push(decoded);
      }
    }
  }

  // Also try to find FlateDecode streams (compressed content)
  // This is very basic - real PDF parsing would decompress these

  // Clean up and join
  let text = textParts.join(' ');

  // Clean up common artifacts
  text = text
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
    .trim();

  // If we got very little text, the PDF might be image-based
  if (text.length < 100) {
    return ''; // Return empty to trigger error message
  }

  return text;
}

// Simple DOCX text extraction
async function extractTextFromDOCX(buffer: Buffer): Promise<string> {
  // DOCX is a ZIP file containing XML
  // We'll look for the document.xml content

  try {
    // Find PK signature (ZIP file)
    const pkIndex = buffer.indexOf('PK');
    if (pkIndex === -1) {
      return '';
    }

    // Convert to string and look for text content
    const content = buffer.toString('utf-8');

    // Extract text from <w:t> tags (Word text elements)
    const textParts: string[] = [];
    const textRegex = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let match;

    while ((match = textRegex.exec(content)) !== null) {
      if (match[1]) {
        textParts.push(match[1]);
      }
    }

    // Also look for text without namespace prefix
    const altTextRegex = /<t[^>]*>([^<]*)<\/t>/g;
    while ((match = altTextRegex.exec(content)) !== null) {
      if (match[1] && !match[1].includes('<')) {
        textParts.push(match[1]);
      }
    }

    return textParts.join(' ').replace(/\s+/g, ' ').trim();
  } catch {
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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
